"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { getAuthRedirectUrl } from "@/lib/auth/redirect"

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

export function SignUpForm() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("candidate")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
                  "flex flex-col gap-2 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-surface-alt/60 hover:border-border/80 hover:bg-white/5",
                )}
              >
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
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-11 rounded-xl border-border bg-surface-alt/60"
        />
      </div>

      {role === "hr" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyName" className="text-xs text-text-secondary">
            Company
          </Label>
          <Input
            id="companyName"
            type="text"
            required
            autoComplete="organization"
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl border-border bg-surface-alt/60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-xs text-text-secondary">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl border-border bg-surface-alt/60"
        />
        <span className="text-[11px] text-text-muted">
          Minimum 8 characters.
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
  )
}
