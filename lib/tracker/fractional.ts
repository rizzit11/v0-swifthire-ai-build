/**
 * Fractional positioning for Kanban drag-and-drop.
 *
 * Every card gets a DOUBLE PRECISION `position`. Moving a card only ever
 * rewrites ONE row — the moved card — by placing it at the midpoint of its
 * neighbors. This prevents the classic "touched 50 rows on every drag"
 * thrash and keeps reorder latency O(1) regardless of column size.
 */

const STEP = 1024

/** Position for the very first card in an empty column. */
export const FIRST_POSITION = STEP

/** Append a new card at the end (> any existing position). */
export function appendPosition(last: number | undefined): number {
  if (last == null || !Number.isFinite(last)) return FIRST_POSITION
  return last + STEP
}

/** Prepend at the top of the column. */
export function prependPosition(first: number | undefined): number {
  if (first == null || !Number.isFinite(first)) return FIRST_POSITION
  return first / 2
}

/**
 * Compute a position that sorts strictly between `before` and `after`.
 * If either is undefined, it's treated as "edge of column".
 *
 * If the two neighbors become so close that float precision would collapse
 * the midpoint, the caller MUST trigger a cheap rebalance. We signal that
 * by throwing, because silently returning `before` would corrupt ordering.
 */
export function midPosition(
  before: number | undefined,
  after: number | undefined,
): number {
  if (before == null && after == null) return FIRST_POSITION
  if (before == null) return prependPosition(after)
  if (after == null) return appendPosition(before)

  const mid = (before + after) / 2
  if (!Number.isFinite(mid) || mid <= before || mid >= after) {
    throw new Error("fractional: precision collapsed; rebalance column")
  }
  return mid
}
