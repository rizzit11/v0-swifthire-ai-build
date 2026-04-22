import Link from "next/link"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "./sign-out-button"
import { SidebarNav, type NavItem } from "./sidebar-nav"

export async function AppShell({
  children,
  nav,
  title,
}: {
  children: React.ReactNode
  nav: NavItem[]
  title: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null }

  const initials =
    (profile?.full_name ?? user?.email ?? "?")
      .split(/[ @]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?"

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[360px] hero-beam opacity-60"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col gap-4 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground"
            aria-label="SwiftHire AI — Home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden />
            </span>
            <span className="font-serif text-base font-semibold tracking-tight">
              SwiftHire<span className="text-primary-glow"> AI</span>
            </span>
          </Link>

          <SidebarNav items={nav} />

          <div className="mt-auto glass ring-inset-highlight flex items-center gap-3 rounded-xl p-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-serif text-sm font-semibold text-primary-foreground"
              aria-hidden
            >
              {initials}
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium text-foreground">
                {profile?.full_name ?? "Account"}
              </span>
              <span className="truncate text-[11px] text-text-muted">
                {user?.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <header className="glass-strong ring-inset-highlight sticky top-4 z-30 mb-6 flex items-center justify-between rounded-2xl px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-foreground lg:hidden"
                aria-label="SwiftHire AI — Home"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" aria-hidden />
                </span>
              </Link>
              <h1 className="font-serif text-base font-semibold tracking-tight sm:text-lg">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <SignOutButton />
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  )
}
