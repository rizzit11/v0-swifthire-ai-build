import { redirect } from "next/navigation"
import { AppShell } from "@/components/app/app-shell"
import type { NavItem } from "@/components/app/sidebar-nav"
import { createClient } from "@/lib/supabase/server"

const nav: NavItem[] = [
  { href: "/hr", label: "Overview", icon: "dashboard" },
  { href: "/hr/jobs", label: "Roles", icon: "briefcase" },
  { href: "/hr/applicants", label: "Applicants", icon: "users" },
  { href: "/hr/fairness", label: "Fairness", icon: "shield" },
]

export default async function HRLayout({
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

  if (profile?.role !== "hr") redirect("/candidate")

  return (
    <AppShell nav={nav} title="HR workspace">
      {children}
    </AppShell>
  )
}
