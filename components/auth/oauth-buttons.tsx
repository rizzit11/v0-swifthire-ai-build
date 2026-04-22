"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { getAuthRedirectUrl } from "@/lib/auth/redirect"

type Provider = "google" | "github"

function GoogleMark({ className }: { className?: string }) {
  // Official 4-color Google "G" mark. aria-hidden since label lives in the button.
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.1l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.1 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  )
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

export function OAuthButtons({
  next = "/dashboard",
}: {
  next?: string
}) {
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signIn(provider: Provider) {
    setError(null)
    setLoading(provider)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getAuthRedirectUrl(
            `/auth/callback?next=${encodeURIComponent(next)}`,
          ),
        },
      })
      if (error) throw error
      // On success Supabase redirects away; nothing more to do here.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to continue with ${provider}`,
      )
      setLoading(null)
    }
  }

  const base =
    "flex h-11 items-center justify-center gap-2.5 rounded-xl border border-border bg-white/[0.03] px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className={cn(base)}
        >
          {loading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <GoogleMark className="h-4 w-4" />
          )}
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => signIn("github")}
          disabled={loading !== null}
          className={cn(base)}
        >
          {loading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <GitHubMark className="h-4 w-4" />
          )}
          <span>GitHub</span>
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="relative my-1" aria-hidden>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            or continue with email
          </span>
        </div>
      </div>
    </div>
  )
}
