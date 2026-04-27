"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { track } from "@/lib/analytics/posthog"
import { TrackerCard, type TrackerCardData } from "./tracker-card"
import { AddCardDialog } from "./add-card-dialog"

const STATUSES = [
  { id: "wishlist", label: "Wishlist", accent: "text-text-secondary" },
  { id: "applied", label: "Applied", accent: "text-secondary" },
  { id: "interviewing", label: "Interviewing", accent: "text-primary-glow" },
  { id: "offer", label: "Offer", accent: "text-accent" },
  { id: "rejected", label: "Rejected", accent: "text-danger" },
] as const

type Status = (typeof STATUSES)[number]["id"]

export interface KanbanBoardProps {
  initial: TrackerCardData[]
}

/**
 * @dnd-kit board with one sortable list per status column.
 * - We optimistically reorder client-side, then PATCH /api/tracker/[id].
 * - The server uses fractional indexing — only the dragged row is
 *   rewritten, even when crossing columns.
 * - On error we revert to the previous snapshot so the UI never lies.
 */
export function KanbanBoard({ initial }: KanbanBoardProps) {
  const [cards, setCards] = useState<TrackerCardData[]>(initial)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<Status | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Pre-bucket cards by status for fast renders during drag.
  const columns = useMemo(() => {
    const out: Record<Status, TrackerCardData[]> = {
      wishlist: [],
      applied: [],
      interviewing: [],
      offer: [],
      rejected: [],
    }
    for (const c of cards) {
      out[c.status as Status]?.push(c)
    }
    for (const k of Object.keys(out) as Status[]) {
      out[k].sort((a, b) => a.position - b.position)
    }
    return out
  }, [cards])

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null

  function findContainer(id: string): Status | null {
    if ((STATUSES as readonly { id: string }[]).some((s) => s.id === id)) {
      return id as Status
    }
    const card = cards.find((c) => c.id === id)
    return (card?.status as Status) ?? null
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)
    const fromStatus = findContainer(activeIdStr)
    const toStatus = findContainer(overIdStr)
    if (!fromStatus || !toStatus) return

    // Compute the destination position client-side first.
    const movedCard = cards.find((c) => c.id === activeIdStr)
    if (!movedCard) return
    const previous = cards

    // Build the new ordered column.
    const targetColumn = previous
      .filter((c) => c.status === toStatus && c.id !== activeIdStr)
      .sort((a, b) => a.position - b.position)

    let insertIndex = targetColumn.length
    if (overIdStr !== toStatus) {
      const overIndex = targetColumn.findIndex((c) => c.id === overIdStr)
      if (overIndex >= 0) insertIndex = overIndex
    }

    const beforeId = targetColumn[insertIndex - 1]?.id ?? null
    const afterId = targetColumn[insertIndex]?.id ?? null

    // Optimistic update — give the card a midpoint position.
    const beforePos = targetColumn[insertIndex - 1]?.position
    const afterPos = targetColumn[insertIndex]?.position
    const optimisticPos =
      beforePos != null && afterPos != null
        ? (beforePos + afterPos) / 2
        : afterPos != null
          ? afterPos / 2
          : beforePos != null
            ? beforePos + 1024
            : 1024

    const optimisticCards = previous.map((c) =>
      c.id === activeIdStr
        ? { ...c, status: toStatus, position: optimisticPos }
        : c,
    )

    // Same-column reorder via arrayMove for nicer animations.
    if (fromStatus === toStatus && overIdStr !== toStatus) {
      const sourceIds = previous
        .filter((c) => c.status === toStatus)
        .sort((a, b) => a.position - b.position)
        .map((c) => c.id)
      const oldIndex = sourceIds.indexOf(activeIdStr)
      const newIndex = sourceIds.indexOf(overIdStr)
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedIds = arrayMove(sourceIds, oldIndex, newIndex)
        // Spread the column evenly using the optimistic positions
        // computed above; the server will overwrite with a true midpoint.
        const stride = 1024
        for (let i = 0; i < reorderedIds.length; i++) {
          const id = reorderedIds[i]
          const next = optimisticCards.find((c) => c.id === id)
          if (next) next.position = (i + 1) * stride
        }
      }
    }

    setCards(optimisticCards)

    try {
      const res = await fetch(`/api/tracker/${activeIdStr}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          move: {
            status: toStatus,
            beforeId,
            afterId,
          },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Move failed")
      const { card } = (await res.json()) as { card: TrackerCardData }
      // Reconcile against the server's authoritative position.
      setCards((curr) => curr.map((c) => (c.id === card.id ? card : c)))
      track("tracker_card_moved", {
        from: fromStatus,
        to: toStatus,
        cardId: activeIdStr,
      })
    } catch (err) {
      setCards(previous)
      toast.error(err instanceof Error ? err.message : "Move failed")
    }
  }

  async function handleCreate(
    status: Status,
    payload: TrackerCardData["job_data"],
  ) {
    const res = await fetch("/api/tracker", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, job_data: payload }),
    })
    if (!res.ok) {
      toast.error((await res.json()).error ?? "Couldn't add card")
      return
    }
    const { card } = (await res.json()) as { card: TrackerCardData }
    setCards((curr) => [...curr, card])
    setAddingTo(null)
    track("job_saved_to_tracker", { status })
    toast.success("Added to tracker")
  }

  async function handleDelete(id: string) {
    const previous = cards
    setCards((curr) => curr.filter((c) => c.id !== id))
    const res = await fetch(`/api/tracker/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setCards(previous)
      toast.error("Couldn't delete card")
    }
  }

  // Auto-clear the activeId if React unmounts mid-drag.
  useEffect(
    () => () => {
      setActiveId(null)
    },
    [],
  )

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {STATUSES.map((s) => (
            <Column
              key={s.id}
              id={s.id}
              label={s.label}
              accent={s.accent}
              cards={columns[s.id]}
              onAdd={() => setAddingTo(s.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className="rotate-1">
              <TrackerCard card={activeCard} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddCardDialog
        open={addingTo !== null}
        status={addingTo}
        onOpenChange={(open) => !open && setAddingTo(null)}
        onSubmit={(payload) => addingTo && handleCreate(addingTo, payload)}
      />
    </>
  )
}

function Column({
  id,
  label,
  accent,
  cards,
  onAdd,
  onDelete,
}: {
  id: Status
  label: string
  accent: string
  cards: TrackerCardData[]
  onAdd: () => void
  onDelete: (id: string) => void
}) {
  return (
    <section
      aria-label={`${label} column`}
      className="glass ring-inset-highlight flex min-h-[280px] flex-col gap-2 rounded-2xl p-3"
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.2em]",
              accent,
            )}
          >
            {label}
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {cards.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add card to ${label}`}
          className="rounded-md p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
      </header>

      <SortableContext
        id={id}
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[60px] flex-1 flex-col gap-2">
          {cards.length === 0 ? (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border bg-white/[0.012] p-4 text-center">
              <span className="text-[11px] text-text-muted">Drop cards here</span>
            </div>
          ) : null}
          {cards.map((c) => (
            <SortableCard key={c.id} card={c} onDelete={() => onDelete(c.id)} />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableCard({
  card,
  onDelete,
}: {
  card: TrackerCardData
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TrackerCard card={card} onDelete={onDelete} />
    </div>
  )
}
