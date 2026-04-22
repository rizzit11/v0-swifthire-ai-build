"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; fileName: string; progress: number }
  | { phase: "queued"; fileName: string; jobId: string; resumeId: string }
  | { phase: "processing"; fileName: string; jobId: string; resumeId: string }
  | { phase: "done"; fileName: string; resumeId: string; ats?: number | null }
  | { phase: "error"; message: string }

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export function ResumeUploader() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState<UploadState>({ phase: "idle" })

  const pickFile = () => inputRef.current?.click()

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setState({ phase: "error", message: "Please upload a PDF file." })
        return
      }
      if (file.size > MAX_BYTES) {
        setState({ phase: "error", message: "File is larger than 10 MB." })
        return
      }

      try {
        setState({ phase: "uploading", fileName: file.name, progress: 20 })

        const form = new FormData()
        form.append("file", file)

        const res = await fetch("/api/resumes/upload", {
          method: "POST",
          body: form,
        })
        if (!res.ok) {
          const msg = await res.text()
          throw new Error(msg || `Upload failed (${res.status})`)
        }

        const { jobId, resumeId } = (await res.json()) as {
          jobId: string
          resumeId: string
        }

        setState({ phase: "queued", fileName: file.name, jobId, resumeId })

        // Poll for completion, max ~60s
        let attempts = 0
        const maxAttempts = 40
        const tick = async () => {
          attempts += 1
          const pr = await fetch(`/api/resumes/jobs/${jobId}`, {
            cache: "no-store",
          })
          if (!pr.ok) {
            setState({ phase: "error", message: "Lost job status." })
            return
          }
          const data = (await pr.json()) as {
            status: "pending" | "processing" | "completed" | "failed"
            error?: string | null
            atsScore?: number | null
          }

          if (data.status === "completed") {
            setState({
              phase: "done",
              fileName: file.name,
              resumeId,
              ats: data.atsScore ?? null,
            })
            router.refresh()
            return
          }
          if (data.status === "failed") {
            setState({
              phase: "error",
              message: data.error ?? "Parse failed.",
            })
            return
          }
          setState({
            phase: data.status === "processing" ? "processing" : "queued",
            fileName: file.name,
            jobId,
            resumeId,
          })
          // "queued" UI phase maps to DB "pending"
          if (attempts < maxAttempts) setTimeout(tick, 1500)
          else
            setState({
              phase: "error",
              message: "Timed out waiting for parse. Try refreshing.",
            })
        }
        setTimeout(tick, 800)
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Upload failed.",
        })
      }
    },
    [router],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => setState({ phase: "idle" })
  const busy =
    state.phase === "uploading" ||
    state.phase === "queued" ||
    state.phase === "processing"

  return (
    <section aria-label="Upload resume">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "glass ring-inset-highlight relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-primary/40 bg-primary/5"
            : "border-border/60 hover:border-border",
        )}
      >
        {state.phase === "idle" ? (
          <>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary-glow">
              <UploadCloud className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm text-text-secondary">
              Drop a PDF here, or{" "}
              <button
                type="button"
                onClick={pickFile}
                className="font-medium text-primary-glow underline-offset-4 hover:underline"
              >
                browse
              </button>
            </p>
            <span className="font-mono text-[11px] text-text-muted">
              PDF · up to 10 MB
            </span>
          </>
        ) : null}

        {state.phase === "uploading" ? (
          <UploadingRow fileName={state.fileName} label="Uploading…" />
        ) : null}
        {state.phase === "queued" ? (
          <UploadingRow fileName={state.fileName} label="Queued for parsing…" />
        ) : null}
        {state.phase === "processing" ? (
          <UploadingRow
            fileName={state.fileName}
            label="AI is extracting fields…"
          />
        ) : null}

        {state.phase === "done" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm text-foreground">
              Parsed{" "}
              <span className="font-medium">{state.fileName}</span>
              {typeof state.ats === "number" ? (
                <span className="ml-2 font-mono text-xs text-text-muted">
                  ATS {state.ats}/100
                </span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-primary-glow underline-offset-4 hover:underline"
            >
              Upload another
            </button>
          </div>
        ) : null}

        {state.phase === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-danger/15 text-danger">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm text-foreground">{state.message}</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-primary-glow underline-offset-4 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.currentTarget.value = ""
          }}
          disabled={busy}
        />
      </div>

      <p className="mt-3 flex items-center gap-2 text-[11px] text-text-muted">
        <Sparkles className="h-3 w-3 text-primary-glow" aria-hidden />
        Parsing is asynchronous. You&apos;ll see fields appear below as soon as
        the AI finishes.
      </p>
    </section>
  )
}

function UploadingRow({
  fileName,
  label,
}: {
  fileName: string
  label: string
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary-glow">
          <FileText className="h-4 w-4" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate text-sm text-foreground">{fileName}</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            {label}
          </span>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border/60">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-primary to-secondary" />
      </div>
    </div>
  )
}
