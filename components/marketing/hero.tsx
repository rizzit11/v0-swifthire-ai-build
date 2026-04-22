"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, ShieldCheck, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AutoTypingResume } from "./auto-typing-resume"
import { ParallaxLayer } from "./parallax-layer"

const trustBadges = [
  { icon: ShieldCheck, label: "SOC 2-ready" },
  { icon: Gauge, label: "Sub-second ATS scoring" },
  { icon: Sparkles, label: "Explainable AI" },
]

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16"
      aria-labelledby="hero-heading"
    >
      {/* Layered parallax backdrop */}
      <ParallaxLayer
        decorative
        speed={-0.25}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
      </ParallaxLayer>
      <ParallaxLayer
        decorative
        speed={0.5}
        className="absolute inset-x-0 top-0 h-[520px]"
      >
        <div className="absolute inset-0 hero-beam" aria-hidden />
      </ParallaxLayer>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass ring-inset-highlight inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-xs font-medium text-text-secondary">
              New · Interview Integrity Signals
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              v2
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            <span className="text-gradient-primary">Hire with</span>
            <br />
            <span className="text-gradient-brand">explainable AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            SwiftHire AI pairs candidates and recruiters on one platform:
            AI-crafted resumes, ATS-grade JD matching, live interview coaching,
            and bias-aware shortlisting — with every score explained.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary-glow glow-primary"
            >
              <Link href="/auth/sign-up">
                Start free — it takes 60s
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-xl border border-border bg-white/[0.02] px-6 text-text-secondary hover:bg-white/5 hover:text-foreground"
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2"
            aria-label="Product highlights"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-xs text-text-muted"
              >
                <Icon className="h-3.5 w-3.5 text-text-secondary" aria-hidden />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Foreground resume panel with subtle opposing parallax so it appears
            to "float" above the backdrop as you scroll. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <ParallaxLayer speed={-0.15}>
            <AutoTypingResume />
          </ParallaxLayer>
        </motion.div>
      </div>
    </section>
  )
}
