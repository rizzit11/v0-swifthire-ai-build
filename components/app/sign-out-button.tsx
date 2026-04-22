"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      aria-label="Sign out"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-white/[0.02] text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground"
    >
      <LogOut className="h-4 w-4" aria-hidden />
    </button>
  )
}
