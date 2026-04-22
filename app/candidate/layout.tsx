import { redirect } from "next/navigation"
import { AppShell } from "@/components/app/app-shell"
import type { NavItem } from "@/components/app/sidebar-nav"
import { createClient } from "@/lib/supabase/server"

// Plain-data nav (no React components) so it can cross the RSC boundary.
const nav: NavItem[] = [
  { href: "/candidate", label: "Overview", icon: "dashboard" },
  { href: "/candidate/resumes", label: "Resumes", icon: "resume" },
  { href: "/candidate/jobs", label: "JD matching", icon: "target" },
  { href: "/candidate/interviews", label: "Interviews", icon: "mic" },
]

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role === "hr") redirect("/hr")

  return (
    <AppShell nav={nav} title="Candidate workspace">
      {children}
    </AppShell>
  )
}
