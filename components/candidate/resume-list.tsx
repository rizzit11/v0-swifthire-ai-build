"use client"

import Link from "next/link"
import { FileText, PenSquare, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type Resume = {
  id: string
  title: string | null
  is_primary: boolean | null
  ats_score: number | null
  parsed_data: Record<string, unknown> | null
  updated_at: string | null
}

export function ResumeList({ initial }: { initial: Resume[] }) {
  if (!initial.length) {
    return (
      <section aria-label="Your resumes">
        <div className="glass ring-inset-highlight flex flex-col items-center gap-2 rounded-2xl p-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface-alt/60 text-text-muted">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="font-serif text-base font-semibold tracking-tight">
            No resumes yet
          </h3>
          <p className="max-w-sm text-sm text-text-secondary">
            Upload your first PDF above to see AI-extracted fields, ATS score,
            and version history here.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Your resumes" className="flex flex-col gap-3">
      <h3 className="font-serif text-lg font-semibold tracking-tight">
        Your resumes
      </h3>
      <ul className="flex flex-col gap-2">
        {initial.map((r) => (
          <ResumeRow key={r.id} resume={r} />
        ))}
      </ul>
    </section>
  )
}

function ResumeRow({ resume }: { resume: Resume }) {
  const parsed = (resume.parsed_data ?? {}) as {
    name?: string
    email?: string
    role?: string
    skills?: string[]
  }

  const updated = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <li className="glass ring-inset-highlight flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-glow">
          <FileText className="h-4 w-4" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {resume.title ?? parsed.name ?? "Untitled resume"}
            </span>
            {resume.is_primary ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-glow"
                aria-label="Primary resume"
              >
                <Star className="h-2.5 w-2.5" aria-hidden />
                Primary
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted">
            {parsed.role ? <span className="truncate">{parsed.role}</span> : null}
            {parsed.email ? <span className="truncate">· {parsed.email}</span> : null}
            {updated ? <span>· updated {updated}</span> : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href={`/candidate/resumes/${resume.id}/builder`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white/[0.02] px-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10"
        >
          <PenSquare className="h-3.5 w-3.5 text-primary-glow" aria-hidden />
          Open builder
        </Link>
        {Array.isArray(parsed.skills) && parsed.skills.length > 0 ? (
          <ul className="hidden items-center gap-1.5 md:flex">
            {parsed.skills.slice(0, 3).map((s) => (
              <li
                key={s}
                className="rounded-full border border-border bg-surface-alt/60 px-2 py-0.5 font-mono text-[10px] text-text-secondary"
              >
                {s}
              </li>
            ))}
          </ul>
        ) : null}
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl border font-mono text-sm font-semibold",
            resume.ats_score == null
              ? "border-border bg-surface-alt/60 text-text-muted"
              : resume.ats_score >= 85
                ? "border-accent/30 bg-accent/10 text-accent"
                : resume.ats_score >= 70
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-danger/30 bg-danger/10 text-danger",
          )}
          aria-label="ATS score"
        >
          {resume.ats_score ?? "—"}
        </span>
      </div>
    </li>
  )
}
