import Link from "next/link"
import { ArrowRight, Briefcase, Users, ShieldCheck, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function HROverview() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: hrProfile } = await supabase
    .from("hr_profiles")
    .select("company_id")
    .eq("user_id", user!.id)
    .maybeSingle()

  let jobCount = 0
  let applicationCount = 0
  if (hrProfile?.company_id) {
    const [{ count: jc }, { count: ac }] = await Promise.all([
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("company_id", hrProfile.company_id)
        .is("archived_at", null),
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("company_id", hrProfile.company_id)
        .is("archived_at", null),
    ])
    jobCount = jc ?? 0
    applicationCount = ac ?? 0
  }

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there"

  const stats = [
    { k: "Open roles", v: String(jobCount), d: "Active postings" },
    { k: "Applications", v: String(applicationCount), d: "All-time" },
    { k: "Avg. time-to-shortlist", v: "—", d: "Tracked once shortlists run" },
    { k: "Fairness score", v: "—", d: "Updates after bias report" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-strong ring-inset-highlight relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          HR workspace
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome, {firstName}.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
          Post roles, let AI score applicants by fit, and review shortlists with
          transparent rubrics. Every decision is auditable.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            asChild
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
          >
            <Link href="/hr/jobs">
              Manage roles
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl border border-border bg-white/[0.02] text-foreground hover:bg-white/5"
          >
            <Link href="/hr/fairness">View fairness reports</Link>
          </Button>
        </div>
      </section>

      <section aria-label="Metrics">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="glass ring-inset-highlight rounded-2xl p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {s.k}
              </span>
              <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{s.v}</div>
              <span className="font-mono text-[10px] text-text-muted">{s.d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          {
            title: "Post a role",
            body: "Create a JD and let AI match candidates.",
            href: "/hr/jobs",
            Icon: Briefcase,
          },
          {
            title: "Review applicants",
            body: "Shortlisted candidates with rubric scores.",
            href: "/hr/applicants",
            Icon: Users,
          },
          {
            title: "Fairness reports",
            body: "Subgroup outcomes and bias flags per role.",
            href: "/hr/fairness",
            Icon: ShieldCheck,
          },
        ].map(({ title, body, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className="glass ring-inset-highlight group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary-glow">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-serif text-base font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
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

      <section className="glass ring-inset-highlight flex flex-col items-start gap-3 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-text-secondary">
          <BarChart3 className="h-4 w-4" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider">Next up</span>
        </div>
        <h3 className="font-serif text-lg font-semibold tracking-tight">
          Finish setting up your company workspace
        </h3>
        <p className="max-w-xl text-sm text-text-secondary">
          Invite teammates, connect your ATS, and configure bias thresholds before
          publishing your first role.
        </p>
      </section>
    </div>
  )
}
