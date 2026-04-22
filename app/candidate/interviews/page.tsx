import { InterviewStudio } from "@/components/candidate/interview-studio"

export const dynamic = "force-dynamic"

export default function InterviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Step 03
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Practice interviews with a coach
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Pick a track, answer rubric-based prompts, and get structured feedback
          with a confidence indicator. Preview experience — live sessions ship
          in the next release.
        </p>
      </header>

      <InterviewStudio />
    </div>
  )
}
