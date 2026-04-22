import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: job, error } = await supabase
    .from("resume_parse_jobs")
    .select("id, status, error, resume_id")
    .eq("id", id)
    .maybeSingle()

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let atsScore: number | null = null
  if (job.status === "succeeded") {
    const { data: resume } = await supabase
      .from("resumes")
      .select("ats_score")
      .eq("id", job.resume_id)
      .maybeSingle()
    atsScore = resume?.ats_score ?? null
  }

  return NextResponse.json({
    jobId: job.id,
    resumeId: job.resume_id,
    status: job.status,
    error: job.error ?? null,
    atsScore,
  })
}
