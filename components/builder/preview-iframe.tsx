"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import type { ResumeData } from "@/lib/resume/schema"

export interface PreviewIframeHandle {
  /** Trigger the OS print dialog inside the iframe (clean print stylesheet). */
  print: () => void
}

interface PreviewIframeProps {
  data: ResumeData
}

/**
 * Sandbox the resume preview inside an iframe so:
 * - The dark editor chrome can never bleed into the printed output.
 * - `window.print()` only prints the resume, not the whole app.
 * - Hydration errors in the template never crash the parent UI.
 *
 * Communication is one-way via postMessage. We hold the latest payload
 * in a ref and replay it as soon as the iframe signals it's ready, so
 * we never lose updates that arrived during the iframe's load phase.
 */
export const PreviewIframe = forwardRef<
  PreviewIframeHandle,
  PreviewIframeProps
>(function PreviewIframe({ data }, ref) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const latestRef = useRef<ResumeData>(data)
  const [iframeReady, setIframeReady] = useState(false)

  // Keep latest snapshot for replay-on-ready and for the print handler.
  useEffect(() => {
    latestRef.current = data
  }, [data])

  // Send the current resume into the iframe whenever data OR ready-state
  // changes. Both transitions matter: data-only is the steady state
  // during typing, ready-only triggers the very first paint.
  useEffect(() => {
    if (!iframeReady) return
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      { type: "resume:update", payload: data },
      window.location.origin,
    )
  }, [data, iframeReady])

  // Wait for the child iframe to announce readiness. Using postMessage
  // (not onload) avoids races where onload fires before the listener
  // mounts inside the iframe.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.source !== iframeRef.current?.contentWindow) return
      const payload = event.data as { type?: string } | null
      if (payload?.type === "resume:ready") {
        setIframeReady(true)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const print = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    // Replay the latest snapshot first so we never print stale content.
    win.postMessage(
      { type: "resume:update", payload: latestRef.current },
      window.location.origin,
    )
    // RAF so the new content commits to layout before print() blocks.
    requestAnimationFrame(() => {
      try {
        win.focus()
        win.print()
      } catch {
        // Some browsers throw if focus() is called from a non-user gesture
        // chain; fall back to the parent print so the user still gets PDF.
        window.print()
      }
    })
  }, [])

  useImperativeHandle(ref, () => ({ print }), [print])

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-zinc-100">
      <iframe
        ref={iframeRef}
        title="Resume preview"
        src="/resume/preview"
        // Allow same-origin so postMessage type-check works; sandboxing
        // is unnecessary here because the content is rendered by us.
        className="block h-full w-full border-0"
        loading="eager"
      />
      {!iframeReady ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-zinc-200/60 backdrop-blur-sm">
          <span className="font-mono text-[11px] text-zinc-600">
            Loading preview…
          </span>
        </div>
      ) : null}
    </div>
  )
})
