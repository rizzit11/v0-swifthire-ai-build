import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { appendPosition, FIRST_POSITION } from "@/lib/tracker/fractional"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const STATUSES = [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const

const createSchema = z.object({
  status: z.enum(STATUSES),
  job_data: z.object({
    title: z.string().min(1).max(200),
    company: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    url: z.string().url().optional(),
    notes: z.string().max(2000).optional(),
    external_id: z.string().max(200).optional(),
  }),
})

/**
 * GET /api/tracker
 * Returns the candidate's full board, ordered by (status, position).
 * Cards are RLS-restricted to the calling candidate.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("job_tracker")
    .select("id, candidate_id, status, position, job_data, updated_at, created_at")
    .eq("candidate_id", user.id)
    .order("status", { ascending: true })
    .order("position", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cards: data ?? [] })
}

/**
 * POST /api/tracker
 * Append a card at the end of the requested column. We compute the
 * next fractional position from the current tail so the insert only
 * touches one row — no full-column reshuffle.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const json = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { data: tail } = await supabase
    .from("job_tracker")
    .select("position")
    .eq("candidate_id", user.id)
    .eq("status", parsed.data.status)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = tail ? appendPosition(tail.position) : FIRST_POSITION

  const { data, error } = await supabase
    .from("job_tracker")
    .insert({
      candidate_id: user.id,
      status: parsed.data.status,
      position,
      job_data: parsed.data.job_data,
    })
    .select(
      "id, candidate_id, status, position, job_data, updated_at, created_at",
    )
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ card: data })
}
