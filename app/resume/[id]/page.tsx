import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { coerceResume } from "@/lib/resume/schema"
import { ResumeRenderer } from "@/lib/resume/templates"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

interface PublicResume {
  id: string
  title: string | null
  parsed_data: unknown
  is_public: boolean | null
  public_slug: string | null
  updated_at: string | null
}

/**
 * Resolve by either row id OR public_slug, both gated on `is_public=true`.
 * Slug is preferred for sharing because it doesn't leak the row UUID.
 */
async function loadResume(slugOrId: string): Promise<PublicResume | null> {
  const supabase = await createClient()
  const orFilter = `id.eq.${slugOrId},public_slug.eq.${slugOrId}`
  const { data } = await supabase
    .from("resumes")
    .select("id, title, parsed_data, is_public, public_slug, updated_at")
    .or(orFilter)
    .eq("is_public", true)
    .is("archived_at", null)
    .maybeSingle<PublicResume>()
  return data
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const resume = await loadResume(id)
  if (!resume) {
    return {
      title: "Resume not found",
      robots: { index: false, follow: false },
    }
  }
  const parsed = coerceResume(resume.parsed_data)
  const name = parsed.basics.name || resume.title || "Resume"
  const headline = parsed.basics.label || "Public resume"
  const description = parsed.basics.summary
    ? parsed.basics.summary.slice(0, 200)
    : `${name}'s resume — built with SwiftHire AI.`

  return {
    title: `${name} — ${headline}`,
    description,
    alternates: { canonical: `/resume/${id}` },
    openGraph: {
      type: "profile",
      title: `${name} — ${headline}`,
      description,
      url: `/resume/${id}`,
    },
    twitter: {
      card: "summary",
      title: `${name} — ${headline}`,
      description,
    },
  }
}

export default async function PublicResumePage({ params }: PageProps) {
  const { id } = await params
  const resume = await loadResume(id)
  if (!resume) notFound()

  const data = coerceResume(resume.parsed_data)

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[260px] hero-beam opacity-40"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden />
            SwiftHire AI
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-white/[0.02] px-3 text-xs font-medium text-foreground hover:bg-white/5"
          >
            Build yours
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-border">
          <ResumeRenderer data={data} pictureUrl={null} />
        </div>

        <p className="mt-4 text-center text-[11px] text-text-muted">
          Published with SwiftHire AI
          {resume.updated_at
            ? ` · last updated ${new Date(resume.updated_at).toLocaleDateString()}`
            : ""}
        </p>
      </div>
    </div>
  )
}
