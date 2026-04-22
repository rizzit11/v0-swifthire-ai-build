"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "We cut time-to-hire by 30% in a quarter. The fairness reports were the reason legal greenlit our rollout.",
    name: "Priya Nair",
    role: "Head of Talent",
    company: "Northwind",
  },
  {
    quote:
      "Practice Mode feels like a senior engineer giving me feedback at 2am. My offer rate doubled.",
    name: "Karan Mehta",
    role: "Senior Product Engineer",
    company: "Stellaris",
  },
  {
    quote:
      "Finally an ATS score we can explain to candidates. No more black-box rejections.",
    name: "Sofia Rossi",
    role: "Recruiting Lead",
    company: "Cohort Labs",
  },
]

export function Testimonials() {
  return (
    <section
      className="relative border-t border-border py-16 sm:py-20"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
            Teams using SwiftHire
          </span>
          <h2
            id="testimonials-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Loved by recruiters. Trusted by candidates.
          </h2>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass ring-inset-highlight flex flex-col gap-5 rounded-2xl p-6"
            >
              <Quote
                className="h-5 w-5 text-primary-glow"
                aria-hidden
              />
              <blockquote className="text-sm leading-relaxed text-text-secondary">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                <div
                  className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-serif text-sm font-semibold text-primary-foreground"
                  aria-hidden
                >
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">
                    {t.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {t.role} · {t.company}
                  </span>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
