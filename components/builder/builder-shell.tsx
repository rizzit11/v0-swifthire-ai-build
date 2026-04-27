"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Loader2,
  Lock,
  Printer,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useResumeStore } from "@/lib/resume/store"
import type { ResumeData } from "@/lib/resume/schema"
import { saveResume, setResumeVisibility } from "@/lib/resume/actions"
import { track } from "@/lib/analytics/posthog"
import { EditorPane } from "./editor-pane"
import { PreviewIframe, type PreviewIframeHandle } from "./preview-iframe"
import { AiPane } from "./ai-pane"

const AUTOSAVE_DEBOUNCE_MS = 1500

interface BuilderShellProps {
  resumeId: string
  title: string
  initial: ResumeData
  isPublic: boolean
  publicSlug: string | null
}

export function BuilderShell({
  resumeId,
  title,
  initial,
  isPublic: initialIsPublic,
  publicSlug: initialSlug,
}: BuilderShellProps) {
  const data = useResumeStore((s) => s.data)
  const dirty = useResumeStore((s) => s.dirty)
  const savedAt = useResumeStore((s) => s.savedAt)
  const hydrateFromServer = useResumeStore((s) => s.hydrateFromServer)
  const markSaved = useResumeStore((s) => s.markSaved)

  const previewRef = useRef<PreviewIframeHandle>(null)
  const [saving, startSaving] = useTransition()
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [publicSlug, setPublicSlug] = useState(initialSlug)
  const [shareWorking, startShareWork] = useTransition()
  const [resumeTitle, setResumeTitle] = useState(title)

  // Hydrate the persisted Zustand store with server data on first mount.
  // We trust the server payload as source-of-truth; the local persisted
  // draft is only used to survive page reloads.
  const bootedRef = useRef(false)
  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    hydrateFromServer(resumeId, initial)
  }, [hydrateFromServer, resumeId, initial])

  // Debounced autosave: only one save in flight, replays last value if
  // the user edits while saving.
  useEffect(() => {
    if (!dirty) return
    const handle = setTimeout(() => {
      startSaving(async () => {
        const res = await saveResume({ resumeId, data })
        if (res.ok) {
          markSaved()
          track("resume_saved", { resumeId })
        } else {
          toast.error(res.error)
        }
      })
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [dirty, data, resumeId, markSaved])

  const handlePrint = () => {
    previewRef.current?.print()
    track("downloaded_pdf", { resumeId })
  }

  const handleToggleShare = () => {
    startShareWork(async () => {
      const next = !isPublic
      const res = await setResumeVisibility({ resumeId, isPublic: next })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setIsPublic(next)
      setPublicSlug(res.slug)
      toast.success(next ? "Resume is now public" : "Resume is now private")
    })
  }

  const handleCopyShareLink = async () => {
    if (!isPublic) return
    const url = `${window.location.origin}/resume/${publicSlug ?? resumeId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Share link copied")
    } catch {
      toast.error("Couldn't copy link")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col gap-4">
      {/* Top bar */}
      <div className="glass ring-inset-highlight flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-text-secondary hover:text-foreground"
          >
            <Link href="/candidate/resumes">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" aria-hidden />
          <Input
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="h-8 w-[220px] border-transparent bg-transparent px-2 font-serif text-sm font-semibold text-foreground hover:border-border focus-visible:border-border"
            aria-label="Resume title"
          />
          <SaveIndicator saving={saving} dirty={dirty} savedAt={savedAt} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleToggleShare}
            disabled={shareWorking}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-border bg-white/[0.02] text-foreground hover:bg-white/5"
          >
            {isPublic ? (
              <Globe2 className="h-3.5 w-3.5 text-accent" aria-hidden />
            ) : (
              <Lock className="h-3.5 w-3.5" aria-hidden />
            )}
            {isPublic ? "Public" : "Private"}
          </Button>
          {isPublic ? (
            <Button
              onClick={handleCopyShareLink}
              variant="outline"
              size="sm"
              className="h-8 border-border bg-white/[0.02] text-foreground hover:bg-white/5"
            >
              Copy share link
            </Button>
          ) : null}
          <Button
            onClick={handlePrint}
            size="sm"
            className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Print PDF
          </Button>
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)_minmax(0,320px)]">
        <div className="glass ring-inset-highlight flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-glow">
              Editor
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <EditorPane />
          </div>
        </div>

        <div className="glass ring-inset-highlight flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-glow">
              Preview
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {data.settings.template} · {data.settings.pageSize}
            </span>
          </div>
          <PreviewIframe ref={previewRef} data={data} />
        </div>

        <div className="glass ring-inset-highlight flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-glow">
              AI assist
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <AiPane />
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({
  saving,
  dirty,
  savedAt,
}: {
  saving: boolean
  dirty: boolean
  savedAt: number | null
}) {
  if (saving) {
    return (
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Saving…
      </span>
    )
  }
  if (dirty) {
    return (
      <span className="font-mono text-[11px] text-text-muted">
        Unsaved changes
      </span>
    )
  }
  if (savedAt) {
    return (
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
        <CheckCircle2 className="h-3 w-3 text-accent" aria-hidden />
        Saved
      </span>
    )
  }
  return null
}
