import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Calendar, MapPin, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

interface PublicJob {
  id: string
  title: string
  description: string
  status: string
  archived_at: string | null
  created_at: string
  company_id: string
}

interface CompanyRow {
  id: string
  name: string
  domain: string | null
}

async function loadJob(id: string): Promise<{
  job: PublicJob
  company: CompanyRow | null
} | null> {
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, description, status, archived_at, created_at, company_id")
    .eq("id", id)
    .eq("status", "open")
    .is("archived_at", null)
    .maybeSingle<PublicJob>()

  if (!job) return null

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, domain")
    .eq("id", job.company_id)
    .maybeSingle<CompanyRow>()

  return { job, company }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await loadJob(id)
  if (!result) {
    return {
      title: "Job not found",
      robots: { index: false, follow: false },
    }
  }

  const { job, company } = result
  const titleLine = company?.name
    ? `${job.title} — ${company.name}`
    : job.title
  // Trim the description to a clean OG snippet without breaking words.
  const description = job.description
    .replace(/\s+/g, " ")
    .slice(0, 200)
    .trim()

  return {
    title: titleLine,
    description,
    alternates: {
      canonical: `/jobs/${job.id}`,
    },
    openGraph: {
      type: "article",
      title: titleLine,
      description,
      url: `/jobs/${job.id}`,
      publishedTime: job.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title: titleLine,
      description,
    },
  }
}

export default async function PublicJobPage({ params }: PageProps) {
  const { id } = await params
  const result = await loadJob(id)
  if (!result) notFound()
  const { job, company } = result

  const posted = new Date(job.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // JSON-LD JobPosting for rich SEO. Search engines index this even
  // without a canonical site, so public job pages ship with SEO out of
  // the box.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    employmentType: "FULL_TIME",
    hiringOrganization: company?.name
      ? {
          "@type": "Organization",
          name: company.name,
          ...(company.domain ? { sameAs: `https://${company.domain}` } : {}),
        }
      : undefined,
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "US" },
    },
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[360px] hero-beam opacity-50"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          SwiftHire AI
        </Link>

        <article className="glass-strong ring-inset-highlight mt-6 flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
          <header className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-glow">
              Open role
            </span>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance sm:text-4xl">
              {job.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
              {company?.name ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-text-muted" aria-hidden />
                  {company.name}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden />
                Remote-friendly
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-text-muted" aria-hidden />
                Posted {posted}
              </span>
            </div>
          </header>

          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {job.description}
          </div>

          <div className="glass ring-inset-highlight flex flex-col gap-2 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-glow"
                aria-hidden
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Apply with SwiftHire AI
                </span>
                <span className="text-xs text-text-secondary">
                  Get instant ATS feedback, JD match, and one-click resume tailoring.
                </span>
              </div>
            </div>
            <Link
              href={`/sign-up?next=/candidate/jobs?job=${job.id}`}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-glow glow-primary"
            >
              Get started
            </Link>
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </div>
  )
}
