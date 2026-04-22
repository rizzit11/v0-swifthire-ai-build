"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Target,
  Mic,
  Briefcase,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Icons are mapped client-side by string key so server layouts
 * can pass a plain-data `nav` array across the RSC boundary.
 * Do NOT pass React components as props from Server → Client.
 */
const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  resume: FileText,
  target: Target,
  mic: Mic,
  briefcase: Briefcase,
  users: Users,
  shield: ShieldCheck,
}

export type NavItem = {
  href: string
  label: string
  icon: keyof typeof ICONS
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon] ?? LayoutDashboard
        const active =
          pathname === href || (href !== "/" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 text-foreground ring-1 ring-primary/25"
                : "text-text-secondary hover:bg-white/5 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                active
                  ? "text-primary-glow"
                  : "text-text-muted group-hover:text-text-secondary",
              )}
              aria-hidden
            />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
