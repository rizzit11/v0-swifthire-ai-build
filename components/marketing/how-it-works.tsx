"use client"

import { motion } from "framer-motion"
import { UploadCloud, Target, MessageSquare, CheckCircle2 } from "lucide-react"

const steps = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Bring your resume — or build one",
    body: "Upload a PDF for instant AI parsing with confidence badges, or craft a LaTeX-grade resume in the builder with live JD suggestions.",
  },
  {
    n: "02",
    icon: Target,
    title: "Match against any job",
    body: "Paste a JD or pick one from the feed. Get an ATS score, skill overlap, missing keywords, and specific tips — explained.",
  },
  {
    n: "03",
    icon: MessageSquare,
    title: "Practice or screen live",
    body: "Spin up a Practice interview for yourself, or run an HR-triggered Screening with a custom question set and integrity signals.",
  },
  {
    n: "04",
    icon: CheckCircle2,
    title: "Decide with confidence",
    body: "Candidates see actionable feedback. HR sees rubric scores, fairness reports, and every factor that influenced the result.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-t border-border py-24 sm:py-32"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
            How it works
          </span>
          <h2
            id="how-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            From application to offer — in four steps.
          </h2>
        </header>

        <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass ring-inset-highlight relative flex flex-col gap-4 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-text-muted">{s.n}</span>
                <s.icon className="h-4 w-4 text-primary-glow" aria-hidden />
              </div>
              <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {s.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
