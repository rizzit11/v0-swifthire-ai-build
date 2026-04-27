"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { TrackerCardData } from "./tracker-card"

interface AddCardDialogProps {
  open: boolean
  status: TrackerCardData["status"] | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: TrackerCardData["job_data"]) => void
}

export function AddCardDialog({
  open,
  status,
  onOpenChange,
  onSubmit,
}: AddCardDialogProps) {
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")

  // Reset on open so leftover values don't leak between sessions.
  useEffect(() => {
    if (open) {
      setTitle("")
      setCompany("")
      setLocation("")
      setUrl("")
      setNotes("")
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      company: company.trim() || undefined,
      location: location.trim() || undefined,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface text-foreground">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-tight">
            New card
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Adding to{" "}
            <span className="font-mono text-primary-glow">
              {status ?? "—"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Job title">
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior product engineer"
              className="h-9 border-border bg-surface-alt/60"
            />
          </Field>
          <Field label="Company">
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Vercel"
              className="h-9 border-border bg-surface-alt/60"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote · NYC"
                className="h-9 border-border bg-surface-alt/60"
              />
            </Field>
            <Field label="Posting URL">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                className="h-9 border-border bg-surface-alt/60"
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recruiter contact, salary band, follow-ups..."
              className="resize-none border-border bg-surface-alt/60"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 border-border bg-white/[0.02] text-foreground hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="h-9 bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              Add card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </Label>
      {children}
    </div>
  )
}
