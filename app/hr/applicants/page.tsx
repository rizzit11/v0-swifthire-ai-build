export const dynamic = "force-dynamic"

export default function HRApplicantsPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">Pipeline</span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Applicants</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Shortlists with rubric-based scores, per-candidate reasoning, and export to your ATS.
        </p>
      </header>
      <div className="glass ring-inset-highlight rounded-2xl p-10 text-center text-sm text-text-muted">
        Applicant pipeline coming in the next phase.
      </div>
    </div>
  )
}
