import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { coerceResume } from "@/lib/resume/schema"
import { BuilderShell } from "@/components/builder/builder-shell"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Server entry for the 3-pane builder. Defensive selects so an out-of-date
 * Supabase migration (missing `is_public` / `public_slug`) cannot crash the
 * route — we fall back to a narrower select and treat share columns as
 * optional features instead of hard requirements.
 */
export default async function ResumeBuilderPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/sign-in?next=/candidate/resumes/${id}/builder`)

  // Try the rich select first; fall back to the minimal one if the share
  // columns don't exist yet. This makes the builder forward-compatible
  // with environments that haven't applied 009_resume_public_share.sql.
  let title = "Untitled resume"
  let parsedRaw: unknown = null
  let candidateId: string | null = null
  let isPublic = false
  let publicSlug: string | null = null

  const rich = await supabase
    .from("resumes")
    .select("id, title, parsed_data, is_public, public_slug, candidate_id")
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle()

  if (rich.data) {
    title = rich.data.title ?? title
    parsedRaw = rich.data.parsed_data
    candidateId = rich.data.candidate_id
    isPublic = !!rich.data.is_public
    publicSlug = rich.data.public_slug ?? null
  } else if (rich.error) {
    const fallback = await supabase
      .from("resumes")
      .select("id, title, parsed_data, candidate_id")
      .eq("id", id)
      .is("archived_at", null)
      .maybeSingle()
    if (!fallback.data) notFound()
    title = fallback.data.title ?? title
    parsedRaw = fallback.data.parsed_data
    candidateId = fallback.data.candidate_id
  } else {
    notFound()
  }

  if (candidateId !== user.id) notFound()

  const initial = coerceResume(parsedRaw)

  return (
    <BuilderShell
      resumeId={id}
      title={title}
      initial={initial}
      isPublic={isPublic}
      publicSlug={publicSlug}
    />
  )
}
