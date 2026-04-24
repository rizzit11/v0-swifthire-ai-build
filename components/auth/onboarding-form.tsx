"use client"

import { useState, useTransition } from "react"
import { Briefcase, Check, Loader2, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { completeOnboarding } from "@/app/onboarding/actions"

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
    desc: "Post jobs, shortlist fairly, run interviews.",
    Icon: Briefcase,
  },
]

export function OnboardingForm({
  defaultRole,
  defaultName,
  defaultCompany,
  email,
}: {
  defaultRole: Role
  defaultName: string
  defaultCompany: string
  email: string
}) {
  const [role, setRole] = useState<Role>(defaultRole)
  const [fullName, setFullName] = useState(defaultName)
  const [companyName, setCompanyName] = useState(defaultCompany)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await completeOnboarding({
        role,
        fullName,
        companyName: role === "hr" ? companyName : null,
      })
      if (result && !result.ok) {
        setError(result.error)
      }
      // On success, server action redirects — nothing else to do.
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-strong ring-inset-highlight flex flex-col gap-5 rounded-2xl p-6 sm:p-8"
    >
      <div>
        <span className="mb-2 block text-xs text-text-secondary">
          Signed in as
        </span>
        <div className="rounded-lg border border-border bg-surface-alt/60 px-3 py-2 text-sm text-text-secondary">
          {email}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-xs text-text-secondary">
          Account type
        </span>
        <div
          role="radiogroup"
          aria-label="Account type"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
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
                  "relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-surface-alt/60 hover:border-border/80 hover:bg-white/5",
                )}
              >
                {active ? (
                  <Check
                    className="absolute right-3 top-3 h-4 w-4 text-primary-glow"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className={cn(
                    "h-5 w-5",
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
          <Label htmlFor="companyName" className="text-xs text-text-secondary">
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
        disabled={isPending}
        className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Setting things up…
          </>
        ) : (
          "Continue to dashboard"
        )}
      </Button>
    </form>
  )
}
