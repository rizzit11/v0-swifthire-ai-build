"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

/**
 * Password field with a visibility toggle. Pairs with shadcn Input so it
 * inherits every theme token (border, bg, focus ring).
 */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false)
    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={cn(
            "h-11 rounded-xl border-border bg-surface-alt/60 pr-11",
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={cn(
            "absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl",
            "text-text-muted transition-colors hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          )}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    )
  },
)
