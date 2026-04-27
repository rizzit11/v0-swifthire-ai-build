import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import {
  appendPosition,
  FIRST_POSITION,
  midPosition,
  prependPosition,
} from "@/lib/tracker/fractional"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const STATUSES = [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const

const moveSchema = z.object({
  status: z.enum(STATUSES),
  /** Card id immediately above the drop target (null = top of column). */
  beforeId: z.string().uuid().nullable().optional(),
  /** Card id immediately below the drop target (null = bottom of column). */
  afterId: z.string().uuid().nullable().optional(),
})

const patchSchema = z.object({
  job_data: z
    .object({
      title: z.string().min(1).max(200).optional(),
      company: z.string().max(200).optional(),
      location: z.string().max(200).optional(),
      url: z.string().url().optional(),
      notes: z.string().max(2000).optional(),
      external_id: z.string().max(200).optional(),
    })
    .optional(),
  move: moveSchema.optional(),
})

/**
 * PATCH /api/tracker/[id]
 * Two operations:
 *   1) `move`: place this card between the given neighbours in (maybe) a
 *      new column. Only this row's `position` + `status` are written —
 *      neighbours are untouched (fractional indexing).
 *   2) `job_data`: edit the card body (title / company / notes / etc).
 *
 * RLS guarantees the candidate can only mutate their own cards.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const json = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const update: Record<string, unknown> = {}

  if (parsed.data.job_data) {
    // Merge against the existing job_data so partial edits don't wipe fields.
    const { data: existing } = await supabase
      .from("job_tracker")
      .select("job_data")
      .eq("id", id)
      .eq("candidate_id", user.id)
      .maybeSingle()

    update.job_data = {
      ...(existing?.job_data ?? {}),
      ...parsed.data.job_data,
    }
  }

  if (parsed.data.move) {
    const { status, beforeId, afterId } = parsed.data.move

    const ids = [beforeId, afterId].filter((x): x is string => !!x)
    let beforePos: number | undefined
    let afterPos: number | undefined

    if (ids.length) {
      const { data: neighbours } = await supabase
        .from("job_tracker")
        .select("id, position")
        .eq("candidate_id", user.id)
        .in("id", ids)

      const map = new Map(neighbours?.map((n) => [n.id, n.position] as const))
      if (beforeId) beforePos = map.get(beforeId)
      if (afterId) afterPos = map.get(afterId)
    }

    let newPosition: number
    try {
      if (beforePos == null && afterPos == null) {
        // Empty column — get tail to support pure-status moves.
        const { data: tail } = await supabase
          .from("job_tracker")
          .select("position")
          .eq("candidate_id", user.id)
          .eq("status", status)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle()
        newPosition = tail ? appendPosition(tail.position) : FIRST_POSITION
      } else if (beforePos == null) {
        newPosition = prependPosition(afterPos)
      } else if (afterPos == null) {
        newPosition = appendPosition(beforePos)
      } else {
        newPosition = midPosition(beforePos, afterPos)
      }
    } catch {
      // Float precision collapsed; rebalance the destination column. We
      // do this rarely (~1 in millions of moves) so the cost is acceptable.
      const { data: column } = await supabase
        .from("job_tracker")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("status", status)
        .order("position", { ascending: true })

      if (column?.length) {
        for (let i = 0; i < column.length; i++) {
          await supabase
            .from("job_tracker")
            .update({ position: (i + 1) * 1024 })
            .eq("id", column[i].id)
            .eq("candidate_id", user.id)
        }
      }
      newPosition = (column?.length ?? 0) * 1024 + 1024
    }

    update.status = status
    update.position = newPosition
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("job_tracker")
    .update(update)
    .eq("id", id)
    .eq("candidate_id", user.id)
    .select(
      "id, candidate_id, status, position, job_data, updated_at, created_at",
    )
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ card: data })
}

/**
 * DELETE /api/tracker/[id]
 * Hard delete the card; tracker entries are not first-class business
 * records so soft-delete here would be over-engineering.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("job_tracker")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
