import { generateObject } from "ai"
import { z } from "zod"

/**
 * Structured resume schema returned by the AI parser.
 * Per-field confidence is in [0,1]; the UI renders green/amber/red badges.
 */
export const resumeSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  role: z.string().nullable().describe("Current or target role title"),
  summary: z.string().nullable(),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        company: z.string().nullable(),
        title: z.string().nullable(),
        start_date: z.string().nullable(),
        end_date: z.string().nullable(),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        school: z.string().nullable(),
        degree: z.string().nullable(),
        start_date: z.string().nullable(),
        end_date: z.string().nullable(),
      }),
    )
    .default([]),
  confidence: z
    .object({
      name: z.number().min(0).max(1).default(0),
      email: z.number().min(0).max(1).default(0),
      phone: z.number().min(0).max(1).default(0),
      role: z.number().min(0).max(1).default(0),
      skills: z.number().min(0).max(1).default(0),
      experience: z.number().min(0).max(1).default(0),
      education: z.number().min(0).max(1).default(0),
    })
    .describe("Per-field extraction confidence in [0,1]."),
  ats_score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Heuristic ATS quality estimate based on structure, clarity, and measurable impact.",
    ),
})

export type ParsedResume = z.infer<typeof resumeSchema>

const SYSTEM = `You are SwiftHire AI's resume parser. Given a resume PDF, extract structured fields.
Rules:
- Never invent data. If a field is missing, return null or an empty array.
- Report per-field confidence in [0,1] based on how clearly the information appears in the document.
- ats_score must reflect resume quality only (structure, clarity, measurable impact). Do not penalize for missing skills vs. any specific JD.
- Do not include demographic attributes. Name is OK; do not extract gender, age, photo, or marital status.`

/**
 * Parse a resume PDF buffer via Gemini Flash (cost-efficient multimodal).
 * Runs through the Vercel AI Gateway — zero config for Google models.
 */
export async function parseResumePdf(pdf: Uint8Array): Promise<ParsedResume> {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash",
    schema: resumeSchema,
    messages: [
      {
        role: "system",
        content: SYSTEM,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract structured fields from this resume. Be faithful to the source.",
          },
          {
            type: "file",
            data: pdf,
            mediaType: "application/pdf",
          },
        ],
      },
    ],
  })

  return object
}
