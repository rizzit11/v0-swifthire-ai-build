"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({
  role: z.enum(["candidate", "hr"]),
  fullName: z.string().min(1, "Please enter your full name").max(120),
  companyName: z.string().max(160).optional().nullable(),
})

export type OnboardingResult = { ok: true } | { ok: false; error: string }

export async function completeOnboarding(
  input: z.infer<typeof schema>,
): Promise<OnboardingResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const { role, fullName, companyName } = parsed.data

  if (role === "hr" && !companyName?.trim()) {
    return { ok: false, error: "Please enter your company name" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not signed in" }

  // 1) Upsert the profile row with role + onboarded flag.
  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: fullName.trim(),
        role,
        onboarded: true,
      },
      { onConflict: "id" },
    )
  if (profileErr) {
    return { ok: false, error: profileErr.message }
  }

  // 2) For HR users, create (or attach to) a company and an hr_profiles row.
  if (role === "hr") {
    const name = companyName!.trim()
    // Best-effort attach: try to find an existing company with the same
    // name the user can see, otherwise create a new one.
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", name)
      .maybeSingle()

    let companyId = existing?.id
    if (!companyId) {
      const { data: created, error: companyErr } = await supabase
        .from("companies")
        .insert({ name })
        .select("id")
        .single()
      if (companyErr || !created) {
        return {
          ok: false,
          error: companyErr?.message ?? "Could not create company",
        }
      }
      companyId = created.id
    }

    const { error: hrErr } = await supabase.from("hr_profiles").upsert(
      {
        profile_id: user.id,
        company_id: companyId,
      },
      { onConflict: "profile_id" },
    )
    if (hrErr) return { ok: false, error: hrErr.message }
  }

  redirect(role === "hr" ? "/hr" : "/candidate")
}
