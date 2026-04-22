import { HrFairnessStudio } from "@/components/hr/fairness-studio"

export const dynamic = "force-dynamic"

export default function HRFairnessPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Fairness
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Bias &amp; audit
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Subgroup outcomes, 80% rule flags, and per-role audit logs. Candidate
          demographics are write-only — nothing here can re-identify anyone.
        </p>
      </header>

      <HrFairnessStudio />
    </div>
  )
}
