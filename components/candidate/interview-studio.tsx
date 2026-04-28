"use client"

import { useMemo, useState } from "react"
import {
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
import {
  LiveInterviewRoom,
  type InterviewQuestion,
} from "./live-interview-room"

type Track = {
  id: string
  name: string
  Icon: React.ComponentType<{ className?: string }>
  blurb: string
  mins: number
  accent: string
  questions: InterviewQuestion[]
}

const TRACKS: Track[] = [
  {
    id: "behavioral",
    name: "Behavioral",
    Icon: MessageSquare,
    blurb: "STAR-format answers with coaching on clarity, ownership, impact.",
    mins: 25,
    accent: "text-primary-glow bg-primary/15",
    questions: [
      {
        id: "b1",
        prompt:
          "Tell me about a time you shipped a complex feature under an aggressive deadline. How did you scope, and what did you cut?",
        durationSec: 120,
      },
      {
        id: "b2",
        prompt:
          "Describe a disagreement with a colleague over a technical decision. How did you resolve it?",
        durationSec: 120,
      },
      {
        id: "b3",
        prompt:
          "Walk me through a project that failed. What did you learn, and what would you do differently?",
        durationSec: 120,
      },
      {
        id: "b4",
        prompt:
          "Tell me about a time you had to give difficult feedback to a teammate.",
        durationSec: 120,
      },
    ],
  },
  {
    id: "system",
    name: "System design",
    Icon: Code2,
    blurb: "Scope, tradeoffs, data model, scaling — rubric per section.",
    mins: 40,
    accent: "text-secondary bg-secondary/15",
    questions: [
      {
        id: "s1",
        prompt:
          "Design a URL shortener that needs to support 100M new links/day with sub-50ms reads. Walk me through your data model and caching strategy.",
        durationSec: 240,
      },
      {
        id: "s2",
        prompt:
          "Design the backend for a real-time collaborative document editor (think Notion). Focus on conflict resolution.",
        durationSec: 240,
      },
      {
        id: "s3",
        prompt:
          "How would you architect a notification system that fans out to email, push, and SMS with per-user preferences and rate limits?",
        durationSec: 240,
      },
    ],
  },
  {
    id: "leadership",
    name: "Leadership",
    Icon: Users,
    blurb: "Calibrating disagreement, setting bars, performance feedback.",
    mins: 30,
    accent: "text-accent bg-accent/15",
    questions: [
      {
        id: "l1",
        prompt:
          "Tell me about a time you raised the bar on a team. What was the bar before, and how did you change it?",
        durationSec: 150,
      },
      {
        id: "l2",
        prompt:
          "Describe a time you had to manage someone out of a role. How did you balance candor with care?",
        durationSec: 150,
      },
      {
        id: "l3",
        prompt:
          "How do you decide when to disagree with a more senior leader, and how do you communicate that disagreement?",
        durationSec: 150,
      },
    ],
  },
]

const SAMPLE_FEEDBACK = [
  {
    dim: "Structure",
    score: 4,
    note: "Clear situation -> task -> action -> result arc.",
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
      <section
        aria-label="Pick a track"
        className="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
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
                <span>{t.questions.length} Qs</span>
                <span
                  className="inline-block h-1 w-1 rounded-full bg-border"
                  aria-hidden
                />
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {t.mins} min
                </span>
              </div>
            </button>
          )
        })}
      </section>

      {/* Live interview room — keyed by track so picking a new track
          fully resets media state, including stream and recorder refs. */}
      <LiveInterviewRoom
        key={track.id}
        questions={track.questions}
        trackName={track.name}
      />

      {/* Sample rubric (still preview-grade until we wire AI scoring) */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="glass ring-inset-highlight rounded-2xl p-5 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Coach feedback
              </span>
              <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
                Rubric scoring (sample)
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Live AI scoring lands next release
            </span>
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_FEEDBACK.map((f) => (
              <li key={f.dim} className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-alt/50 p-3">
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
            <ArrowRight className="h-4 w-4 text-text-muted" aria-hidden />
          </div>
        </div>
      </section>
    </div>
  )
}

function ConnectionBadge({
  status,
  latencyMs,
}: {
  status: SocketStatus
  latencyMs: number | null
}) {
  const live =
    status === "open" ||
    status === "connecting" ||
    status === "reconnecting" ||
    status === "closed"

  const config: Record<
    SocketStatus,
    {
      label: string
      tone: string
      Icon: React.ComponentType<{ className?: string }>
    }
  > = {
    idle: {
      label: "Preview mode",
      tone: "border-border bg-surface-alt/50 text-text-muted",
      Icon: WifiOff,
    },
    connecting: {
      label: "Connecting",
      tone: "border-primary/30 bg-primary/10 text-primary-glow",
      Icon: Radio,
    },
    open: {
      label: latencyMs != null ? `Live · ${latencyMs}ms` : "Live",
      tone: "border-primary/30 bg-primary/10 text-primary-glow",
      Icon: Radio,
    },
    reconnecting: {
      label: "Reconnecting",
      tone: "border-accent/30 bg-accent/10 text-accent",
      Icon: Radio,
    },
    closed: {
      label: "Disconnected",
      tone: "border-border bg-surface-alt/50 text-text-muted",
      Icon: WifiOff,
    },
  }

  const { label, tone, Icon } = config[status]

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
        tone,
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          live && status === "open" && "animate-pulse",
        )}
        aria-hidden
      />
      {label}
    </span>
  )
}
