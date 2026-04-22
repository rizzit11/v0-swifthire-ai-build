"use client"

import { motion } from "framer-motion"
import {
  FileText,
  ScanLine,
  Gauge,
  Mic,
  ShieldCheck,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Feature = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  area: string // grid-area for bento layout
  accent: "primary" | "secondary" | "accent"
  demo?: React.ReactNode
}

const features: Feature[] = [
  {
    title: "AI Resume Builder",
    description:
      "LaTeX-inspired export, live preview, autosave + versioning. JD-aware suggestions that raise your ATS score in real time.",
    icon: FileText,
    area: "builder",
    accent: "primary",
    demo: <BuilderDemo />,
  },
  {
    title: "Resume Parser",
    description:
      "Deterministic extraction with pdfplumber, AI-structured fields, and per-field confidence badges you can edit.",
    icon: ScanLine,
    area: "parser",
    accent: "secondary",
    demo: <ParserDemo />,
  },
  {
    title: "JD Compatibility Engine",
    description:
      "ATS score, skill overlap, missing keywords, and explainable improvement tips — in under a second.",
    icon: Gauge,
    area: "match",
    accent: "accent",
    demo: <MatchDemo />,
  },
  {
    title: "AI Interview Coach",
    description:
      "Practice Mode for candidates, Screening Mode for HR. Live transcript, rubric-based scoring, coaching feedback.",
    icon: Mic,
    area: "interview",
    accent: "primary",
    demo: <InterviewDemo />,
  },
  {
    title: "Integrity Signals",
    description:
      "Confidence indicators from tab events, gaze, and face presence. Transparent — never marketed as cheat-proof.",
    icon: ShieldCheck,
    area: "integrity",
    accent: "secondary",
  },
  {
    title: "Bias-Aware Shortlisting",
    description:
      "Selection-rate skew, SHAP-style feature attributions, and explicit exclusion of sensitive fields.",
    icon: BarChart3,
    area: "bias",
    accent: "accent",
  },
]

export function FeatureBento() {
  return (
    <section
      id="features"
      className="relative py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
            Platform
          </span>
          <h2
            id="features-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            One platform. Six AI-native features.
          </h2>
          <p className="mt-4 text-pretty text-text-secondary">
            Every feature ships with explainability. Every score tells you why.
          </p>
        </header>

        <div
          className={cn(
            "mt-14 grid grid-cols-1 gap-4 sm:gap-5",
            "md:grid-cols-6 md:auto-rows-[minmax(180px,auto)]",
          )}
        >
          {features.map((f, i) => (
            <BentoCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BentoCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon

  // Layout mapping: 6-col md grid, varied spans for bento rhythm.
  const spanClass = {
    builder: "md:col-span-4 md:row-span-2",
    parser: "md:col-span-2",
    match: "md:col-span-2",
    interview: "md:col-span-4 md:row-span-2",
    integrity: "md:col-span-2",
    bias: "md:col-span-6",
  }[feature.area]

  const accentClass = {
    primary: "text-primary-glow bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
  }[feature.accent]

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass ring-inset-highlight group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition-shadow",
        "hover:border-primary/20",
        spanClass,
      )}
    >
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl",
            accentClass,
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {feature.description}
        </p>
      </div>
      {feature.demo ? <div className="mt-5">{feature.demo}</div> : null}
    </motion.article>
  )
}

/* ---------- Inline demos ---------- */

function BuilderDemo() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface-alt/60 p-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Sections
        </span>
        <span className="font-mono text-[10px] text-accent">● autosaved</span>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-xs text-text-secondary">
        {["Personal", "Summary", "Experience", "Projects", "Skills"].map(
          (s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5",
                i === 2 && "bg-primary/10 text-foreground",
              )}
            >
              <span>{s}</span>
              <span className="font-mono text-[10px] text-text-muted">
                {i === 2 ? "editing" : "ok"}
              </span>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

function ParserDemo() {
  const fields: Array<{ k: string; v: string; c: "green" | "amber" | "red" }> = [
    { k: "Name", v: "Ananya S.", c: "green" },
    { k: "Email", v: "a@mail.com", c: "green" },
    { k: "Role", v: "Snr. Product Eng", c: "amber" },
  ]
  const cMap = {
    green: "bg-accent/15 text-accent",
    amber: "bg-warning/15 text-warning",
    red: "bg-danger/15 text-danger",
  }
  return (
    <div className="rounded-xl border border-border bg-surface-alt/60 p-3">
      <ul className="flex flex-col gap-2 text-xs">
        {fields.map((f) => (
          <li key={f.k} className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {f.k}
            </span>
            <span className="truncate text-text-secondary">{f.v}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-mono text-[9px]",
                cMap[f.c],
              )}
            >
              {f.c === "green" ? "0.96" : f.c === "amber" ? "0.74" : "0.42"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MatchDemo() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-alt/60 p-3">
      <ScoreRing value={92} />
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          ATS match
        </span>
        <span className="font-mono text-sm font-semibold text-foreground">
          92<span className="text-text-muted">/100</span>
        </span>
        <span className="text-[11px] text-text-secondary">
          2 missing keywords
        </span>
      </div>
    </div>
  )
}

function ScoreRing({ value }: { value: number }) {
  const r = 20
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="rgba(148,163,184,0.18)"
        strokeWidth="4"
      />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="url(#score-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 26 26)"
      />
      <defs>
        <linearGradient id="score-grad" x1="0" y1="0" x2="52" y2="52">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function InterviewDemo() {
  return (
    <div className="grid grid-cols-5 gap-3">
      <div className="col-span-3 rounded-xl border border-border bg-surface-alt/60 p-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Question 2 · behavioral
        </span>
        <p className="mt-1 text-xs text-text-secondary">
          Tell me about a time you shipped under ambiguity.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-secondary" />
          </span>
          <span className="font-mono text-[10px] text-text-muted">00:47</span>
        </div>
      </div>
      <div className="col-span-2 rounded-xl border border-border bg-surface-alt/60 p-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Rubric
        </span>
        <ul className="mt-2 flex flex-col gap-1.5 text-[11px] text-text-secondary">
          <li className="flex justify-between">
            <span>Clarity</span>
            <span className="font-mono text-accent">8.4</span>
          </li>
          <li className="flex justify-between">
            <span>Depth</span>
            <span className="font-mono text-foreground">7.1</span>
          </li>
          <li className="flex justify-between">
            <span>Structure</span>
            <span className="font-mono text-warning">6.0</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
