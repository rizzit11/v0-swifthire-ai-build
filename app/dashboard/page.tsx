import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRouter() {
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

  const role = profile?.role ?? user.user_metadata?.role ?? "candidate"
  redirect(role === "hr" ? "/hr" : "/candidate")
}
