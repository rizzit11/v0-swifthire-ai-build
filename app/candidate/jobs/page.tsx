import { JdMatchingStudio } from "@/components/candidate/jd-matching-studio"

export const dynamic = "force-dynamic"

export default function JobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Step 02
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Match your resume to a JD
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Paste a job description — SwiftHire returns an ATS score, skill
          overlap, missing keywords, and explainable fix-it tips you can apply
          in one click.
        </p>
      </header>

      <JdMatchingStudio />
    </div>
  )
}
