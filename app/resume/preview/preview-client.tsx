"use client"

import { useEffect, useState } from "react"
import { coerceResume, emptyResume, type ResumeData } from "@/lib/resume/schema"
import { ResumeRenderer } from "@/lib/resume/templates"

/**
 * Lives inside the builder's iframe. Listens for {type:"resume:update"}
 * messages from the parent and rerenders the chosen template. We accept
 * messages only from our own origin (window.location.origin === parent
 * origin because the iframe is same-origin) to prevent untrusted parents
 * from injecting payloads.
 */
export function PreviewClient() {
  const [data, setData] = useState<ResumeData>(emptyResume)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.source !== window.parent) return
      const msg = event.data as { type?: string; payload?: unknown } | null
      if (msg?.type === "resume:update") {
        setData(coerceResume(msg.payload))
      }
    }
    window.addEventListener("message", onMessage)
    // Tell the parent we're ready to receive the first payload.
    try {
      window.parent.postMessage(
        { type: "resume:ready" },
        window.location.origin,
      )
    } catch {
      // Cross-origin parents would throw; this iframe is same-origin so safe.
    }
    return () => window.removeEventListener("message", onMessage)
  }, [])

  return (
    <>
      {/* Print + body resets scoped to this document only. */}
      <style>{`
        html, body {
          background: #f4f4f5;
          color: #18181b;
          margin: 0;
          padding: 0;
        }
        .resume-page {
          padding: 24px;
        }
        @page {
          size: ${data.settings.pageSize};
          margin: 12mm;
        }
        @media print {
          html, body { background: #ffffff; }
          .resume-page { padding: 0; }
        }
      `}</style>
      <div className="resume-page">
        <ResumeRenderer data={data} pictureUrl={null} />
      </div>
    </>
  )
}
