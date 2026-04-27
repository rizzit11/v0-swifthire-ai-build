import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { normalizeJobQuery, sha256Hex } from "@/lib/utils/hash"
import { fetchJSearch, mockJSearch, type JSearchJob } from "@/lib/jobs/jsearch"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const querySchema = z.object({
  query: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).max(20).optional(),
  remote_only: z
    .union([z.literal("1"), z.literal("0"), z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "1" || v === "true"),
})

/** Cache TTL: 12 hours. Aligns with JSearch's freshness guarantees. */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

/**
 * GET /api/jobs/search?query=...&location=...&page=1&remote_only=1
 *
 * Two-layer protection for the upstream:
 *   1) Auth gate — only signed-in candidates can hit the proxy.
 *   2) Supabase-backed 12h cache keyed on a normalized query hash.
 *
 * Falls back to a deterministic mock when RAPIDAPI_JSEARCH_KEY isn't set,
 * so previews stay functional and zero-cost.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    query: url.searchParams.get("query") ?? "",
    location: url.searchParams.get("location") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    remote_only: url.searchParams.get("remote_only") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const normalized = normalizeJobQuery(parsed.data)
  const queryHash = await sha256Hex(normalized)

  // Check cache.
  const { data: cached } = await supabase
    .from("job_search_cache")
    .select("results, created_at")
    .eq("query_hash", queryHash)
    .maybeSingle()

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime()
    if (age < CACHE_TTL_MS) {
      return NextResponse.json({
        cached: true,
        ageMs: age,
        results: cached.results as JSearchJob[],
      })
    }
  }

  // Cache miss or stale — go to upstream (or mock).
  let results: JSearchJob[]
  let source: "live" | "mock" = "live"
  try {
    const upstream = await fetchJSearch(parsed.data)
    if (upstream) {
      results = upstream
    } else {
      source = "mock"
      results = mockJSearch(parsed.data)
    }
  } catch (err) {
    // If JSearch is down, prefer stale cache over a hard error.
    if (cached) {
      return NextResponse.json({
        cached: true,
        stale: true,
        ageMs: Date.now() - new Date(cached.created_at).getTime(),
        results: cached.results as JSearchJob[],
      })
    }
    return NextResponse.json(
      {
        error: "Job search unavailable",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 502 },
    )
  }

  // Upsert the cache row. We don't `.select()` back because the client
  // already has `results` in memory.
  await supabase
    .from("job_search_cache")
    .upsert(
      {
        query_hash: queryHash,
        results,
        created_at: new Date().toISOString(),
      },
      { onConflict: "query_hash" },
    )

  return NextResponse.json({
    cached: false,
    source,
    results,
  })
}
