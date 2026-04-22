import Link from "next/link"
import { Sparkles, ShieldCheck, Wand2, Gauge } from "lucide-react"

/**
 * Split-screen auth shell.
 * - Left (lg+): brand storytelling, aurora mesh, feature proof points.
 * - Right: the form card.
 */
export function AuthLayout({
  children,
  title,
  subtitle,
  mode,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  mode: "sign-in" | "sign-up"
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Global backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* LEFT — brand panel */}
        <aside className="relative hidden overflow-hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-10">
          {/* Aurora mesh */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-[640px] w-[900px] -translate-x-1/2 hero-beam opacity-90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent"
            aria-hidden
          />

          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-2 text-foreground"
            aria-label="SwiftHire AI — Home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_24px_-4px_rgba(124,58,237,0.55)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">
              SwiftHire<span className="text-primary-glow"> AI</span>
            </span>
          </Link>

          {/* Hero copy */}
          <div className="relative z-10 max-w-md">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
              {mode === "sign-in" ? "Welcome back" : "Start in 60 seconds"}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-foreground sm:text-4xl">
              Hiring, <span className="text-gradient-brand">reimagined</span> — for
              candidates and recruiters.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Auto-parsed resumes with confidence badges, JD-aware coaching, and
              auditable shortlists. Every AI decision is explainable.
            </p>

            {/* Proof-points */}
            <ul className="mt-8 space-y-3">
              {[
                {
                  Icon: Wand2,
                  title: "AI that respects craft",
                  body: "LaTeX-grade resumes, live JD suggestions, per-field confidence.",
                },
                {
                  Icon: ShieldCheck,
                  title: "Integrity by design",
                  body: "Signals, not surveillance. Candidate demographics stay write-only.",
                },
                {
                  Icon: Gauge,
                  title: "Measurable fairness",
                  body: "80%-rule flags, subgroup dashboards, exportable audit trails.",
                },
              ].map(({ Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-alt/60 text-primary-glow">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {title}
                    </span>
                    <span className="text-xs leading-relaxed text-text-muted">
                      {body}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer badges */}
          <div className="relative z-10 flex items-center gap-4 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              SOC 2 principles
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
              EEOC-aligned
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-glow" aria-hidden />
              Explainable AI
            </span>
          </div>
        </aside>

        {/* RIGHT — form */}
        <section className="relative flex items-center justify-center px-4 py-12 sm:px-6">
          {/* Mobile-only logo */}
          <Link
            href="/"
            className="absolute left-4 top-4 inline-flex items-center gap-2 text-foreground lg:hidden"
            aria-label="SwiftHire AI — Home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
            </span>
            <span className="font-serif text-base font-semibold tracking-tight">
              SwiftHire<span className="text-primary-glow"> AI</span>
            </span>
          </Link>

          <div className="relative w-full max-w-md">
            <div className="glass-strong ring-inset-highlight rounded-2xl p-6 sm:p-8">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>

            <p className="mt-6 text-center text-sm text-text-muted">
              {mode === "sign-in" ? (
                <>
                  New here?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
