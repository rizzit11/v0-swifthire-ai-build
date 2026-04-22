import { redirect } from "next/navigation"
import { LayoutDashboard, FileText, Target, Mic } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { createClient } from "@/lib/supabase/server"

const nav = [
  { href: "/candidate", label: "Overview", Icon: LayoutDashboard },
  { href: "/candidate/resumes", label: "Resumes", Icon: FileText },
  { href: "/candidate/jobs", label: "JD matching", Icon: Target },
  { href: "/candidate/interviews", label: "Interviews", Icon: Mic },
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
