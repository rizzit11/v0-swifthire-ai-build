import Link from "next/link"
import { MailCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Check your email" }

export default function SignUpSuccessPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] hero-beam opacity-80" aria-hidden />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-foreground"
          aria-label="SwiftHire AI — Home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="font-serif text-base font-semibold tracking-tight">
            SwiftHire<span className="text-primary-glow"> AI</span>
          </span>
        </Link>

        <div className="glass-strong ring-inset-highlight rounded-2xl p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
            <MailCheck className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            We sent you a confirmation link. Click it to activate your account
            — then we&apos;ll route you to the right dashboard automatically.
          </p>

          <Button
            asChild
            className="mt-6 h-11 w-full rounded-xl border border-border bg-white/[0.02] text-foreground hover:bg-white/5"
          >
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
