"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Plan = {
  id: string
  name: string
  audience: string
  price: string
  period: string
  cta: string
  features: string[]
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    id: "candidate",
    name: "Candidate",
    audience: "For individual job seekers",
    price: "Free",
    period: "forever",
    cta: "Start free",
    features: [
      "AI resume builder + parser",
      "Unlimited ATS match scoring",
      "Practice Mode interviews",
      "Application tracker",
    ],
  },
  {
    id: "team",
    name: "Team",
    audience: "For hiring teams up to 25",
    price: "$79",
    period: "per seat / mo",
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Everything in Candidate",
      "Post jobs + AI question sets",
      "Screening Mode interviews",
      "Fairness + bias reports",
      "Shared candidate workspace",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    audience: "For high-volume recruiting",
    price: "Custom",
    period: "annual",
    cta: "Talk to sales",
    features: [
      "Everything in Team",
      "SSO + SCIM provisioning",
      "Custom rubrics + branding",
      "Dedicated success manager",
      "Audit log exports",
    ],
  },
]

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative border-t border-border py-16 sm:py-20"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
            Pricing
          </span>
          <h2
            id="pricing-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Free for candidates. Fair for teams.
          </h2>
          <p className="mt-4 text-pretty text-text-secondary">
            No per-candidate fees. No bait-and-switch. Cancel anytime.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn(
                "relative flex flex-col gap-5 rounded-2xl p-6",
                p.highlighted
                  ? "glass-strong ring-inset-highlight border border-primary/30"
                  : "glass ring-inset-highlight",
              )}
            >
              {p.highlighted ? (
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary-foreground glow-primary">
                  Most popular
                </span>
              ) : null}

              <div className="flex flex-col gap-1">
                <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
                  {p.name}
                </span>
                <span className="text-xs text-text-muted">{p.audience}</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold tracking-tight text-foreground">
                  {p.price}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {p.period}
                </span>
              </div>

              <ul className="flex flex-col gap-2">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-auto h-11 rounded-xl",
                  p.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
                    : "border border-border bg-white/[0.02] text-foreground hover:bg-white/5",
                )}
              >
                <Link href={p.id === "scale" ? "/auth/sign-up?plan=scale" : "/auth/sign-up"}>
                  {p.cta}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
