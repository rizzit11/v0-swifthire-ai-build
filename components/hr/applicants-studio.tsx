"use client"

import { useMemo, useState } from "react"
import {
  Search,
  SlidersHorizontal,
  Download,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Applicant = {
  id: string
  name: string
  role: string
  location: string
  score: number
  stage: "new" | "screen" | "interview" | "offer"
  strengths: string[]
  gaps: string[]
}

const APPLICANTS: Applicant[] = [
  {
    id: "a-1",
    name: "John Doe",
    role: "Senior Frontend",
    location: "Berlin, DE",
    score: 92,
    stage: "interview",
    strengths: ["Design systems", "Perf", "TS depth"],
    gaps: ["Less RSC"],
  },
  {
    id: "a-2",
    name: "Priya N.",
    role: "Senior Frontend",
    location: "Bengaluru, IN",
    score: 89,
    stage: "screen",
    strengths: ["Next.js", "A11y", "Motion"],
    gaps: ["Playwright"],
  },
  {
    id: "a-3",
    name: "Marcus L.",
    role: "Senior Frontend",
    location: "Toronto, CA",
    score: 84,
    stage: "interview",
    strengths: ["Tailwind", "RSC", "Edge"],
    gaps: ["tRPC"],
  },
  {
    id: "a-4",
    name: "Kenji T.",
    role: "ML Engineer",
    location: "Tokyo, JP",
    score: 81,
    stage: "screen",
    strengths: ["PyTorch", "RAG"],
    gaps: ["K8s depth"],
  },
  {
    id: "a-5",
    name: "Amélie R.",
    role: "Product Designer",
    location: "Paris, FR",
    score: 78,
    stage: "new",
    strengths: ["Systems", "Brand"],
    gaps: ["Motion reel"],
  },
  {
    id: "a-6",
    name: "Sofia G.",
    role: "Senior Frontend",
    location: "Madrid, ES",
    score: 76,
    stage: "new",
    strengths: ["TS", "Tailwind"],
    gaps: ["Scale"],
  },
]

const STAGE_STYLES: Record<Applicant["stage"], string> = {
  new: "border-border bg-surface-alt/60 text-text-muted",
  screen: "border-secondary/30 bg-secondary/10 text-secondary",
  interview: "border-primary/30 bg-primary/10 text-primary-glow",
  offer: "border-accent/30 bg-accent/10 text-accent",
}

export function HrApplicantsStudio() {
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState<Applicant>(APPLICANTS[0])

  const filtered = useMemo(() => {
    if (!q.trim()) return APPLICANTS
    const n = q.toLowerCase()
    return APPLICANTS.filter(
      (a) =>
        a.name.toLowerCase().includes(n) ||
        a.role.toLowerCase().includes(n) ||
        a.location.toLowerCase().includes(n),
    )
  }, [q])

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="glass ring-inset-highlight flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search applicants by name, role, location"
            className="h-10 rounded-xl border-border bg-surface-alt/60 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-border bg-white/[0.02] text-foreground hover:bg-white/5"
          >
            <SlidersHorizontal
              className="mr-1.5 h-3.5 w-3.5"
              aria-hidden
            />
            Filters
          </Button>
          <Button
            disabled
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Export
          </Button>
        </div>
      </div>

      {/* Table + detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Table */}
        <div className="glass ring-inset-highlight overflow-hidden rounded-2xl lg:col-span-3">
          <div className="grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-3 border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted sm:grid-cols-[1.6fr_1fr_auto_auto]">
            <span>Candidate</span>
            <span className="hidden sm:block">Role</span>
            <span>Stage</span>
            <span>Score</span>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((a) => {
              const active = a.id === selected.id
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setSelected(a)}
                    className={cn(
                      "grid w-full grid-cols-[1.4fr_1fr_auto_auto] items-center gap-3 px-4 py-3 text-left transition-colors sm:grid-cols-[1.6fr_1fr_auto_auto]",
                      active
                        ? "bg-primary/5"
                        : "hover:bg-white/[0.03]",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-mono text-[11px] font-semibold text-primary-foreground"
                        aria-hidden
                      >
                        {a.name
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {a.name}
                        </span>
                        <span className="truncate font-mono text-[10px] text-text-muted">
                          {a.location}
                        </span>
                      </div>
                    </div>
                    <span className="hidden truncate text-xs text-text-secondary sm:block">
                      {a.role}
                    </span>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                        STAGE_STYLES[a.stage],
                      )}
                    >
                      {a.stage}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {a.score}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-text-muted">
              No applicants match that search.
            </div>
          ) : null}
        </div>

        {/* Detail */}
        <div className="glass ring-inset-highlight flex flex-col gap-4 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-mono text-sm font-semibold text-primary-foreground"
              aria-hidden
            >
              {selected.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <h3 className="font-serif text-base font-semibold tracking-tight">
                {selected.name}
              </h3>
              <span className="font-mono text-[10px] text-text-muted">
                {selected.role} · {selected.location}
              </span>
            </div>
          </div>

          {/* Score ring */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-alt/50 p-4">
            <ScoreRing score={selected.score} />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Rubric score
              </span>
              <div className="font-mono text-2xl font-semibold text-foreground">
                {selected.score}
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                vs. role rubric
              </span>
            </div>
          </div>

          {/* Rubric breakdown */}
          <div className="flex flex-col gap-2.5">
            {[
              { k: "Skill fit", v: Math.min(100, selected.score + 2) },
              { k: "Experience depth", v: selected.score - 4 },
              { k: "Communication", v: selected.score - 7 },
              { k: "Integrity signal", v: Math.min(100, selected.score + 5) },
            ].map((row) => (
              <div key={row.k} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{row.k}</span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {row.v}
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-border"
                  aria-hidden
                >
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${Math.max(8, row.v)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & gaps */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Strengths
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {selected.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-warning">
                Gaps
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {selected.gaps.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] text-warning"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-alt/50 p-3 text-[11px] leading-relaxed text-text-muted">
            <Sparkles
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-glow"
              aria-hidden
            />
            <span>
              Reasoning is auditable — open the candidate&apos;s rubric to see
              which resume passages supported each dimension.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circ = 2 * Math.PI * radius
  const pct = score / 100
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden>
      <circle
        cx="38"
        cy="38"
        r={radius}
        stroke="rgba(148,163,184,0.18)"
        strokeWidth="7"
        fill="none"
      />
      <circle
        cx="38"
        cy="38"
        r={radius}
        stroke="url(#applicant-ring)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 38 38)"
      />
      <defs>
        <linearGradient id="applicant-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
