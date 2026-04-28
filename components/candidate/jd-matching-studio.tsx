"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  Lightbulb,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResumeUploader } from "./resume-uploader"
import {
  ResumePreviewCard,
  extractSkills,
} from "./resume-preview-card"

type ResumeRow = {
  id: string
  file_name: string | null
  ats_score: number | null
  parsed_data: unknown
  created_at: string
}

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

/**
 * Pull JD keywords using a small noise-stop-list heuristic. We extract
 * tokens of length >= 3 that aren't english stopwords and aren't pure
 * digits, then de-dup case-insensitively. Real production would call out
 * to an LLM, but this keeps the page usable offline.
 */
const STOPWORDS = new Set([
  "and", "the", "for", "with", "you", "your", "are", "our", "about",
  "this", "that", "from", "into", "have", "has", "will", "all",
  "any", "but", "not", "etc", "use", "using", "team", "work", "role",
  "job", "year", "years", "experience", "skills", "skill", "ability",
  "looking", "build", "ship", "shipping", "across", "well", "across",
  "preferred", "required", "requirement", "requirements", "responsibilities",
  "what", "who", "how", "where", "when", "why", "lead", "leader",
  "join", "company", "candidates", "candidate", "position", "responsible",
])

function extractJdKeywords(jd: string, resumeSkills: string[]): string[] {
  const tokens = jd
    .toLowerCase()
    .split(/[^a-z0-9+#./-]+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        !STOPWORDS.has(t) &&
        !/^\d+$/.test(t),
    )

  // Always include exact-cased multi-word resume skills the JD mentions.
  const lowered = jd.toLowerCase()
  const compound = resumeSkills.filter(
    (s) => s.includes(" ") && lowered.includes(s.toLowerCase()),
  )

  const counts = new Map<string, number>()
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1)

  // Prioritize words that appear >=2x or that match a resume skill —
  // these are the "real" keywords; everything else is filler.
  const ranked = [...counts.entries()]
    .filter(([t, c]) => c >= 2 || resumeSkills.some((s) => s.toLowerCase() === t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([t]) => t)

  // De-dup while preserving compound phrases.
  const seen = new Set<string>()
  const out: string[] = []
  for (const k of [...compound, ...ranked]) {
    const key = k.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(k)
  }
  return out
}

function computeMatch(jd: string, resumeSkills: string[]): Match {
  const jdKeywords = extractJdKeywords(jd, resumeSkills)
  const skillSet = new Set(resumeSkills.map((s) => s.toLowerCase()))

  const matched = jdKeywords.filter((k) => skillSet.has(k.toLowerCase()))
  const missing = jdKeywords.filter((k) => !skillSet.has(k.toLowerCase()))

  const coverage =
    jdKeywords.length === 0
      ? 0
      : Math.round((matched.length / jdKeywords.length) * 100)

  const lengthBoost = Math.min(15, Math.round(jd.trim().length / 80))
  const score = Math.max(32, Math.min(98, coverage * 0.75 + 25 + lengthBoost))

  const suggestions = [
    missing.length > 0
      ? `Add a bullet that demonstrates ${missing.slice(0, 2).join(" + ")} on a shipped project.`
      : `Quantify one experience bullet with a % or $ outcome to lift your score 4-6 pts.`,
    `Mirror the JD phrase "${(jdKeywords[0] ?? "design system").toLowerCase()}" exactly once in your Summary.`,
    `Move strongest keyword-rich bullet to the top of its role - ATS weights earlier lines more heavily.`,
  ]

  return { score: Math.round(score), matched, missing, suggestions }
}

export function JdMatchingStudio({ resumes }: { resumes: ResumeRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    resumes[0]?.id ?? null,
  )
  const [showUploader, setShowUploader] = useState(resumes.length === 0)
  const [jd, setJd] = useState<string>("")
  const [analyzed, setAnalyzed] = useState<Match | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const selected = useMemo(
    () => resumes.find((r) => r.id === selectedId) ?? null,
    [resumes, selectedId],
  )

  const resumeSkills = useMemo(
    () => extractSkills(selected?.parsed_data),
    [selected],
  )

  const canAnalyze = jd.trim().length > 40 && !!selected

  async function analyze() {
    if (!canAnalyze) return
    setAnalyzing(true)
    await new Promise((r) => setTimeout(r, 450))
    setAnalyzed(computeMatch(jd, resumeSkills))
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
    <div className="flex flex-col gap-5">
      {/* === 1. Resume picker / uploader =============================== */}
      <section
        aria-label="Choose a resume"
        className="glass ring-inset-highlight flex flex-col gap-4 rounded-2xl p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Step 1 · Resume
            </span>
            <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
              Pick the resume to grade
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              We&apos;ll use this resume&apos;s parsed skills to compute the
              JD overlap.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUploader((v) => !v)}
            className="h-9 rounded-lg border border-border bg-white/[0.02] text-foreground hover:border-primary/30 hover:bg-primary/5"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {showUploader ? "Hide uploader" : "Upload new"}
          </Button>
        </div>

        {resumes.length > 0 ? (
          <div
            role="radiogroup"
            aria-label="Saved resumes"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resumes.map((r) => {
              const active = r.id === selectedId
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSelectedId(r.id)
                    setAnalyzed(null)
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-surface-alt/50 hover:border-primary/25 hover:bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                      active
                        ? "bg-primary/20 text-primary-glow"
                        : "bg-surface-alt text-text-muted",
                    )}
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {r.file_name ?? "Untitled resume"}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {typeof r.ats_score === "number"
                        ? `ATS ${Math.round(r.ats_score)}/100`
                        : "Unscored"}
                      {" · "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/60 bg-surface-alt/40 p-4 text-center text-sm text-text-secondary">
            No resumes yet. Upload one below to get started.
          </p>
        )}

        {showUploader ? (
          <div className="border-t border-border/60 pt-4">
            <ResumeUploader />
          </div>
        ) : null}
      </section>

      {/* === 2. Live preview =========================================== */}
      <section aria-label="Resume preview">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Step 2 · Preview
        </span>
        <ResumePreviewCard resume={selected} />
      </section>

      {/* === 3. JD analyzer ============================================ */}
      <section aria-label="Match against a job description">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Step 3 · Match
        </span>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Editor */}
          <div className="glass ring-inset-highlight rounded-2xl p-5 lg:col-span-3">
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
                className="h-9 rounded-lg bg-primary px-3 text-primary-foreground hover:bg-primary-glow disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Sparkles
                      className="mr-1.5 h-3.5 w-3.5 animate-pulse"
                      aria-hidden
                    />
                    Analyzing
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
              placeholder={
                selected
                  ? "Paste the full job description here. The more we see, the better the signal."
                  : "Pick a resume above first, then paste a JD here."
              }
              disabled={!selected}
              className={cn(
                "mt-4 h-72 w-full resize-none rounded-xl border border-border bg-surface-alt/60 p-4",
                "font-mono text-[12.5px] leading-relaxed text-foreground placeholder:text-text-muted",
                "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25",
                "disabled:cursor-not-allowed disabled:opacity-60",
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
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="glass ring-inset-highlight flex flex-col gap-5 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  ATS score
                </span>
                <Gauge className="h-4 w-4 text-text-muted" aria-hidden />
              </div>

              <div className="flex items-center gap-5">
                <ScoreRing score={analyzed?.score ?? null} />
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "font-mono text-4xl font-semibold",
                      scoreColor,
                    )}
                  >
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

              <div>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary-glow">
                  <Lightbulb className="h-3 w-3" aria-hidden />
                  Explainable fix-its
                </span>
                <ul className="mt-2 space-y-2">
                  {(
                    analyzed?.suggestions ?? [
                      "Pick a resume and paste a JD, then press Analyze.",
                      "We'll surface the exact keywords your resume is missing.",
                      "Every suggestion is traceable - no hidden signals.",
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
