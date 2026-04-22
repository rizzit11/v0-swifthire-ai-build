"use client"

import { motion } from "framer-motion"
import { ShieldCheck, EyeOff, BarChart3, Scale } from "lucide-react"

const questions = [
  {
    icon: BarChart3,
    q: "What did the candidate score on?",
    a: "Every rubric dimension — clarity, depth, structure, technical accuracy — is scored independently and logged.",
  },
  {
    icon: Scale,
    q: "Which features influenced the score?",
    a: "SHAP-style feature attributions expose which resume + interview signals moved the final score most.",
  },
  {
    icon: EyeOff,
    q: "Were sensitive fields excluded?",
    a: "Name, gender, age, and photo are explicitly stripped before scoring — and the report confirms it.",
  },
  {
    icon: ShieldCheck,
    q: "Is the selection rate skewed?",
    a: "We compute selection rate across groups and flag skew above ±5%, so bias surfaces before offers go out.",
  },
]

export function BiasExplainability() {
  return (
    <section
      id="fairness"
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="fairness-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[420px] -translate-y-1/2 hero-beam opacity-60"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Fairness · Explainability
          </span>
          <h2
            id="fairness-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Every score, fully explained.
          </h2>
          <p className="mt-4 text-pretty text-text-secondary">
            Four questions our fairness report answers — before any candidate is
            shortlisted or rejected.
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {questions.map((item, i) => (
            <motion.article
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass ring-inset-highlight flex gap-4 rounded-2xl p-6"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {item.q}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {item.a}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl text-center text-xs text-text-muted">
          SwiftHire AI ships Integrity Signals and Confidence Indicators. It is
          not marketed as cheat-proof — humans stay in the loop.
        </div>
      </div>
    </section>
  )
}
