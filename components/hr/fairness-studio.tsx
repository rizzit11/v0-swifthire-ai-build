"use client"

import { ShieldCheck, AlertTriangle, EyeOff, BarChart3, FileSearch } from "lucide-react"

type Subgroup = {
  name: string
  applied: number
  shortlisted: number
  rate: number
}

// Mock fairness data — real values computed from candidate_demographics +
// applications RLS join in a secure server function.
const GENDER: Subgroup[] = [
  { name: "Women", applied: 92, shortlisted: 28, rate: 30.4 },
  { name: "Men", applied: 118, shortlisted: 41, rate: 34.7 },
  { name: "Non-binary", applied: 14, shortlisted: 4, rate: 28.6 },
  { name: "Prefer not to say", applied: 11, shortlisted: 3, rate: 27.3 },
]

const ETHNICITY: Subgroup[] = [
  { name: "Asian", applied: 74, shortlisted: 24, rate: 32.4 },
  { name: "Black", applied: 38, shortlisted: 10, rate: 26.3 },
  { name: "Hispanic / Latinx", applied: 41, shortlisted: 12, rate: 29.3 },
  { name: "White", applied: 96, shortlisted: 34, rate: 35.4 },
  { name: "Other / Multiple", applied: 21, shortlisted: 7, rate: 33.3 },
]

function eightyPctCheck(groups: Subgroup[]) {
  const top = Math.max(...groups.map((g) => g.rate))
  return groups.map((g) => ({
    ...g,
    ratio: top === 0 ? 0 : g.rate / top,
    flagged: top > 0 && g.rate / top < 0.8,
  }))
}

export function HrFairnessStudio() {
  const gender = eightyPctCheck(GENDER)
  const ethnicity = eightyPctCheck(ETHNICITY)
  const allFlags = [...gender, ...ethnicity].filter((g) => g.flagged)

  return (
    <div className="flex flex-col gap-5">
      {/* Headline cards */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <HeadlineCard
          Icon={ShieldCheck}
          accent="text-accent"
          bg="bg-accent/10"
          border="border-accent/30"
          label="Overall fairness score"
          value="B+"
          sub="No major rule violations"
        />
        <HeadlineCard
          Icon={AlertTriangle}
          accent="text-warning"
          bg="bg-warning/10"
          border="border-warning/30"
          label="80% rule flags"
          value={String(allFlags.length)}
          sub={
            allFlags.length
              ? `${allFlags.map((f) => f.name).join(", ")}`
              : "All subgroups within range"
          }
        />
        <HeadlineCard
          Icon={EyeOff}
          accent="text-primary-glow"
          bg="bg-primary/10"
          border="border-primary/30"
          label="Blinded dimensions"
          value="Name · Photo · School"
          sub="Hidden from scorer by default"
        />
      </section>

      {/* Subgroup tables */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SubgroupCard
          title="Gender"
          groups={gender}
        />
        <SubgroupCard
          title="Ethnicity"
          groups={ethnicity}
        />
      </section>

      {/* Audit log */}
      <section className="glass ring-inset-highlight flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-text-secondary" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Audit log
          </span>
        </div>
        <h3 className="font-serif text-base font-semibold tracking-tight">
          Recent decisions
        </h3>
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {[
            {
              t: "2m ago",
              actor: "AI · scorer v1.4",
              msg: "Shortlisted 8 of 143 applicants for Senior Frontend",
            },
            {
              t: "21m ago",
              actor: "HR · Rishit",
              msg: "Marked 'Priya N.' advance to Interview stage",
            },
            {
              t: "1h ago",
              actor: "System",
              msg: "Fairness audit run — no 80% violations on Gender",
            },
            {
              t: "3h ago",
              actor: "AI · scorer v1.4",
              msg: "Re-ranked ML Engineer shortlist after JD update",
            },
          ].map((e, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-surface-alt/40 px-4 py-3"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-background font-mono text-[10px] text-text-muted">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs text-foreground">{e.msg}</span>
                <span className="font-mono text-[10px] text-text-muted">
                  {e.actor} · {e.t}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] leading-relaxed text-text-muted">
        Numbers on this page are illustrative until your first shortlist runs.
        Real values are computed server-side; the candidate_demographics table is
        never readable by HR — we only surface aggregated, subgroup-level rates.
      </p>
    </div>
  )
}

function HeadlineCard({
  Icon,
  accent,
  bg,
  border,
  label,
  value,
  sub,
}: {
  Icon: React.ComponentType<{ className?: string }>
  accent: string
  bg: string
  border: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className={`glass ring-inset-highlight rounded-2xl p-5`}>
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg border ${border} ${bg} ${accent}`}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold text-foreground">
        {value}
      </div>
      <span className="mt-1 block text-[11px] leading-snug text-text-secondary">
        {sub}
      </span>
    </div>
  )
}

function SubgroupCard({
  title,
  groups,
}: {
  title: string
  groups: Array<Subgroup & { ratio: number; flagged: boolean }>
}) {
  return (
    <div className="glass ring-inset-highlight flex flex-col gap-3 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-text-secondary" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {groups.map((g) => (
          <li key={g.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span
                className={
                  g.flagged
                    ? "font-medium text-warning"
                    : "text-text-secondary"
                }
              >
                {g.name}
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {g.shortlisted}/{g.applied} · {g.rate.toFixed(1)}%
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-border"
              aria-hidden
            >
              <div
                className={
                  g.flagged
                    ? "h-full bg-warning"
                    : "h-full bg-gradient-to-r from-primary to-secondary"
                }
                style={{ width: `${Math.max(4, g.rate * 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11px] leading-snug text-text-muted">
        80% rule: each subgroup&apos;s shortlist rate is compared to the top
        subgroup. Bars highlighted in{" "}
        <span className="text-warning">warning</span> fall below the 80% ratio
        and trigger a review.
      </p>
    </div>
  )
}
