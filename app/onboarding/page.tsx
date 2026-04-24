import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/auth/onboarding-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Choose your role",
  description: "Finish setting up your SwiftHire AI workspace.",
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarded, full_name")
    .eq("id", user.id)
    .maybeSingle()

  // Already onboarded — bounce to the right dashboard.
  if (profile?.onboarded && profile?.role) {
    redirect(profile.role === "hr" ? "/hr" : "/candidate")
  }

  const suggestedRole =
    (user.user_metadata?.role as "candidate" | "hr" | undefined) ??
    (profile?.role as "candidate" | "hr" | undefined) ??
    "candidate"
  const suggestedName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    ""
  const suggestedCompany =
    (user.user_metadata?.company_name as string | undefined) ?? ""

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-beam" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-60"
      />
      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-8 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
            One last step
          </span>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Set up your workspace
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Pick the role that matches how you&apos;ll use SwiftHire today.
          </p>
        </div>
        <OnboardingForm
          defaultRole={suggestedRole}
          defaultName={suggestedName}
          defaultCompany={suggestedCompany}
          email={user.email ?? ""}
        />
      </div>
    </main>
  )
}
