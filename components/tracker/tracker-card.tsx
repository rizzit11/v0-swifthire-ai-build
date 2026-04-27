"use client"

import { Building2, ExternalLink, MapPin, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TrackerCardData {
  id: string
  candidate_id: string
  status: "wishlist" | "applied" | "interviewing" | "offer" | "rejected"
  position: number
  job_data: {
    title: string
    company?: string
    location?: string
    url?: string
    notes?: string
    external_id?: string
  }
  updated_at: string | null
  created_at: string
}

export function TrackerCard({
  card,
  dragging,
  onDelete,
}: {
  card: TrackerCardData
  dragging?: boolean
  onDelete?: () => void
}) {
  const j = card.job_data

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border border-border bg-surface-alt/60 p-3 text-foreground shadow-sm transition-shadow",
        dragging
          ? "cursor-grabbing border-primary/40 shadow-lg ring-1 ring-primary/30"
          : "cursor-grab hover:border-primary/20",
      )}
    >
      <h4 className="line-clamp-2 pr-6 text-[13px] font-semibold leading-snug tracking-tight">
        {j.title}
      </h4>

      {j.company || j.location ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-secondary">
          {j.company ? (
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3 text-text-muted" aria-hidden />
              <span className="truncate">{j.company}</span>
            </span>
          ) : null}
          {j.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-text-muted" aria-hidden />
              <span className="truncate">{j.location}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {j.notes ? (
        <p className="line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
          {j.notes}
        </p>
      ) : null}

      <div className="mt-1 flex items-center justify-between">
        {j.url ? (
          <a
            href={j.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-primary-glow hover:underline"
          >
            <ExternalLink className="h-3 w-3" aria-hidden />
            View posting
          </a>
        ) : (
          <span className="font-mono text-[10px] text-text-muted">
            #{card.id.slice(0, 6)}
          </span>
        )}
        {onDelete ? (
          <button
            type="button"
            aria-label="Delete card"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 transition-opacity rounded-md p-1 text-text-muted hover:bg-white/5 hover:text-danger group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" aria-hidden />
          </button>
        ) : null}
      </div>
    </article>
  )
}
