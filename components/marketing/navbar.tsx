"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#fairness", label: "Fairness" },
  { href: "#pricing", label: "Pricing" },
]

export function Navbar({ authed = false }: { authed?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "backdrop-blur-xl" : "backdrop-blur-0",
      )}
    >
      <div
        className={cn(
          "mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 transition-all duration-300 sm:px-6",
          scrolled
            ? "glass-strong ring-inset-highlight"
            : "border border-transparent bg-transparent",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground"
          aria-label="SwiftHire AI — Home"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="font-serif text-base font-semibold tracking-tight">
            SwiftHire<span className="text-primary-glow"> AI</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <Button
              asChild
              className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
            >
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-9 rounded-xl text-text-secondary hover:bg-white/5 hover:text-foreground"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button
                asChild
                className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
              >
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white/5 text-foreground md:hidden"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <Menu className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 max-w-6xl px-4 md:hidden"
          >
            <div className="glass-strong ring-inset-highlight rounded-2xl p-3">
              <ul className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {authed ? (
                <div className="mt-2">
                  <Button
                    asChild
                    className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                    >
                      Open dashboard
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="rounded-xl border border-border text-text-secondary hover:bg-white/5 hover:text-foreground"
                  >
                    <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow"
                  >
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
