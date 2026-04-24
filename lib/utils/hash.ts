/**
 * Stable SHA-256 hex digest for arbitrary UTF-8 input.
 * Used as the cache key for JSearch queries.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest("SHA-256", data)
  const bytes = new Uint8Array(digest)
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0")
  }
  return out
}

/**
 * Normalize a JSearch query into a cache key. Keeps the cache hit rate
 * high by collapsing whitespace, casing, and argument order.
 */
export function normalizeJobQuery(params: {
  query: string
  location?: string
  page?: number
  remote_only?: boolean
}): string {
  const q = params.query.trim().toLowerCase().replace(/\s+/g, " ")
  const loc = (params.location ?? "").trim().toLowerCase()
  const page = params.page ?? 1
  const remote = params.remote_only ? "1" : "0"
  return `q=${q}|loc=${loc}|p=${page}|r=${remote}`
}
