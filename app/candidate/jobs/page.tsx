import { Target } from "lucide-react"

export default function JobsPage() {
  return (
    <div className="glass ring-inset-highlight flex flex-col items-start gap-3 rounded-2xl p-8">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary-glow">
        <Target className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="font-serif text-xl font-semibold tracking-tight">
        JD matching
      </h2>
      <p className="max-w-lg text-sm text-text-secondary">
        Paste a JD or pick one from the feed to get an ATS score, skill overlap,
        and explainable improvement tips — coming in the next release.
      </p>
    </div>
  )
}
