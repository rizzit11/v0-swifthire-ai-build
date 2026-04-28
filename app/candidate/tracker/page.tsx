import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/tracker/kanban-board"
import type { TrackerCardData } from "@/components/tracker/tracker-card"

export const dynamic = "force-dynamic"

export default async function TrackerPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("job_tracker")
    .select(
      "id, candidate_id, status, position, job_data, updated_at, created_at",
    )
    .order("status", { ascending: true })
    .order("position", { ascending: true })

  const cards = (data ?? []) as TrackerCardData[]

  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Application tracker
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Your job pipeline
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Drag cards between columns to update status. Positions use fractional
          indexing — moving one card never reshuffles its neighbours, so big
          boards stay snappy.
        </p>
      </header>

      <KanbanBoard initial={cards} />
    </div>
  )
}
