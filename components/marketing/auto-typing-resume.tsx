"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { FileText, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react"

/**
 * Auto-typing resume panel — redesigned from v1 per Section 11.
 * Shows a resume being "written" by AI in real time, with floating
 * ATS score + integrity chips. Glass surface + subtle glow.
 */

type Line = { label: string; value: string; delay?: number }

const resumeLines: Line[] = [
  { label: "Name", value: "Ananya Sharma" },
  { label: "Role", value: "Senior Product Engineer" },
  { label: "Location", value: "Bengaluru, IN · Remote" },
  {
    label: "Summary",
    value:
      "Ships resilient web products. 6y across fintech + SaaS. Loves typed APIs and clean design systems.",
  },
  { label: "Skills", value: "TypeScript · Next.js · Postgres · AI tooling · Design systems" },
  {
    label: "Experience",
    value: "Lead FE @ Northwind · Product Eng @ Cohort Labs · SWE @ Paytm",
  },
]

function useTypewriter(text: string, speed = 18, startDelay = 0) {
  const [out, setOut] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setOut("")
    setDone(false)
    let i = 0
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i += 1
        setOut(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(id)
          setDone(true)
        }
      }, speed)
    }, startDelay)
    return () => clearTimeout(start)
  }, [text, speed, startDelay])

  return { out, done }
}

function TypedLine({ line, index }: { line: Line; index: number }) {
  const delay = 300 + index * 650
  const { out, done } = useTypewriter(line.value, 14, delay)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="flex items-start gap-3"
    >
      <div className="w-20 shrink-0 pt-0.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {line.label}
      </div>
      <div className="min-h-[1.25rem] flex-1 text-sm leading-relaxed text-text-primary">
        {out}
        {!done && <span className="caret-blink" aria-hidden />}
      </div>
    </motion.div>
  )
}

export function AutoTypingResume() {
  // Cycle: full render takes ~5.5s; hold for 3s; reset.
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), 9000)
    return () => clearInterval(id)
  }, [])

  const lines = useMemo(() => resumeLines, [])

  return (
    <div className="relative">
      {/* Floating ATS chip */}
      <motion.div
        initial={{ opacity: 0, x: -24, y: 12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass ring-inset-highlight absolute -left-4 top-10 z-20 flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg animate-float"
        aria-label="ATS match score"
      >
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            ATS match
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            92<span className="text-text-muted">/100</span>
          </span>
        </div>
      </motion.div>

      {/* Floating integrity chip */}
      <motion.div
        initial={{ opacity: 0, x: 24, y: 12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="glass ring-inset-highlight absolute -right-3 bottom-20 z-20 flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg animate-float"
        style={{ animationDelay: "1.2s" }}
        aria-label="Interview integrity signal"
      >
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-secondary/15 text-secondary">
          <ShieldCheck className="h-4 w-4" aria-hidden />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Integrity signal
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            Confident
          </span>
        </div>
      </motion.div>

      {/* Main glass panel */}
      <div
        key={cycle}
        className="glass-strong ring-inset-highlight relative overflow-hidden rounded-2xl p-5 sm:p-6"
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary-glow">
              <FileText className="h-4 w-4" aria-hidden />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium text-foreground">
                resume.swifthire.pdf
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                AI · drafting live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger/70" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-warning/70" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-accent/80" aria-hidden />
          </div>
        </div>

        {/* Resume lines */}
        <div className="mt-4 flex flex-col gap-3">
          {lines.map((line, i) => (
            <TypedLine key={`${cycle}-${i}`} line={line} index={i} />
          ))}
        </div>

        {/* AI suggestion footer */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.2, duration: 0.4 }}
          className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-surface-alt/60 p-3"
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" aria-hidden />
          <p className="text-xs leading-relaxed text-text-secondary">
            <span className="font-medium text-foreground">AI suggestion · </span>
            Quantify impact in &ldquo;Lead FE @ Northwind&rdquo; — add a metric
            like &ldquo;cut TTI by 38%&rdquo; to raise ATS score to{" "}
            <span className="font-mono font-semibold text-accent">96</span>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
