import Link from "next/link"
import { Sparkles } from "lucide-react"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata = { title: "Create account" }

export default function SignUpPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] hero-beam opacity-80" aria-hidden />

      <div className="relative w-full max-w-md">
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

        <div className="glass-strong ring-inset-highlight rounded-2xl p-6">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Get started in 60 seconds
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Choose your role — you can always switch later.
          </p>
          <div className="mt-6">
            <SignUpForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
