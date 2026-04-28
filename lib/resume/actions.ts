"use server"

import { revalidatePath } from "next/cache"
import { generateText } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { resumeDataSchema, type ResumeData } from "./schema"

/**
 * Persist the full resume document into `resumes.parsed_data`.
 * RLS already restricts updates to `candidate_id = auth.uid()` so a
 * compromised cookie cannot mutate other users' resumes.
 */
export async function saveResume(input: { resumeId: string; data: ResumeData }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: "Unauthorized" }

  const parsed = resumeDataSchema.safeParse(input.data)
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid resume payload" }
  }

  const { error } = await supabase
    .from("resumes")
    .update({
      parsed_data: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.resumeId)
    .eq("candidate_id", user.id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/candidate/resumes/${input.resumeId}/builder`)
  return { ok: true as const, savedAt: Date.now() }
}

/**
 * Toggle a resume between private and public-share. When turning on,
 * we materialize a stable URL slug so the public route can resolve by
 * either the row id OR the slug.
 */
export async function setResumeVisibility(input: {
  resumeId: string
  isPublic: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: "Unauthorized" }

  const slug = input.isPublic
    ? `${input.resumeId.slice(0, 8)}-${Math.random().toString(36).slice(2, 8)}`
    : null

  const { error } = await supabase
    .from("resumes")
    .update({
      is_public: input.isPublic,
      public_slug: slug,
    })
    .eq("id", input.resumeId)
    .eq("candidate_id", user.id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/resume/${input.resumeId}`)
  return { ok: true as const, slug }
}

/* ============================================================
 * AI write actions — guarded, structured, never long-running
 * ============================================================ */

const aiInputSchema = z.object({
  context: z.string().min(1).max(8000),
  instruction: z.string().min(1).max(800).optional(),
})

const SYSTEM_SUMMARY = `You write resume summaries.
Rules:
- Output PLAIN TEXT only, 2–3 sentences, no markdown, no quotes.
- Lead with the candidate's strongest, most recent role; quantify when possible.
- Active voice, no buzzword soup ("synergy", "rockstar", "ninja"). No first person ("I").
- Never invent employers, titles, dates, or metrics.`

const SYSTEM_BULLETS = `You rewrite resume bullets to be ATS-friendly and impact-led.
Rules:
- Return ONE bullet per line, 3 lines max, no leading dashes or markdown.
- Each bullet: action verb → what you did → measurable outcome.
- Keep it under 22 words per bullet. No personal pronouns. No fabricated metrics.`

/**
 * Improve the basics.summary section. Returns a clean string the client
 * can drop directly into the Zustand store with `setBasics`.
 */
export async function aiWriteSummary(raw: unknown) {
  const parsed = aiInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: "Invalid input" }

  // Light auth + rate-limit hint; we don't track quotas yet but we DO
  // require an authed session so anonymous traffic can't burn AI credits.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: "Unauthorized" }

  const prompt = [
    parsed.data.instruction ? `Instruction: ${parsed.data.instruction}` : null,
    "Resume context (JSON):",
    parsed.data.context,
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-flash",
      system: SYSTEM_SUMMARY,
      prompt,
    })
    return { ok: true as const, text: text.trim() }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "AI request failed",
    }
  }
}

/**
 * Improve a single work-history block's bullet list. Returns a string[]
 * the caller splits straight into `work[idx].highlights`.
 */
export async function aiWriteHighlights(raw: unknown) {
  const parsed = aiInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: "Invalid input" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: "Unauthorized" }

  const prompt = [
    parsed.data.instruction ? `Instruction: ${parsed.data.instruction}` : null,
    "Bullet source:",
    parsed.data.context,
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-flash",
      system: SYSTEM_BULLETS,
      prompt,
    })
    const highlights = text
      .split(/\r?\n/)
      .map((l) => l.replace(/^[\s\-•·*]+/, "").trim())
      .filter(Boolean)
      .slice(0, 5)
    return { ok: true as const, highlights }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "AI request failed",
    }
  }
}
