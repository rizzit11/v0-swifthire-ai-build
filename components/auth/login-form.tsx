"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons next={next} />

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs text-text-secondary">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@work.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-border bg-surface-alt/60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-text-secondary">
              Password
            </Label>
            <button
              type="button"
              className="text-[11px] text-text-muted hover:text-foreground"
              // Placeholder — wire real reset flow in a later phase.
              onClick={() =>
                setError(
                  "Password reset emails will be enabled in the next phase.",
                )
              }
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  )
}
