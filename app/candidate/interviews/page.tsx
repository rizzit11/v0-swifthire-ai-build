import { Mic } from "lucide-react"

export default function InterviewsPage() {
  return (
    <div className="glass ring-inset-highlight flex flex-col items-start gap-3 rounded-2xl p-8">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
        <Mic className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="font-serif text-xl font-semibold tracking-tight">
        Practice interviews
      </h2>
      <p className="max-w-lg text-sm text-text-secondary">
        Rubric-based mock interviews with coaching feedback — coming in the
        next release.
      </p>
    </div>
  )
}
