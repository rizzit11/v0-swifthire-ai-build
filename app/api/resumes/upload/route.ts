import { after, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseResumePdf } from "@/lib/resume/parser"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json({ error: "PDF only" }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  // 1. Create the resume row first so Storage policy + FK are satisfied.
  const { data: resume, error: resumeErr } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: file.name.replace(/\.pdf$/i, ""),
      source: "upload",
      parse_status: "queued",
    })
    .select("id")
    .single()
  if (resumeErr || !resume) {
    return NextResponse.json(
      { error: resumeErr?.message ?? "Failed to create resume" },
      { status: 500 },
    )
  }

  // 2. Upload PDF to Storage at {user_id}/{resume_id}.pdf
  const storagePath = `${user.id}/${resume.id}.pdf`
  const { error: uploadErr } = await supabase.storage
    .from("resumes")
    .upload(storagePath, bytes, {
      contentType: "application/pdf",
      upsert: true,
    })
  if (uploadErr) {
    // Roll back the resume row on failure.
    await supabase.from("resumes").delete().eq("id", resume.id)
    return NextResponse.json(
      { error: `Upload failed: ${uploadErr.message}` },
      { status: 500 },
    )
  }

  await supabase
    .from("resumes")
    .update({ storage_path: storagePath })
    .eq("id", resume.id)

  // 3. Create job row
  const { data: job, error: jobErr } = await supabase
    .from("resume_parse_jobs")
    .insert({
      resume_id: resume.id,
      user_id: user.id,
      status: "queued",
    })
    .select("id")
    .single()
  if (jobErr || !job) {
    return NextResponse.json(
      { error: jobErr?.message ?? "Failed to enqueue job" },
      { status: 500 },
    )
  }

  // 4. Process asynchronously *after* the response is sent (Next 16 `after`).
  after(async () => {
    await runParseJob({ jobId: job.id, resumeId: resume.id, bytes })
  })

  return NextResponse.json(
    { jobId: job.id, resumeId: resume.id, status: "queued" },
    { status: 202 },
  )
}

async function runParseJob({
  jobId,
  resumeId,
  bytes,
}: {
  jobId: string
  resumeId: string
  bytes: Uint8Array
}) {
  const supabase = await createClient()

  await supabase
    .from("resume_parse_jobs")
    .update({
      status: "processing",
      started_at: new Date().toISOString(),
    })
    .eq("id", jobId)
  await supabase
    .from("resumes")
    .update({ parse_status: "processing" })
    .eq("id", resumeId)

  try {
    const parsed = await parseResumePdf(bytes)

    await supabase
      .from("resumes")
      .update({
        parse_status: "succeeded",
        parsed_json: parsed,
        ats_score: Math.round(parsed.ats_score ?? 0),
        title_suggestion: parsed.role ?? null,
      })
      .eq("id", resumeId)

    await supabase
      .from("resume_parse_jobs")
      .update({
        status: "succeeded",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parse error"
    await supabase
      .from("resume_parse_jobs")
      .update({
        status: "failed",
        error: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)
    await supabase
      .from("resumes")
      .update({ parse_status: "failed" })
      .eq("id", resumeId)
  }
}
