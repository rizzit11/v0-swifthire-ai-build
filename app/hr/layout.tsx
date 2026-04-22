import { redirect } from "next/navigation"
import { LayoutDashboard, Briefcase, Users, ShieldCheck } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { createClient } from "@/lib/supabase/server"

const nav = [
  { href: "/hr", label: "Overview", Icon: LayoutDashboard },
  { href: "/hr/jobs", label: "Roles", Icon: Briefcase },
  { href: "/hr/applicants", label: "Applicants", Icon: Users },
  { href: "/hr/fairness", label: "Fairness", Icon: ShieldCheck },
]

export default async function HRLayout({ children }: { children: React.ReactNode }) {
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
