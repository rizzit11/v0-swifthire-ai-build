"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const bullets = [
  "Post jobs and generate question sets with AI",
  "Rank candidates on rubric scores, not gut feel",
  "Fairness reports with feature-level explainability",
  "Funnel + time-to-hire analytics in one glance",
]

const funnelData = [
  { stage: "Applied", count: 428, pct: 100 },
  { stage: "Screening", count: 162, pct: 38 },
  { stage: "Shortlisted", count: 54, pct: 13 },
  { stage: "Offer", count: 8, pct: 2 },
]

export function HrFlow() {
  return (
    <section
      className="relative border-t border-border py-20 sm:py-28"
      aria-labelledby="hr-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Mock HR dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="glass-strong ring-inset-highlight relative overflow-hidden rounded-2xl p-5 lg:order-1"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Senior FE Engineer · shortlisting funnel
              </span>
              <span className="font-mono text-[10px] text-secondary">
                ● live
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-2">
              {funnelData.map((f) => (
                <li key={f.stage} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{f.stage}</span>
                    <span className="font-mono text-foreground">
                      {f.count}
                      <span className="ml-2 text-text-muted">{f.pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border/60">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        "from-primary to-secondary",
                      )}
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface-alt/60 p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Selection rate skew
                </span>
                <div className="mt-1 font-mono text-sm font-semibold text-accent">
                  Within ±3% · balanced
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface-alt/60 p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Time-to-hire
                </span>
                <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                  11.4d <span className="text-accent">▼ 28%</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:order-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
              For recruiters
            </span>
            <h2
              id="hr-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Hire faster — and defend every decision.
            </h2>
            <p className="mt-4 max-w-xl text-text-secondary">
              SwiftHire AI gives recruiters structured scores, not vibes. Every
              shortlisting decision ships with a fairness report and an
              explainable trail.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm text-text-secondary"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden
                  />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
