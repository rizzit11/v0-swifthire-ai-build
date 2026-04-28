import Link from "next/link"
import { ArrowRight, FileText, Target, Mic } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function CandidateOverview() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, is_primary, ats_score, updated_at")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(5)

  const primary = resumes?.find((r) => r.is_primary) ?? resumes?.[0] ?? null

  const stats = [
    {
      k: "Resumes",
      v: String(resumes?.length ?? 0),
      d: primary?.title ?? "No primary yet",
    },
    {
      k: "ATS score",
      v: primary?.ats_score != null ? String(primary.ats_score) : "—",
      d: "from primary resume",
    },
    { k: "Applications", v: "0", d: "coming soon" },
    { k: "Practice hrs", v: "0", d: "coming soon" },
  ]

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there"

  // Three primary shortcuts. "Build a resume" deep-links into the builder
  // route — the bootstrap page either reuses the most-recent resume or
  // creates a blank one — so the user never lands on a dead "Open" link.
  const shortcuts = [
    {
      title: "Build a resume",
      body: "LaTeX-grade PDF with live JD suggestions.",
      href: "/candidate/resumes/new",
      Icon: FileText,
    },
    {
      title: "Match a JD",
      body: "ATS score, missing keywords, fix-it tips.",
      href: "/candidate/jobs",
      Icon: Target,
    },
    {
      title: "Practice interview",
      body: "Rubric-based scoring + coaching feedback.",
      href: "/candidate/interviews",
      Icon: Mic,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <section className="glass-strong ring-inset-highlight relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Welcome back
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Hi, {firstName}.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
          Upload a resume to get an instant AI parse with confidence badges, or
          match an existing resume against any job description.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            asChild
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
          >
            <Link href="/candidate/resumes">
              Upload a resume
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl border border-border bg-white/[0.02] text-foreground hover:bg-white/5"
          >
            <Link href="/candidate/jobs">Match a JD</Link>
          </Button>
        </div>
      </section>

      {/* Shortcuts (now ABOVE the metric tiles per request) */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {shortcuts.map(({ title, body, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className="glass ring-inset-highlight group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary-glow">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-serif text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {body}
            </p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary-glow">
              Open
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        ))}
      </section>

      {/* Stats (now BELOW shortcuts) */}
      <section aria-label="Overview metrics">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.k}
              className="glass ring-inset-highlight rounded-2xl p-4"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {s.k}
              </span>
              <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
                {s.v}
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                {s.d}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
