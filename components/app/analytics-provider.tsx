"use client"

import { useEffect } from "react"
import { initAnalytics } from "@/lib/analytics/posthog"

/**
 * Mount once near the root. Safe to call without a PostHog key — the
 * wrapper no-ops when one isn't configured.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics()
  }, [])
  return null
}
