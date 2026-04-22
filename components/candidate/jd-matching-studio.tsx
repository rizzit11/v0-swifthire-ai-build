"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  XCircle,
  Lightbulb,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Preset = {
  id: string
  title: string
  company: string
  snippet: string
  content: string
}

const PRESETS: Preset[] = [
  {
    id: "frontend-sr",
    title: "Senior Frontend Engineer",
    company: "Linear · Remote",
    snippet: "Next.js, TypeScript, design systems",
    content: [
      "We're looking for a Senior Frontend Engineer to own our web product.",
      "",
      "Requirements:",
      "- 5+ years of React/Next.js experience",
      "- Deep TypeScript, accessibility (WCAG 2.2) and performance",
      "- Experience building and maintaining a design system",
      "- Familiarity with server components, suspense, streaming",
      "- Bonus: Postgres, tRPC, Playwright",
    ].join("\n"),
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    company: "Anthropic · Hybrid",
    snippet: "Evaluation, RAG, inference infra",
    content: [
      "Build evaluation and inference infrastructure for frontier models.",
      "",
      "Requirements:",
      "- Strong Python, PyTorch, distributed training",
      "- Experience with RAG, embeddings, and vector DBs",
      "- Comfort with Kubernetes and large-scale data pipelines",
      "- Care about safety, fairness, and auditability",
    ].join("\n"),
  },
  {
    id: "product-designer",
    title: "Product Designer",
    company: "Vercel · Remote",
    snippet: "Design systems, motion, brand",
    content: [
      "Design delightful surfaces for our dashboard and marketing.",
      "",
      "Requirements:",
      "- 4+ years shipping product with engineers",
      "- Fluent in Figma, prototyping, and a design system mindset",
      "- Motion sensibility (Framer Motion a plus)",
      "- Strong writing and systems thinking",
    ].join("\n"),
  },
]

type Match = {
  score: number
  matched: string[]
  missing: string[]
  suggestions: string[]
}

function computeMatch(jd: string): Match {
  const norm = jd.toLowerCase()

  // Candidate skill universe (mock — real version pulls from parsed_data).
  const resumeSkills = [
    "TypeScript",
    "Next.js",
    "React",
    "Tailwind CSS",
    "PostgreSQL",
    "Supabase",
    "AI SDK",
    "Framer Motion",
    "Playwright",
    "Node.js",
  ]

  // JD keywords we'll hunt for.
  const jdKeywords = [
    "Next.js",
    "TypeScript",
    "React",
    "accessibility",
    "design system",
    "server components",
    "Postgres",
    "Playwright",
    "Python",
    "PyTorch",
    "RAG",
    "Kubernetes",
    "Figma",
    "Framer Motion",
    "tRPC",
  ]

  const mentioned = jdKeywords.filter((k) =>
    norm.includes(k.toLowerCase()),
  )

  const matched = mentioned.filter((k) =>
    resumeSkills.some((r) => r.toLowerCase() === k.toLowerCase()),
  )
  const missing = mentioned.filter(
    (k) => !resumeSkills.some((r) => r.toLowerCase() === k.toLowerCase()),
  )

  const coverage =
    mentioned.length === 0
      ? 0
      : Math.round((matched.length / mentioned.length) * 100)

  // Score blends coverage with JD length heuristic.
  const lengthBoost = Math.min(15, Math.round(jd.trim().length / 80))
  const score = Math.max(32, Math.min(98, coverage * 0.75 + 25 + lengthBoost))

  const suggestions = [
    missing.length > 0
      ? `Add a bullet that demonstrates ${missing.slice(0, 2).join(" + ")} on a shipped project.`
      : `Quantify one "Experience" bullet with a % or $ outcome to lift your score 4–6 pts.`,
    `Mirror the JD phrase "${(mentioned[0] ?? "design system").toLowerCase()}" exactly once in your Summary.`,
    `Move strongest keyword-rich bullet to the top of its role — ATS weights earlier lines more heavily.`,
  ]

  return { score: Math.round(score), matched, missing, suggestions }
}

export function JdMatchingStudio() {
  const [jd, setJd] = useState<string>("")
  const [analyzed, setAnalyzed] = useState<Match | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const canAnalyze = jd.trim().length > 40

  async function analyze() {
    if (!canAnalyze) return
    setAnalyzing(true)
    // Simulated latency so the UI feels like "thinking".
    await new Promise((r) => setTimeout(r, 550))
    setAnalyzed(computeMatch(jd))
    setAnalyzing(false)
  }

  const score = analyzed?.score ?? null

  const scoreColor = useMemo(() => {
    if (score == null) return "text-text-muted"
    if (score >= 85) return "text-accent"
    if (score >= 70) return "text-secondary"
    if (score >= 55) return "text-warning"
    return "text-danger"
  }, [score])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Editor */}
      <section className="glass ring-inset-highlight rounded-2xl p-5 lg:col-span-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Job description
            </span>
            <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
              Paste a JD
            </h3>
          </div>
          <Button
            size="sm"
            disabled={!canAnalyze || analyzing}
            onClick={analyze}
            className="h-9 rounded-lg bg-primary px-3 text-primary-foreground hover:bg-primary-glow"
          >
            {analyzing ? (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5 animate-pulse" aria-hidden />
                Analyzing…
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </Button>
        </div>

        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here — responsibilities, requirements, everything. The more we see, the better the signal."
          className={cn(
            "mt-4 h-80 w-full resize-none rounded-xl border border-border bg-surface-alt/60 p-4",
            "font-mono text-[12.5px] leading-relaxed text-foreground placeholder:text-text-muted",
            "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25",
          )}
        />

        <div className="mt-4">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Or start from a sample
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setJd(p.content)
                  setAnalyzed(null)
                }}
                className="group flex flex-col gap-1 rounded-xl border border-border bg-surface-alt/50 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-sm font-medium text-foreground">
                  {p.title}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  {p.company}
                </span>
                <span className="text-[11px] leading-snug text-text-secondary">
                  {p.snippet}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="lg:col-span-2">
        <div className="glass ring-inset-highlight flex flex-col gap-5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              ATS score
            </span>
            <Gauge className="h-4 w-4 text-text-muted" aria-hidden />
          </div>

          {/* Score ring */}
          <div className="flex items-center gap-5">
            <ScoreRing score={analyzed?.score ?? null} />
            <div className="flex flex-col">
              <span className={cn("font-mono text-4xl font-semibold", scoreColor)}>
                {score == null ? "—" : score}
              </span>
              <span className="mt-1 text-xs text-text-secondary">
                {score == null
                  ? "Run an analysis to see your score."
                  : score >= 85
                    ? "Strong fit — apply with confidence."
                    : score >= 70
                      ? "Good overlap — small tweaks unlock more."
                      : score >= 55
                        ? "Partial fit — address a few missing keywords."
                        : "Low overlap — consider a targeted rewrite."}
              </span>
            </div>
          </div>

          {/* Matched / Missing */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Matched
              </span>
              <div className="mt-2 flex flex-wrap gap-1">
                {analyzed?.matched.length ? (
                  analyzed.matched.map((m) => (
                    <span
                      key={m}
                      className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent"
                    >
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-text-muted">
                    {analyzed ? "No matches yet." : "—"}
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-warning">
                <XCircle className="h-3 w-3" aria-hidden />
                Missing
              </span>
              <div className="mt-2 flex flex-wrap gap-1">
                {analyzed?.missing.length ? (
                  analyzed.missing.map((m) => (
                    <span
                      key={m}
                      className="rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] text-warning"
                    >
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-text-muted">
                    {analyzed ? "Nothing obvious is missing." : "—"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary-glow">
              <Lightbulb className="h-3 w-3" aria-hidden />
              Explainable fix-its
            </span>
            <ul className="mt-2 space-y-2">
              {(
                analyzed?.suggestions ?? [
                  "Paste a JD on the left and press Analyze.",
                  "We'll surface the exact keywords your resume is missing.",
                  "Every suggestion is traceable — no hidden signals.",
                ]
              ).map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border bg-surface-alt/50 p-2.5 text-xs leading-relaxed text-text-secondary"
                >
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary-glow">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

function ScoreRing({ score }: { score: number | null }) {
  const radius = 32
  const circ = 2 * Math.PI * radius
  const pct = score == null ? 0 : score / 100
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      aria-hidden
      className="shrink-0"
    >
      <circle
        cx="44"
        cy="44"
        r={radius}
        stroke="rgba(148,163,184,0.18)"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="44"
        cy="44"
        r={radius}
        stroke="url(#ring-gradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 600ms ease" }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
