export const dynamic = "force-dynamic"

export default function HRJobsPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">Roles</span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Job postings</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Post roles, review AI-ranked shortlists, and export decisions with audit trails.
        </p>
      </header>
      <div className="glass ring-inset-highlight rounded-2xl p-10 text-center text-sm text-text-muted">
        Role posting coming in the next phase.
      </div>
    </div>
  )
}
