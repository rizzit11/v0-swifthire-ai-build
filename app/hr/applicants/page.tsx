import { HrApplicantsStudio } from "@/components/hr/applicants-studio"

export const dynamic = "force-dynamic"

export default function HRApplicantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Pipeline
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Applicants
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Shortlists with rubric-based scores, per-candidate reasoning, and
          export to your ATS. Live applicant ingestion ships next — the data
          model and UI you see here are real.
        </p>
      </header>

      <HrApplicantsStudio />
    </div>
  )
}
