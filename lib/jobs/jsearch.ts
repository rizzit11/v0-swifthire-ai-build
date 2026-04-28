import { z } from "zod"

/**
 * Trimmed JSearch result schema. We only persist the fields we render
 * + a couple of identifiers; the upstream payload contains 50+ keys we
 * don't need and would only inflate cache rows.
 */
export const jsearchJobSchema = z.object({
  job_id: z.string(),
  job_title: z.string().nullable().optional(),
  employer_name: z.string().nullable().optional(),
  employer_logo: z.string().nullable().optional(),
  employer_website: z.string().nullable().optional(),
  job_publisher: z.string().nullable().optional(),
  job_employment_type: z.string().nullable().optional(),
  job_apply_link: z.string().nullable().optional(),
  job_description: z.string().nullable().optional(),
  job_is_remote: z.boolean().nullable().optional(),
  job_posted_at_datetime_utc: z.string().nullable().optional(),
  job_city: z.string().nullable().optional(),
  job_state: z.string().nullable().optional(),
  job_country: z.string().nullable().optional(),
  job_min_salary: z.number().nullable().optional(),
  job_max_salary: z.number().nullable().optional(),
  job_salary_period: z.string().nullable().optional(),
  job_required_skills: z.array(z.string()).nullable().optional(),
})

export type JSearchJob = z.infer<typeof jsearchJobSchema>

const JSEARCH_HOST = "jsearch.p.rapidapi.com"

export interface JSearchQuery {
  query: string
  location?: string
  page?: number
  remote_only?: boolean
}

/**
 * Hit JSearch directly. Returns null if no API key is configured so
 * callers can fall back to a deterministic mock — the rest of the app
 * stays usable without a paid RapidAPI subscription.
 */
export async function fetchJSearch(
  q: JSearchQuery,
): Promise<JSearchJob[] | null> {
  const key = process.env.RAPIDAPI_JSEARCH_KEY
  if (!key) return null

  const params = new URLSearchParams()
  const fullQuery = q.location ? `${q.query} in ${q.location}` : q.query
  params.set("query", fullQuery)
  params.set("page", String(q.page ?? 1))
  params.set("num_pages", "1")
  if (q.remote_only) params.set("remote_jobs_only", "true")

  const res = await fetch(`https://${JSEARCH_HOST}/search?${params}`, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": JSEARCH_HOST,
    },
    // Don't double-cache at the fetch layer; we own the cache TTL.
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`JSearch ${res.status}`)
  }

  const json = await res.json()
  const list = Array.isArray(json?.data) ? json.data : []
  return list
    .map((item: unknown) => jsearchJobSchema.safeParse(item))
    .filter(
      (r: { success: boolean; data?: JSearchJob }): r is { success: true; data: JSearchJob } =>
        r.success,
    )
    .map((r: { data: JSearchJob }) => r.data)
}

/**
 * Deterministic mock results so the UX is fully functional in dev /
 * preview environments without a JSearch key.
 */
export function mockJSearch(q: JSearchQuery): JSearchJob[] {
  const seed = `${q.query}|${q.location ?? ""}|${q.page ?? 1}`
  const titles = [
    "Senior Frontend Engineer",
    "Staff Product Engineer",
    "Full-Stack Engineer (TypeScript)",
    "Backend Engineer — Platform",
    "AI Solutions Engineer",
    "Engineering Manager",
  ]
  const companies = [
    "Vercel",
    "Linear",
    "Anthropic",
    "Supabase",
    "Stripe",
    "Modal Labs",
  ]
  const locations = q.remote_only
    ? ["Remote (US)", "Remote (EMEA)", "Remote (Worldwide)"]
    : [q.location ?? "Remote", "San Francisco, CA", "New York, NY", "London, UK"]

  return Array.from({ length: 6 }).map((_, i) => ({
    job_id: `mock-${seed}-${i}`,
    job_title: `${titles[i % titles.length]} · ${q.query}`,
    employer_name: companies[i % companies.length],
    employer_logo: null,
    employer_website: null,
    job_publisher: "JSearch (mock)",
    job_employment_type: "FULLTIME",
    job_apply_link: "https://example.com/apply",
    job_description: `We're hiring a ${titles[i % titles.length]} to ${q.query.toLowerCase()}. This is a mock listing returned because RAPIDAPI_JSEARCH_KEY is not configured.`,
    job_is_remote: i % 2 === 0,
    job_posted_at_datetime_utc: new Date(
      Date.now() - i * 24 * 60 * 60 * 1000,
    ).toISOString(),
    job_city: locations[i % locations.length].split(",")[0],
    job_state: null,
    job_country: null,
    job_min_salary: 120000 + i * 8000,
    job_max_salary: 180000 + i * 8000,
    job_salary_period: "YEAR",
    job_required_skills: ["TypeScript", "React", "Node.js"].slice(0, 1 + (i % 3)),
  }))
}
