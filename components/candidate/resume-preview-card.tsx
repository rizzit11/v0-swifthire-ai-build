"use client"

import { Briefcase, GraduationCap, Mail, MapPin, Phone, Sparkles } from "lucide-react"

/**
 * Lightweight inline preview of a parsed resume.
 *
 * Tolerates both shapes the codebase emits:
 *   - the AI parser output (name/email/role/experience[].bullets)
 *   - the JSON-Resume builder shape (basics.name / work[].highlights)
 *
 * Anything missing renders as an em-dash so the card stays useful even
 * for partially extracted resumes.
 */
type AnyResume = Record<string, unknown> & {
  basics?: Record<string, unknown>
}

function pick(obj: unknown, ...keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null
  for (const k of keys) {
    const v = (obj as Record<string, unknown>)[k]
    if (typeof v === "string" && v.trim()) return v
  }
  return null
}

export function ResumePreviewCard({
  resume,
}: {
  resume: {
    id: string
    file_name: string | null
    ats_score: number | null
    parsed_data: unknown
  } | null
}) {
  if (!resume) {
    return (
      <div className="glass ring-inset-highlight flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 p-8 text-center">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary-glow">
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
        <p className="text-sm text-text-secondary">
          Pick a resume above to see a live preview here.
        </p>
        <span className="font-mono text-[10px] text-text-muted">
          Or upload a new PDF — we&apos;ll parse it in seconds.
        </span>
      </div>
    )
  }

  const data = (resume.parsed_data as AnyResume) ?? {}
  const basics = (data.basics as Record<string, unknown>) ?? data

  const name = pick(basics, "name") ?? "Untitled resume"
  const role = pick(basics, "label", "role") ?? null
  const email = pick(basics, "email")
  const phone = pick(basics, "phone")
  const summary = pick(basics, "summary")

  // Location can be a string ("San Francisco, CA") or {city, region}
  let location: string | null = pick(basics, "location")
  if (!location && typeof basics.location === "object" && basics.location) {
    const loc = basics.location as Record<string, unknown>
    const parts = [loc.city, loc.region, loc.countryCode]
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    location = parts.length ? parts.join(", ") : null
  }

  // Skills: parser returns string[]; builder returns {name}[]
  const rawSkills =
    (Array.isArray(data.skills) && data.skills) ||
    (Array.isArray(basics.skills) && basics.skills) ||
    []
  const skills: string[] = (rawSkills as unknown[])
    .map((s) =>
      typeof s === "string"
        ? s
        : typeof s === "object" && s && "name" in s
          ? String((s as { name?: unknown }).name ?? "")
          : "",
    )
    .filter((s) => s.trim().length > 0)
    .slice(0, 12)

  // Experience: parser uses experience[].bullets, builder uses work[].highlights
  type Exp = {
    company?: string | null
    title?: string | null
    name?: string | null
    position?: string | null
    start_date?: string | null
    end_date?: string | null
    startDate?: string | null
    endDate?: string | null
    bullets?: string[]
    highlights?: string[]
  }
  const work = (data.experience as Exp[] | undefined) ??
    (data.work as Exp[] | undefined) ??
    []
  const exp = work.slice(0, 2)

  type Edu = {
    school?: string | null
    institution?: string | null
    degree?: string | null
    studyType?: string | null
    area?: string | null
    end_date?: string | null
    endDate?: string | null
  }
  const education = ((data.education as Edu[] | undefined) ?? []).slice(0, 2)

  return (
    <article
      className="glass ring-inset-highlight flex h-full flex-col gap-4 rounded-2xl p-5"
      aria-label={`Resume preview: ${name}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">
            {name}
          </h3>
          {role ? (
            <p className="text-sm text-text-secondary">{role}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-muted">
            {email ? (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" aria-hidden />
                {email}
              </span>
            ) : null}
            {phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden />
                {phone}
              </span>
            ) : null}
            {location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {location}
              </span>
            ) : null}
          </div>
        </div>
        {typeof resume.ats_score === "number" ? (
          <span className="shrink-0 rounded-lg border border-border bg-surface-alt/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            ATS{" "}
            <span className="text-foreground">
              {Math.round(resume.ats_score)}
            </span>
            /100
          </span>
        ) : null}
      </header>

      {summary ? (
        <p className="line-clamp-3 text-[13px] leading-relaxed text-text-secondary">
          {summary}
        </p>
      ) : null}

      {skills.length > 0 ? (
        <section>
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary-glow"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {exp.length > 0 ? (
        <section>
          <span className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            <Briefcase className="h-3 w-3" aria-hidden />
            Experience
          </span>
          <ul className="flex flex-col gap-3">
            {exp.map((row, i) => {
              const company = row.company ?? row.name ?? "—"
              const title = row.title ?? row.position ?? "—"
              const start = row.start_date ?? row.startDate ?? ""
              const end = row.end_date ?? row.endDate ?? "Present"
              const bullets = (row.bullets ?? row.highlights ?? []).slice(0, 2)
              return (
                <li
                  key={`${company}-${i}`}
                  className="rounded-lg border border-border bg-surface-alt/40 p-2.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium text-foreground">
                      {title}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {start || end ? `${start} — ${end}` : ""}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {company}
                  </span>
                  {bullets.length > 0 ? (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11.5px] leading-relaxed text-text-secondary marker:text-text-muted">
                      {bullets.map((b, bi) => (
                        <li key={bi} className="line-clamp-2">
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {education.length > 0 ? (
        <section>
          <span className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            <GraduationCap className="h-3 w-3" aria-hidden />
            Education
          </span>
          <ul className="flex flex-col gap-1">
            {education.map((row, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-2 rounded-lg border border-border bg-surface-alt/40 px-2.5 py-1.5"
              >
                <span className="truncate text-[12px] text-foreground">
                  {row.degree ?? row.studyType ?? row.area ?? "Degree"}
                  {(row.school || row.institution) ? (
                    <>
                      {" · "}
                      <span className="text-text-secondary">
                        {row.school ?? row.institution}
                      </span>
                    </>
                  ) : null}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  {row.end_date ?? row.endDate ?? ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}

/**
 * Pulls the candidate's skill universe out of any parsed-resume shape.
 * Used by the JD matcher to compute real overlap/missing.
 */
export function extractSkills(parsed: unknown): string[] {
  if (!parsed || typeof parsed !== "object") return []
  const data = parsed as AnyResume
  const basics = (data.basics as Record<string, unknown>) ?? {}
  const raw =
    (Array.isArray(data.skills) && data.skills) ||
    (Array.isArray(basics.skills) && basics.skills) ||
    []
  return (raw as unknown[])
    .map((s) =>
      typeof s === "string"
        ? s
        : typeof s === "object" && s && "name" in s
          ? String((s as { name?: unknown }).name ?? "")
          : "",
    )
    .filter((s) => s.trim().length > 0)
}
