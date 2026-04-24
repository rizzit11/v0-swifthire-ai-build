import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Role router: decides where to send a freshly-authed user.
 * Middleware gates `onboarded === true` for all app routes, so by the time
 * we land here the profile is guaranteed to have a role set.
 */
export default async function DashboardRouter() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarded")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || !profile.onboarded || !profile.role) {
    redirect("/onboarding")
  }

  redirect(profile.role === "hr" ? "/hr" : "/candidate")
}
