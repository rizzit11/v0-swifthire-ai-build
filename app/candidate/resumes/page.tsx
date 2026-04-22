import { createClient } from "@/lib/supabase/server"
import { ResumeUploader } from "@/components/candidate/resume-uploader"
import { ResumeList } from "@/components/candidate/resume-list"

export const dynamic = "force-dynamic"

export default async function ResumesPage() {
  const supabase = await createClient()
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, is_primary, ats_score, parsed_json, updated_at")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <section>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
          Step 01
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
          Upload or build a resume
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Drop a PDF to get an instant AI-structured parse with per-field
          confidence badges. Your files stay private — only you can read them.
        </p>
      </section>

      <ResumeUploader />
      <ResumeList initial={resumes ?? []} />
    </div>
  )
}
