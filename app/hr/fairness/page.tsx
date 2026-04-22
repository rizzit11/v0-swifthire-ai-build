export const dynamic = "force-dynamic"

export default function HRFairnessPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">Fairness</span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Bias &amp; audit</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Subgroup outcomes, 80% rule flags, and per-role audit logs.
        </p>
      </header>
      <div className="glass ring-inset-highlight rounded-2xl p-10 text-center text-sm text-text-muted">
        Fairness dashboards coming in the next phase.
      </div>
    </div>
  )
}
