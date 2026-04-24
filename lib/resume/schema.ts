import { z } from "zod"

/**
 * Trimmed-down JSON Resume schema (jsonresume.org) — sections we actually
 * render inside the builder. Everything is optional except the top-level
 * shape, so partial resumes always round-trip cleanly through Zustand.
 */

export const basicsSchema = z.object({
  name: z.string().default(""),
  label: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  url: z.string().default(""),
  summary: z.string().default(""),
  location: z
    .object({
      city: z.string().default(""),
      region: z.string().default(""),
      countryCode: z.string().default(""),
    })
    .default({ city: "", region: "", countryCode: "" }),
  profiles: z
    .array(
      z.object({
        network: z.string().default(""),
        username: z.string().default(""),
        url: z.string().default(""),
      }),
    )
    .default([]),
  /**
   * Private storage key for the candidate's profile picture.
   * Rendered iframe never sees this — parent swaps it for a signed URL.
   */
  pictureKey: z.string().optional(),
})
export type Basics = z.infer<typeof basicsSchema>

export const workSchema = z.object({
  name: z.string().default(""),
  position: z.string().default(""),
  url: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  summary: z.string().default(""),
  highlights: z.array(z.string()).default([]),
})
export type Work = z.infer<typeof workSchema>

export const educationSchema = z.object({
  institution: z.string().default(""),
  area: z.string().default(""),
  studyType: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  score: z.string().default(""),
})
export type Education = z.infer<typeof educationSchema>

export const projectSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
})
export type Project = z.infer<typeof projectSchema>

export const skillSchema = z.object({
  name: z.string().default(""),
  level: z.string().default(""),
  keywords: z.array(z.string()).default([]),
})
export type Skill = z.infer<typeof skillSchema>

export const resumeSettingsSchema = z.object({
  template: z.enum(["minimal", "classic", "compact"]).default("minimal"),
  accentColor: z.string().default("#7c3aed"),
  fontFamily: z.enum(["sans", "serif", "mono"]).default("sans"),
  pageSize: z.enum(["A4", "Letter"]).default("A4"),
  showPicture: z.boolean().default(true),
})
export type ResumeSettings = z.infer<typeof resumeSettingsSchema>

export const resumeDataSchema = z.object({
  basics: basicsSchema.default({
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    summary: "",
    location: { city: "", region: "", countryCode: "" },
    profiles: [],
  }),
  work: z.array(workSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  skills: z.array(skillSchema).default([]),
  settings: resumeSettingsSchema.default({
    template: "minimal",
    accentColor: "#7c3aed",
    fontFamily: "sans",
    pageSize: "A4",
    showPicture: true,
  }),
})
export type ResumeData = z.infer<typeof resumeDataSchema>

export const emptyResume: ResumeData = resumeDataSchema.parse({})

/**
 * Adapt legacy / partial `parsed_data` blobs from Supabase into the strict
 * schema without blowing up when fields are missing.
 */
export function coerceResume(data: unknown): ResumeData {
  const parsed = resumeDataSchema.safeParse(data ?? {})
  return parsed.success ? parsed.data : emptyResume
}
