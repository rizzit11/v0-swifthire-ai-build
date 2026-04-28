import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JdMatchingStudio } from "@/components/candidate/jd-matching-studio"

export const dynamic = "force-dynamic"

export default async function JobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, file_name, parsed_data, ats_score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Step 02
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Match your resume to a JD
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Pick the resume you want graded, paste a job description, and
          SwiftHire returns an ATS score, skill overlap, missing keywords, and
          explainable fix-it tips.
        </p>
      </header>

      <JdMatchingStudio resumes={resumes ?? []} />
    </div>
  )
}
