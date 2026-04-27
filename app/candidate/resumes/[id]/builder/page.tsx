import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { coerceResume } from "@/lib/resume/schema"
import { BuilderShell } from "@/components/builder/builder-shell"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResumeBuilderPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: resume } = await supabase
    .from("resumes")
    .select("id, title, parsed_data, is_public, public_slug, candidate_id")
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle()

  if (!resume || resume.candidate_id !== user.id) notFound()

  const initial = coerceResume(resume.parsed_data)

  return (
    <BuilderShell
      resumeId={resume.id}
      title={resume.title ?? "Untitled resume"}
      initial={initial}
      isPublic={!!resume.is_public}
      publicSlug={resume.public_slug ?? null}
    />
  )
}
