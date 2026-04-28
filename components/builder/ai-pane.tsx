"use client"

import { useState, useTransition } from "react"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useResumeStore } from "@/lib/resume/store"
import { aiWriteHighlights, aiWriteSummary } from "@/lib/resume/actions"

type Target = "summary" | `work-${number}`

/**
 * Right pane: lightweight AI writing helpers.
 * Each action invokes a typed Server Action and writes the result
 * back into the same Zustand store the editor and preview read from,
 * which means the iframe re-renders the new copy in <16ms.
 */
export function AiPane() {
  const data = useResumeStore((s) => s.data)
  const setBasics = useResumeStore((s) => s.setBasics)
  const updateWork = useResumeStore((s) => s.updateWork)

  const [target, setTarget] = useState<Target>("summary")
  const [instruction, setInstruction] = useState("")
  const [pending, startTransition] = useTransition()

  const targets: { value: Target; label: string }[] = [
    { value: "summary", label: "Profile summary" },
    ...data.work.map((w, i) => ({
      value: `work-${i}` as const,
      label: `Bullets · ${w.position || w.name || `Role ${i + 1}`}`,
    })),
  ]

  function handleRun() {
    startTransition(async () => {
      if (target === "summary") {
        const res = await aiWriteSummary({
          context: JSON.stringify({
            basics: data.basics,
            work: data.work.slice(0, 3),
            skills: data.skills.slice(0, 12),
          }),
          instruction: instruction || undefined,
        })
        if (!res.ok) {
          toast.error(res.error)
          return
        }
        setBasics({ summary: res.text })
        toast.success("Summary updated")
        return
      }

      const idx = Number(target.split("-")[1])
      const work = data.work[idx]
      if (!work) return
      const res = await aiWriteHighlights({
        context: JSON.stringify({
          role: work.position,
          company: work.name,
          summary: work.summary,
          highlights: work.highlights,
        }),
        instruction: instruction || undefined,
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      updateWork(idx, { highlights: res.highlights })
      toast.success("Bullets refreshed")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-serif text-sm font-semibold tracking-tight">
          Improve writing
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Pick a section, optionally guide the rewrite, and SwiftHire&apos;ll
          produce ATS-friendly copy. Output replaces the section in place —
          your edit history stays intact via undo.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Section
        </Label>
        <Select
          value={target}
          onValueChange={(v) => setTarget(v as Target)}
        >
          <SelectTrigger className="h-8 border-border bg-surface-alt/60 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {targets.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Optional instruction
        </Label>
        <Textarea
          rows={3}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='E.g. "Lean into platform engineering and cost wins."'
          className="resize-none border-border bg-surface-alt/60 text-xs leading-relaxed"
        />
      </div>

      <Button
        onClick={handleRun}
        disabled={pending}
        className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary-glow glow-primary"
      >
        {pending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Writing…
          </>
        ) : (
          <>
            <Wand2 className="h-3.5 w-3.5" aria-hidden />
            Generate
          </>
        )}
      </Button>

      <div className="rounded-xl border border-dashed border-border bg-white/[0.015] p-3">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Sparkles className="h-3.5 w-3.5 text-primary-glow" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Tip
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Drop a job description into the instruction box to bias the rewrite
          toward a specific role&apos;s vocabulary, without changing facts.
        </p>
      </div>
    </div>
  )
}
