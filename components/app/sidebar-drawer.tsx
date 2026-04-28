"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, Sparkles } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarNav, type NavItem } from "./sidebar-nav"
import { SignOutButton } from "./sign-out-button"

/**
 * Hamburger-driven sidebar.
 *
 * The sidebar is hidden on every breakpoint and only appears when the user
 * taps the hamburger trigger in the top bar. We auto-dismiss the drawer
 * on route change so navigating into a feature doesn't leave the menu
 * covering the workspace.
 */
export function SidebarDrawer({
  nav,
  user,
  profile,
  initials,
}: {
  nav: NavItem[]
  user: { email: string | null } | null
  profile: { full_name: string | null } | null
  initials: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Auto-close on route change. We watch pathname so that whenever the
  // user navigates (via the nav links inside the drawer or anywhere else)
  // the drawer slides back out cleanly.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="app-sidebar"
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white/[0.04] text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="app-sidebar"
          side="left"
          className="border-r-border bg-background/95 p-0 backdrop-blur-xl sm:max-w-[280px]"
        >
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>

          <div className="flex h-full flex-col gap-4 px-4 py-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-foreground"
              aria-label="SwiftHire AI — Dashboard"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles
                  className="h-4 w-4 text-primary-foreground"
                  aria-hidden
                />
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
