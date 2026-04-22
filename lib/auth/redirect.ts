"use client"

export function getAuthRedirectUrl(path = "/auth/callback") {
  if (typeof window === "undefined") return path
  const dev = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
  return dev ?? `${window.location.origin}${path}`
}
