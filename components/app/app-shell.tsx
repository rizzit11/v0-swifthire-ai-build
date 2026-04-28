import Link from "next/link"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SidebarDrawer } from "./sidebar-drawer"
import type { NavItem } from "./sidebar-nav"

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

      <div className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-strong ring-inset-highlight sticky top-4 z-30 mb-6 flex items-center justify-between rounded-2xl px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-3">
            <SidebarDrawer
              nav={nav}
              user={user ? { email: user.email ?? null } : null}
              profile={
                profile ? { full_name: profile.full_name ?? null } : null
              }
              initials={initials}
            />

            {/*
              Logo points to /dashboard — a server route that re-routes
              authed users to /candidate or /hr based on role. Signed-in
              users never land on the marketing page from inside the app,
              so the session no longer *appears* to drop on logo click.
            */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-foreground"
              aria-label="SwiftHire AI — Dashboard"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles
                  className="h-3.5 w-3.5 text-primary-foreground"
                  aria-hidden
                />
              </span>
              <span className="hidden font-serif text-sm font-semibold tracking-tight sm:inline">
                SwiftHire<span className="text-primary-glow"> AI</span>
              </span>
            </Link>

            <span
              className="hidden h-5 w-px bg-border sm:block"
              aria-hidden
            />

            <h1 className="font-serif text-base font-semibold tracking-tight sm:text-lg">
              {title}
            </h1>
          </div>
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
