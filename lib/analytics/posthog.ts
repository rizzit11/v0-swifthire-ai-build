"use client"

import posthog from "posthog-js"

/**
 * Type-safe, opt-in PostHog wrapper. Events are typed at the call site so
 * we never ship typos. If no key is configured, every call is a no-op —
 * features still work, we just don't record telemetry.
 */

type EventName =
  | "interview_started"
  | "interview_abandoned"
  | "interview_completed"
  | "downloaded_pdf"
  | "resume_saved"
  | "job_saved_to_tracker"
  | "tracker_card_moved"

type EventProps = Record<string, string | number | boolean | null | undefined>

let initialized = false

function hasKey() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)
}

export function initAnalytics() {
  if (typeof window === "undefined") return
  if (initialized || !hasKey()) return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
  })
  initialized = true
}

export function identifyUser(
  distinctId: string,
  traits?: Record<string, string | number | boolean | null | undefined>,
) {
  if (typeof window === "undefined" || !hasKey()) return
  if (!initialized) initAnalytics()
  posthog.identify(distinctId, traits)
}

export function resetAnalytics() {
  if (typeof window === "undefined" || !hasKey()) return
  if (!initialized) return
  posthog.reset()
}

export function track(event: EventName, props?: EventProps) {
  if (typeof window === "undefined") return
  if (!hasKey()) {
    // Keep a trace for local debugging without breaking the build.
    // eslint-disable-next-line no-console
    console.debug("[analytics:noop]", event, props)
    return
  }
  if (!initialized) initAnalytics()
  posthog.capture(event, props)
}
