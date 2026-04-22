"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavItem = {
  href: string
  label: string
  Icon: LucideIcon
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {items.map(({ href, label, Icon }) => {
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
                active ? "text-primary-glow" : "text-text-muted group-hover:text-text-secondary",
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
