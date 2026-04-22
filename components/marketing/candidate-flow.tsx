"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const bullets = [
  "AI resume builder with LaTeX-grade PDF export",
  "Instant ATS score against any JD, with fix-it tips",
  "Unlimited Practice interviews with rubric feedback",
  "One dashboard for applications, scores, and history",
]

export function CandidateFlow() {
  return (
    <section
      className="relative border-t border-border py-16 sm:py-20"
      aria-labelledby="candidate-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
              For candidates
            </span>
            <h2
              id="candidate-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Show up to every interview already prepared.
            </h2>
            <p className="mt-4 max-w-xl text-text-secondary">
              Stop guessing what recruiters want. SwiftHire AI turns every
              application into a feedback loop — so you learn, adjust, and land
              the right role.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -8 }}
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

          {/* Mock dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="glass-strong ring-inset-highlight relative overflow-hidden rounded-2xl p-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Candidate dashboard
              </span>
              <span className="font-mono text-[10px] text-accent">
                ● 3 active
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { k: "Applications", v: "12", d: "+3 wk" },
                { k: "Avg ATS", v: "87", d: "▲ 6" },
                { k: "Practice", v: "24", d: "hrs logged" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-border bg-surface-alt/60 p-3"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {s.k}
                  </span>
                  <div className="mt-1 font-mono text-xl font-semibold text-foreground">
                    {s.v}
                  </div>
                  <span className="font-mono text-[10px] text-accent">
                    {s.d}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-surface-alt/60 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Latest applications
              </span>
              <ul className="mt-2 flex flex-col gap-2">
                {[
                  { r: "Senior FE Eng", c: "Northwind", s: 94, st: "Shortlisted" },
                  { r: "Product Eng", c: "Cohort Labs", s: 88, st: "Screening" },
                  { r: "SWE II", c: "Monograph", s: 76, st: "Submitted" },
                ].map((row) => (
                  <li
                    key={row.r}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {row.r}
                      </span>
                      <span className="text-text-muted">{row.c}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {row.s}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-text-secondary">
                        {row.st}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
