"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User2, Briefcase, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { getAuthRedirectUrl } from "@/lib/auth/redirect"
import { PasswordInput } from "@/components/auth/password-input"
import { OAuthButtons } from "@/components/auth/oauth-buttons"

type Role = "candidate" | "hr"

const roles: Array<{
  id: Role
  title: string
  desc: string
  Icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: "candidate",
    title: "I'm a candidate",
    desc: "Build resumes, match JDs, practice interviews.",
    Icon: User2,
  },
  {
    id: "hr",
    title: "I'm hiring",
    desc: "Post jobs, shortlist fairly, screen candidates.",
    Icon: Briefcase,
  },
]

function strengthOf(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0..4
}

const strengthLabels = ["Too short", "Weak", "Okay", "Strong", "Excellent"]
const strengthColors = [
  "bg-danger",
  "bg-danger",
  "bg-warning",
  "bg-secondary",
  "bg-accent",
]

export function SignUpForm() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("candidate")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = useMemo(() => strengthOf(password), [password])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("/auth/callback"),
          data: {
            full_name: fullName,
            role,
            company_name: role === "hr" ? companyName : null,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons next="/dashboard" />

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Role selector */}
        <div>
          <span className="mb-2 block text-xs text-text-secondary">
            Account type
          </span>
          <div
            role="radiogroup"
            aria-label="Account type"
            className="grid grid-cols-2 gap-2"
          >
            {roles.map(({ id, title, desc, Icon }) => {
              const active = role === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRole(id)}
                  className={cn(
                    "relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-surface-alt/60 hover:border-border/80 hover:bg-white/5",
                  )}
                >
                  {active ? (
                    <Check
                      className="absolute right-2 top-2 h-3.5 w-3.5 text-primary-glow"
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-primary-glow" : "text-text-secondary",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-foreground" : "text-text-secondary",
                    )}
                  >
                    {title}
                  </span>
                  <span className="text-[11px] leading-snug text-text-muted">
                    {desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName" className="text-xs text-text-secondary">
            Full name
          </Label>
          <Input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-xl border-border bg-surface-alt/60"
          />
        </div>

        {role === "hr" ? (
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="companyName"
              className="text-xs text-text-secondary"
            >
              Company
            </Label>
            <Input
              id="companyName"
              type="text"
              required
              autoComplete="organization"
              placeholder="Acme, Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-11 rounded-xl border-border bg-surface-alt/60"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs text-text-secondary">
            Work email
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
          <Label htmlFor="password" className="text-xs text-text-secondary">
            Password
          </Label>
          <PasswordInput
            id="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Strength meter */}
          <div className="mt-1 flex gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < strength
                    ? strengthColors[strength]
                    : "bg-border",
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-text-muted">
            {password.length === 0
              ? "Minimum 8 characters. Mix upper, number, and symbol for a stronger score."
              : strengthLabels[strength]}
          </span>
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-[11px] leading-relaxed text-text-muted">
          By continuing you agree to SwiftHire&apos;s Terms and acknowledge the
          Privacy notice. Every AI decision is explainable and auditable.
        </p>
      </form>
    </div>
  )
}
