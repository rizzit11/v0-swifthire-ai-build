"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * ParallaxLayer
 *
 * Subtle scroll-linked parallax for decorative backdrops. It translates
 * its children along the Y axis based on the user's scroll position,
 * creating the classic "layered depth" effect without stealing focus
 * from content. Respects prefers-reduced-motion.
 *
 * `speed` ∈ [-1, 1]:
 *   - Positive values move the layer DOWN as you scroll down (slower, "deeper").
 *   - Negative values move the layer UP as you scroll down (faster, "closer").
 */
export function ParallaxLayer({
  children,
  speed = 0.3,
  className,
  decorative = false,
}: {
  children: React.ReactNode
  speed?: number
  className?: string
  /** If true, marks the layer aria-hidden and disables pointer events. */
  decorative?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Map 0..1 scroll progress to a pixel translation. Keep it modest so
  // it reads as depth, not motion sickness.
  const yRaw = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 140 * speed * -1],
  )

  return (
    <div
      ref={ref}
      className={cn(
        "relative",
        decorative && "pointer-events-none",
        className,
      )}
      aria-hidden={decorative || undefined}
    >
      <motion.div style={prefersReducedMotion ? undefined : { y: yRaw }}>
        {children}
      </motion.div>
    </div>
  )
}
