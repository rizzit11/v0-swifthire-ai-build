"use client"

import { useMemo, useState } from "react"
import {
  Mic,
  Code2,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Radio,
  WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useInterviewSocket,
  type SocketStatus,
} from "@/lib/interview/use-interview-socket"

type Track = {
  id: string
  name: string
  Icon: React.ComponentType<{ className?: string }>
  blurb: string
  questions: number
  mins: number
  accent: string
}

const TRACKS: Track[] = [
  {
    id: "behavioral",
    name: "Behavioral",
    Icon: MessageSquare,
    blurb: "STAR-format answers with coaching on clarity, ownership, impact.",
    questions: 12,
    mins: 25,
    accent: "text-primary-glow bg-primary/15",
  },
  {
    id: "system",
    name: "System design",
    Icon: Code2,
    blurb: "Scope, tradeoffs, data model, scaling — rubric per section.",
    questions: 8,
    mins: 40,
    accent: "text-secondary bg-secondary/15",
  },
  {
    id: "leadership",
    name: "Leadership",
    Icon: Users,
    blurb: "Calibrating disagreement, setting bars, performance feedback.",
    questions: 10,
    mins: 30,
    accent: "text-accent bg-accent/15",
  },
]

const SAMPLE_Q =
  "Tell me about a time you shipped a complex feature under an aggressive deadline. How did you scope, and what did you cut?"

const SAMPLE_FEEDBACK = [
  {
    dim: "Structure",
    score: 4,
    note: "Clear situation → task → action → result arc.",
  },
  {
    dim: "Specificity",
    score: 3,
    note: "Strong on 'what'; add one concrete metric to 'result'.",
  },
  {
    dim: "Ownership",
    score: 5,
    note: "Decisive trade-off language; clear sole owner signals.",
  },
  {
    dim: "Reflection",
    score: 3,
    note: "Good self-awareness; next time also cite one thing you'd redo.",
  },
]

export function InterviewStudio() {
  const [track, setTrack] = useState<Track>(TRACKS[0])

  // Live mode is opt-in via env. When NEXT_PUBLIC_INTERVIEW_WS_URL isn't
  // configured the hook stays in `idle` and we render a friendly "preview"
  // chip — same UI, no broken WebSocket attempts.
  const wsUrl = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_INTERVIEW_WS_URL
    return raw && raw.length > 0 ? raw : null
  }, [])

  const socket = useInterviewSocket({
    url: wsUrl,
    autoConnect: !!wsUrl,
    sessionId: track.id,
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <ConnectionBadge status={socket.status} latencyMs={socket.latencyMs} />
      </div>

      {/* Track chooser */}
      <section aria-label="Pick a track" className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TRACKS.map((t) => {
          const active = t.id === track.id
          const Icon = t.Icon
          return (
            <button
              key={t.id}
              onClick={() => setTrack(t)}
              className={cn(
                "glass ring-inset-highlight group relative flex flex-col gap-3 rounded-2xl p-5 text-left transition-all",
                active
                  ? "border-primary/40 ring-1 ring-primary/30"
                  : "hover:-translate-y-0.5 hover:border-primary/20",
              )}
            >
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl",
                  t.accent,
                )}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold tracking-tight">
                  {t.name}
                </h3>
                {active ? (
                  <CheckCircle2
                    className="h-4 w-4 text-primary-glow"
                    aria-hidden
                  />
                ) : null}
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t.blurb}
              </p>
              <div className="mt-auto flex items-center gap-3 font-mono text-[10px] text-text-muted">
                <span>{t.questions} Qs</span>
                <span className="inline-block h-1 w-1 rounded-full bg-border" aria-hidden />
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {t.mins} min
                </span>
              </div>
            </button>
          )
        })}
      </section>

      {/* Live-mock session */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Prompt + recorder */}
        <div className="glass ring-inset-highlight rounded-2xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Question 1 / {track.questions}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {track.name}
            </span>
          </div>
          <blockquote className="mt-3 font-serif text-lg font-medium leading-snug tracking-tight text-foreground">
            &ldquo;{SAMPLE_Q}&rdquo;
          </blockquote>

          {/* Recorder mock */}
          {/* Recorder mock area */}
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-surface-alt/50 p-4">
            <button
              type="button"
              aria-label="Start recording (preview)"
              disabled
              className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary-glow ring-1 ring-primary/40"
            >
              <Mic className="h-5 w-5" aria-hidden />
            </button>
            <div className="flex flex-1 items-center gap-1" aria-hidden>
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-primary-glow/60"
                  style={{
                    height: `${8 + Math.abs(Math.sin(i * 0.6)) * 28}px`,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-text-muted">
              00:00 / 02:00
            </span>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
            Preview mode — recording and AI coaching unlock in the next release.
            Your voice is never sent to the model without an explicit session
            start.
          </p>
        </div>

        {/* Rubric feedback */}
        <div className="glass ring-inset-highlight rounded-2xl p-5 lg:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Coach feedback
          </span>
          <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
            Rubric scoring
          </h3>

          <ul className="mt-4 flex flex-col gap-3">
            {SAMPLE_FEEDBACK.map((f) => (
              <li key={f.dim} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {f.dim}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {f.score}/5
                  </span>
                </div>
                <div
                  className="flex h-1.5 overflow-hidden rounded-full bg-border"
                  aria-hidden
                >
                  <div
                    className="bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${(f.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] leading-snug text-text-secondary">
                  {f.note}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Confidence indicator
              </span>
              <div className="font-mono text-lg font-semibold text-foreground">
                High
              </div>
            </div>
            <ArrowRight
              className="h-4 w-4 text-text-muted"
              aria-hidden
            />
          </div>
        </div>
      </section>
    </div>
  )
}
