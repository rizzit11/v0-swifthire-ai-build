import type { ResumeData } from "./schema"

/**
 * Three deterministic, print-friendly resume templates.
 * Used by both the live iframe preview and the public /resume/[id]
 * server-rendered share page, so they MUST stay 100% server-renderable
 * (no hooks, no client APIs).
 */

function fmtRange(start?: string, end?: string) {
  const s = (start ?? "").trim()
  const e = (end ?? "").trim() || "Present"
  if (!s && !e) return ""
  if (!s) return e
  return `${s} — ${e}`
}

function joinLocation(loc?: ResumeData["basics"]["location"]) {
  if (!loc) return ""
  return [loc.city, loc.region, loc.countryCode].filter(Boolean).join(", ")
}

function ContactLine({ data }: { data: ResumeData }) {
  const items = [
    data.basics.email,
    data.basics.phone,
    joinLocation(data.basics.location),
    data.basics.url,
    ...data.basics.profiles.map((p) => p.url || p.username).filter(Boolean),
  ].filter(Boolean)
  if (items.length === 0) return null
  return (
    <p className="text-[11px] leading-relaxed text-zinc-600">
      {items.join("  ·  ")}
    </p>
  )
}

/* -------------------- Minimal -------------------- */

export function MinimalTemplate({
  data,
  pictureUrl,
}: {
  data: ResumeData
  pictureUrl?: string | null
}) {
  const accent = data.settings.accentColor
  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-5 bg-white p-10 text-zinc-900">
      <header className="flex items-start justify-between gap-6 border-b border-zinc-200 pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: accent }}>
            {data.basics.name || "Your Name"}
          </h1>
          {data.basics.label ? (
            <p className="mt-0.5 text-sm font-medium text-zinc-700">
              {data.basics.label}
            </p>
          ) : null}
          <div className="mt-2">
            <ContactLine data={data} />
          </div>
        </div>
        {data.settings.showPicture && pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pictureUrl || "/placeholder.svg"}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-zinc-200"
          />
        ) : null}
      </header>

      {data.basics.summary ? (
        <Section title="Summary" accent={accent}>
          <p className="text-[12.5px] leading-relaxed text-zinc-700">
            {data.basics.summary}
          </p>
        </Section>
      ) : null}

      {data.work.length ? (
        <Section title="Experience" accent={accent}>
          <div className="flex flex-col gap-4">
            {data.work.map((w, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[13px] font-semibold text-zinc-900">
                    {w.position || "Role"}
                    {w.name ? (
                      <span className="font-normal text-zinc-600">
                        {" — "}
                        {w.name}
                      </span>
                    ) : null}
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {fmtRange(w.startDate, w.endDate)}
                  </span>
                </div>
                {w.summary ? (
                  <p className="text-[12px] leading-relaxed text-zinc-700">
                    {w.summary}
                  </p>
                ) : null}
                {w.highlights.length ? (
                  <ul className="ml-4 list-disc text-[12px] leading-relaxed text-zinc-700 marker:text-zinc-400">
                    {w.highlights.map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.projects.length ? (
        <Section title="Projects" accent={accent}>
          <div className="flex flex-col gap-3">
            {data.projects.map((p, i) => (
              <div key={i}>
                <h3 className="text-[13px] font-semibold text-zinc-900">
                  {p.name || "Project"}
                </h3>
                {p.description ? (
                  <p className="text-[12px] leading-relaxed text-zinc-700">
                    {p.description}
                  </p>
                ) : null}
                {p.highlights.length ? (
                  <ul className="ml-4 list-disc text-[12px] leading-relaxed text-zinc-700 marker:text-zinc-400">
                    {p.highlights.map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.education.length ? (
        <Section title="Education" accent={accent}>
          <div className="flex flex-col gap-2">
            {data.education.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[13px] font-semibold text-zinc-900">
                    {e.institution || "Institution"}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-zinc-700">
                    {[e.studyType, e.area].filter(Boolean).join(", ")}
                    {e.score ? ` · ${e.score}` : ""}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">
                  {fmtRange(e.startDate, e.endDate)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.skills.length ? (
        <Section title="Skills" accent={accent}>
          <ul className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <li
                key={i}
                className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-700"
              >
                {s.name}
                {s.level ? (
                  <span className="ml-1 text-zinc-400">· {s.level}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </article>
  )
}

/* -------------------- Classic -------------------- */

export function ClassicTemplate({
  data,
  pictureUrl,
}: {
  data: ResumeData
  pictureUrl?: string | null
}) {
  const accent = data.settings.accentColor
  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-5 bg-white p-10 text-zinc-900">
      <header className="flex flex-col items-center gap-2 text-center">
        {data.settings.showPicture && pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pictureUrl || "/placeholder.svg"}
            alt=""
            className="h-24 w-24 rounded-full object-cover ring-1 ring-zinc-200"
          />
        ) : null}
        <h1
          className="font-serif text-3xl font-semibold tracking-tight"
          style={{ color: accent }}
        >
          {data.basics.name || "Your Name"}
        </h1>
        {data.basics.label ? (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-600">
            {data.basics.label}
          </p>
        ) : null}
        <ContactLine data={data} />
      </header>

      <div className="h-px w-full" style={{ background: accent, opacity: 0.4 }} />

      {data.basics.summary ? (
        <p className="text-center text-[12.5px] italic leading-relaxed text-zinc-700">
          {data.basics.summary}
        </p>
      ) : null}

      {data.work.length ? (
        <Section title="Professional Experience" accent={accent} centered>
          <div className="flex flex-col gap-4">
            {data.work.map((w, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[13px] font-semibold">
                    {w.position}
                    {w.name ? `, ${w.name}` : ""}
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {fmtRange(w.startDate, w.endDate)}
                  </span>
                </div>
                {w.summary ? (
                  <p className="text-[12px] leading-relaxed text-zinc-700">
                    {w.summary}
                  </p>
                ) : null}
                {w.highlights.length ? (
                  <ul className="ml-4 list-disc text-[12px] leading-relaxed text-zinc-700 marker:text-zinc-400">
                    {w.highlights.map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.education.length ? (
        <Section title="Education" accent={accent} centered>
          <div className="flex flex-col gap-2">
            {data.education.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-[13px] font-semibold">{e.institution}</h3>
                  <p className="text-[12px] text-zinc-700">
                    {[e.studyType, e.area].filter(Boolean).join(", ")}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">
                  {fmtRange(e.startDate, e.endDate)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.skills.length ? (
        <Section title="Skills" accent={accent} centered>
          <p className="text-center text-[12px] leading-relaxed text-zinc-700">
            {data.skills.map((s) => s.name).filter(Boolean).join("  ·  ")}
          </p>
        </Section>
      ) : null}
    </article>
  )
}

/* -------------------- Compact -------------------- */

export function CompactTemplate({
  data,
  pictureUrl,
}: {
  data: ResumeData
  pictureUrl?: string | null
}) {
  const accent = data.settings.accentColor
  return (
    <article className="mx-auto grid w-full max-w-[760px] grid-cols-3 gap-6 bg-white p-8 text-zinc-900">
      <aside className="col-span-1 flex flex-col gap-4 border-r border-zinc-200 pr-5">
        {data.settings.showPicture && pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pictureUrl || "/placeholder.svg"}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-1 ring-zinc-200"
          />
        ) : null}
        <div>
          <h1
            className="text-xl font-semibold leading-tight tracking-tight"
            style={{ color: accent }}
          >
            {data.basics.name || "Your Name"}
          </h1>
          {data.basics.label ? (
            <p className="mt-0.5 text-xs font-medium text-zinc-600">
              {data.basics.label}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h2
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            Contact
          </h2>
          {[data.basics.email, data.basics.phone, joinLocation(data.basics.location), data.basics.url]
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} className="break-all text-[11px] leading-snug text-zinc-700">
                {line}
              </p>
            ))}
        </div>

        {data.skills.length ? (
          <div className="flex flex-col gap-1">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              Skills
            </h2>
            <ul className="flex flex-col gap-0.5 text-[11px] text-zinc-700">
              {data.skills.map((s, i) => (
                <li key={i}>
                  {s.name}
                  {s.level ? (
                    <span className="ml-1 text-zinc-400">· {s.level}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {data.education.length ? (
          <div className="flex flex-col gap-1.5">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              Education
            </h2>
            {data.education.map((e, i) => (
              <div key={i}>
                <p className="text-[11px] font-semibold leading-snug text-zinc-900">
                  {e.institution}
                </p>
                <p className="text-[11px] leading-snug text-zinc-700">
                  {[e.studyType, e.area].filter(Boolean).join(", ")}
                </p>
                <p className="font-mono text-[10px] text-zinc-500">
                  {fmtRange(e.startDate, e.endDate)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </aside>

      <main className="col-span-2 flex flex-col gap-4">
        {data.basics.summary ? (
          <Section title="Summary" accent={accent}>
            <p className="text-[12px] leading-relaxed text-zinc-700">
              {data.basics.summary}
            </p>
          </Section>
        ) : null}

        {data.work.length ? (
          <Section title="Experience" accent={accent}>
            <div className="flex flex-col gap-3">
              {data.work.map((w, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[12.5px] font-semibold">
                      {w.position}
                      {w.name ? (
                        <span className="font-normal text-zinc-600">
                          {" "}
                          · {w.name}
                        </span>
                      ) : null}
                    </h3>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {fmtRange(w.startDate, w.endDate)}
                    </span>
                  </div>
                  {w.summary ? (
                    <p className="text-[11.5px] leading-relaxed text-zinc-700">
                      {w.summary}
                    </p>
                  ) : null}
                  {w.highlights.length ? (
                    <ul className="ml-4 list-disc text-[11.5px] leading-relaxed text-zinc-700 marker:text-zinc-400">
                      {w.highlights.map((h, hi) => (
                        <li key={hi}>{h}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.projects.length ? (
          <Section title="Projects" accent={accent}>
            <div className="flex flex-col gap-2.5">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <h3 className="text-[12.5px] font-semibold">{p.name}</h3>
                  {p.description ? (
                    <p className="text-[11.5px] leading-relaxed text-zinc-700">
                      {p.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </main>
    </article>
  )
}

/* -------------------- Section helper -------------------- */

function Section({
  title,
  accent,
  centered,
  children,
}: {
  title: string
  accent: string
  centered?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2
        className={`font-mono text-[10px] uppercase tracking-[0.2em] ${centered ? "text-center" : ""}`}
        style={{ color: accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

/* -------------------- Picker -------------------- */

export function ResumeRenderer({
  data,
  pictureUrl,
}: {
  data: ResumeData
  pictureUrl?: string | null
}) {
  switch (data.settings.template) {
    case "classic":
      return <ClassicTemplate data={data} pictureUrl={pictureUrl} />
    case "compact":
      return <CompactTemplate data={data} pictureUrl={pictureUrl} />
    case "minimal":
    default:
      return <MinimalTemplate data={data} pictureUrl={pictureUrl} />
  }
}
