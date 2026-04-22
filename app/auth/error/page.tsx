import Link from "next/link"
import { AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Authentication error" }

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden />

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
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-danger/15 text-danger">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {error ?? "We couldn't complete that action. Please try again."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button
              asChild
              className="h-11 rounded-xl border border-border bg-white/[0.02] text-foreground hover:bg-white/5"
            >
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              <Link href="/auth/sign-up">Create account</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
