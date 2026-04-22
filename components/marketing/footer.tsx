import Link from "next/link"
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react"

const columns = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#pricing", label: "Pricing" },
      { href: "#fairness", label: "Fairness" },
    ],
  },
  {
    title: "For",
    links: [
      { href: "#candidates", label: "Candidates" },
      { href: "#recruiters", label: "Recruiters" },
      { href: "#enterprise", label: "Enterprise" },
      { href: "#changelog", label: "Changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#about", label: "About" },
      { href: "#careers", label: "Careers" },
      { href: "#security", label: "Security" },
      { href: "#contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#privacy", label: "Privacy" },
      { href: "#terms", label: "Terms" },
      { href: "#dpa", label: "DPA" },
      { href: "#trust", label: "Trust Center" },
    ],
  },
]

const socials = [
  { icon: Twitter, href: "#twitter", label: "SwiftHire AI on X" },
  { icon: Linkedin, href: "#linkedin", label: "SwiftHire AI on LinkedIn" },
  { icon: Github, href: "#github", label: "SwiftHire AI on GitHub" },
]

export function Footer() {
  return (
    <footer
      className="relative border-t border-border bg-surface/40"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground"
              aria-label="SwiftHire AI home"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
              </span>
              <span className="font-serif text-base font-semibold tracking-tight">
                SwiftHire<span className="text-primary-glow"> AI</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-text-muted">
              Explainable AI for recruitment — built for candidates and
              recruiters alike.
            </p>
            <ul className="mt-2 flex items-center gap-2" aria-label="Social links">
              {socials.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white/[0.02] text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <s.icon className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                {col.title}
              </span>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-text-secondary transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-text-muted">
            © {new Date().getFullYear()} SwiftHire AI, Inc. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-text-muted">
            Built with explainability, shipped on Vercel.
          </p>
        </div>
      </div>
    </footer>
  )
}
