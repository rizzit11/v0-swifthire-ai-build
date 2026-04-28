import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { emptyResume } from "@/lib/resume/schema"

export const dynamic = "force-dynamic"

/**
 * Bootstrap route for "Build a resume → Open" on the dashboard.
 *
 * Behaviour:
 *  - If the user already owns at least one non-archived resume, jump straight
 *    into the builder for the most recently updated one. This is what most
 *    return visitors expect.
 *  - Otherwise insert a fresh blank resume (RLS keeps it scoped to the
 *    authed user) and redirect into the builder for that new row.
 *
 * Server-only so we can safely mutate the database before navigation, and
 * we never render UI on this path — `redirect()` always throws.
 */
export default async function NewResumeRoute() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in?next=/candidate/resumes/new")

  // 1) Reuse the most recent resume if one already exists.
  const { data: existing } = await supabase
    .from("resumes")
    .select("id")
    .eq("candidate_id", user.id)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    redirect(`/candidate/resumes/${existing.id}/builder`)
  }

  // 2) Otherwise create a blank one and jump into it.
  const { data: created, error } = await supabase
    .from("resumes")
    .insert({
      candidate_id: user.id,
      title: "Untitled resume",
      parsed_data: emptyResume,
      is_primary: true,
    })
    .select("id")
    .single()

  if (error || !created) {
    // Fallback: send them to the resumes list with a hint surfaced via query.
    redirect("/candidate/resumes?new=failed")
  }

  redirect(`/candidate/resumes/${created.id}/builder`)
}
