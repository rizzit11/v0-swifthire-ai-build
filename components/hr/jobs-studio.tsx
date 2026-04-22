"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Briefcase,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  FileText,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Role = {
  id: string
  title: string
  team: string
  location: string
  status: "draft" | "live" | "closed"
  applicants: number
  shortlist: number
  daysOpen: number
  tags: string[]
}

const MOCK_ROLES: Role[] = [
  {
    id: "r-1",
    title: "Senior Frontend Engineer",
    team: "Product · Growth",
    location: "Remote · EU",
    status: "live",
    applicants: 143,
    shortlist: 8,
    daysOpen: 12,
    tags: ["Next.js", "TypeScript", "Design systems"],
  },
  {
    id: "r-2",
    title: "Machine Learning Engineer",
    team: "AI · Platform",
    location: "Hybrid · SF",
    status: "live",
    applicants: 92,
    shortlist: 5,
    daysOpen: 18,
    tags: ["PyTorch", "RAG", "Kubernetes"],
  },
  {
    id: "r-3",
    title: "Product Designer",
    team: "Design · Systems",
    location: "Remote · Worldwide",
    status: "draft",
    applicants: 0,
    shortlist: 0,
    daysOpen: 0,
    tags: ["Figma", "Motion", "Brand"],
  },
]

const STATUS_STYLES: Record<Role["status"], string> = {
  live: "border-accent/30 bg-accent/10 text-accent",
  draft: "border-border bg-surface-alt/60 text-text-muted",
  closed: "border-warning/30 bg-warning/10 text-warning",
}

export function HrJobsStudio() {
  const [active, setActive] = useState<Role>(MOCK_ROLES[0])

  return (
    <div className="flex flex-col gap-5">
      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { k: "Live roles", v: "2", sub: "+1 this week" },
          { k: "Applicants", v: "235", sub: "All roles" },
          { k: "Avg. shortlist", v: "6%", sub: "Top of pipeline" },
          { k: "Time-to-shortlist", v: "2.3d", sub: "Median" },
        ].map((s) => (
          <div key={s.k} className="glass ring-inset-highlight rounded-2xl p-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {s.k}
            </span>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
              {s.v}
            </div>
            <span className="font-mono text-[10px] text-text-muted">
              {s.sub}
            </span>
          </div>
        ))}
      </section>

      {/* Roles list + detail */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Roles list */}
        <div className="glass ring-inset-highlight flex flex-col gap-3 rounded-2xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Your roles
              </span>
              <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
                Active postings
              </h3>
            </div>
            <Button
              disabled
              className="h-9 rounded-lg bg-primary px-3 text-primary-foreground hover:bg-primary-glow"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              New role
            </Button>
          </div>

          <ul className="flex flex-col gap-2">
            {MOCK_ROLES.map((r) => {
              const selected = r.id === active.id
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setActive(r)}
                    className={cn(
                      "group flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                      selected
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-surface-alt/50 hover:border-primary/20 hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary-glow">
                          <Briefcase className="h-4 w-4" aria-hidden />
                        </span>
                        <div>
                          <span className="block text-sm font-medium text-foreground">
                            {r.title}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted">
                            {r.team}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                          STATUS_STYLES[r.status],
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {r.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden />
                        {r.applicants} applicants
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        {r.shortlist} shortlisted
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {r.daysOpen}d open
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Role detail */}
        <div className="glass ring-inset-highlight flex flex-col gap-4 rounded-2xl p-5 lg:col-span-2">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Preview
            </span>
            <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
              {active.title}
            </h3>
            <span className="font-mono text-[10px] text-text-muted">
              {active.team} · {active.location}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {active.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-surface-alt/60 px-2 py-0.5 font-mono text-[10px] text-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface-alt/50 p-3">
            {[
              { k: "Applicants", v: active.applicants, Icon: Users },
              { k: "Shortlist", v: active.shortlist, Icon: CheckCircle2 },
              { k: "Days open", v: active.daysOpen, Icon: Clock },
            ].map(({ k, v, Icon }) => (
              <div key={k} className="flex flex-col">
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <Icon className="h-3 w-3" aria-hidden />
                  {k}
                </span>
                <span className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary-glow">
              <Sparkles className="h-3 w-3" aria-hidden />
              AI shortlist signal
            </span>
            <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
              Top 8 applicants scored{" "}
              <span className="font-mono text-foreground">≥ 82/100</span> on the
              role rubric. Fairness audit pending — see
              <a
                href="/hr/fairness"
                className="ml-1 text-primary-glow underline-offset-2 hover:underline"
              >
                Fairness
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              className="h-9 flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              <Link href="/hr/applicants">
                <Users className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                View applicants
              </Link>
            </Button>
            <Button
              disabled
              className="h-9 rounded-lg border border-border bg-white/[0.02] px-3 text-foreground hover:bg-white/5"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Edit JD
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-alt/50 p-3 text-[11px] leading-relaxed text-text-muted">
            <TrendingUp
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary"
              aria-hidden
            />
            <span>
              Live role posting with auto-JD drafting lands next — this preview
              uses realistic demo data.
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
