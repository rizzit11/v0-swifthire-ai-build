"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Video,
  VideoOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Real interview room.
 *
 * - Uses MediaDevices.getUserMedia to claim a real camera + mic stream.
 * - Renders the candidate's camera in a live <video>, with the mic feeding
 *   a Web Audio AnalyserNode so we can draw a true VU meter (no fake bars).
 * - Records audio via MediaRecorder while the user is "answering" — chunks
 *   are stored in a ref and exposed as a Blob when they hit "End answer".
 * - A per-question countdown auto-advances when time runs out.
 * - Handles permission denial cleanly with a retry path.
 */

export type InterviewQuestion = {
  id: string
  prompt: string
  /** Per-question time budget, in seconds. */
  durationSec: number
}

type Phase =
  | "idle"          // mounted, camera not yet requested
  | "requesting"    // asking permission
  | "ready"         // permission granted, waiting on user to start
  | "answering"     // recording the current answer
  | "paused"        // recording paused mid-answer
  | "review"        // current answer ended, awaiting Next
  | "finished"      // all questions complete
  | "error"

type AnswerArtifact = {
  questionId: string
  blob: Blob
  durationMs: number
  endedReason: "user" | "timer"
}

export function LiveInterviewRoom({
  questions,
  trackName,
}: {
  questions: InterviewQuestion[]
  trackName: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const answerStartRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<Phase>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [remainingSec, setRemainingSec] = useState<number>(
    questions[0]?.durationSec ?? 120,
  )
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [answers, setAnswers] = useState<AnswerArtifact[]>([])

  const current = questions[questionIndex] ?? null
  const totalQuestions = questions.length
  const progressPct = Math.min(
    100,
    Math.round(((questionIndex + (phase === "review" || phase === "finished" ? 1 : 0)) / totalQuestions) * 100),
  )

  // ── Cleanup helpers ──────────────────────────────────────────────────
  const stopMediaStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const stopVisualizer = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    analyserRef.current = null
  }, [])

  // Tear everything down on unmount.
  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.state !== "inactive" && recorderRef.current?.stop()
      } catch {
        /* noop */
      }
      stopVisualizer()
      stopMediaStream()
    }
  }, [stopMediaStream, stopVisualizer])

  // ── Permissions + media setup ────────────────────────────────────────
  const requestMedia = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPhase("error")
      setErrorMsg("Your browser doesn't expose camera/mic access.")
      return
    }
    setPhase("requesting")
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }

      // Build the audio analyser that drives the VU meter.
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new Ctor()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.6
      source.connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      drawMeter()

      setPhase("ready")
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera or microphone permission was denied. Update your browser settings and try again."
          : err instanceof Error
            ? err.message
            : "Couldn't access your camera or microphone."
      setErrorMsg(message)
      setPhase("error")
      stopMediaStream()
    }
    // drawMeter is declared below; the closure picks it up on next tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopMediaStream])

  // ── VU meter ────────────────────────────────────────────────────────
  const drawMeter = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) {
      rafRef.current = requestAnimationFrame(drawMeter)
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const buf = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(buf)

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const bars = 32
    const step = Math.floor(buf.length / bars)
    const barW = w / bars

    for (let i = 0; i < bars; i++) {
      // Average the slice for visual stability.
      let sum = 0
      for (let j = 0; j < step; j++) sum += buf[i * step + j] ?? 0
      const v = sum / step / 255 // 0..1
      const barH = Math.max(2, v * h)
      const x = i * barW + 1
      const y = h - barH

      // Gradient — primary → secondary, matches the design tokens.
      const grad = ctx.createLinearGradient(0, y, 0, h)
      grad.addColorStop(0, "rgba(139, 92, 246, 0.95)")
      grad.addColorStop(1, "rgba(6, 182, 212, 0.65)")
      ctx.fillStyle = grad
      ctx.fillRect(x, y, barW - 2, barH)
    }

    rafRef.current = requestAnimationFrame(drawMeter)
  }, [])

  // ── Recording lifecycle ─────────────────────────────────────────────
  const startAnswer = useCallback(() => {
    const stream = streamRef.current
    if (!stream || !current) return

    chunksRef.current = []
    // Audio-only recording — keeps payloads small for a future upload step
    // and dodges Safari's flaky video-MIME story.
    const audioStream = new MediaStream(stream.getAudioTracks())
    const mime = pickMimeType()
    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(audioStream, mime ? { mimeType: mime } : undefined)
    } catch {
      recorder = new MediaRecorder(audioStream)
    }
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: chunksRef.current[0]?.type ?? "audio/webm",
      })
      const startedAt = answerStartRef.current ?? Date.now()
      const durationMs = Date.now() - startedAt
      setAnswers((prev) => [
        ...prev,
        {
          questionId: current.id,
          blob,
          durationMs,
          endedReason: phaseEndReasonRef.current,
        },
      ])
    }
    recorder.start(250)
    recorderRef.current = recorder
    answerStartRef.current = Date.now()
    setRemainingSec(current.durationSec)
    setPhase("answering")
  }, [current])

  const phaseEndReasonRef = useRef<AnswerArtifact["endedReason"]>("user")

  const stopAnswer = useCallback(
    (reason: AnswerArtifact["endedReason"]) => {
      phaseEndReasonRef.current = reason
      const r = recorderRef.current
      if (r && r.state !== "inactive") {
        try {
          r.stop()
        } catch {
          /* noop */
        }
      }
      recorderRef.current = null
      setPhase((p) => (p === "answering" || p === "paused" ? "review" : p))
    },
    [],
  )

  const togglePause = useCallback(() => {
    const r = recorderRef.current
    if (!r) return
    if (r.state === "recording") {
      r.pause()
      setPhase("paused")
    } else if (r.state === "paused") {
      r.resume()
      setPhase("answering")
    }
  }, [])

  const goToNext = useCallback(() => {
    if (questionIndex + 1 >= totalQuestions) {
      setPhase("finished")
      stopMediaStream()
      stopVisualizer()
      return
    }
    const nextIdx = questionIndex + 1
    setQuestionIndex(nextIdx)
    setRemainingSec(questions[nextIdx]?.durationSec ?? 120)
    setPhase("ready")
  }, [questionIndex, questions, stopMediaStream, stopVisualizer, totalQuestions])

  // ── Countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "answering") return
    if (remainingSec <= 0) {
      stopAnswer("timer")
      return
    }
    const t = setTimeout(() => setRemainingSec((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, remainingSec, stopAnswer])

  // ── Mute toggles ────────────────────────────────────────────────────
  const toggleCam = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? []
    const next = !camOn
    tracks.forEach((t) => (t.enabled = next))
    setCamOn(next)
  }, [camOn])

  const toggleMic = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? []
    const next = !micOn
    tracks.forEach((t) => (t.enabled = next))
    setMicOn(next)
  }, [micOn])

  // ── Render helpers ──────────────────────────────────────────────────
  const formattedTime = useMemo(() => {
    const m = Math.floor(remainingSec / 60).toString().padStart(2, "0")
    const s = (remainingSec % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }, [remainingSec])

  const isLive = phase === "answering" || phase === "paused"

  return (
    <section
      aria-label="Interview room"
      className="grid grid-cols-1 gap-4 lg:grid-cols-5"
    >
      {/* Camera + controls */}
      <div className="glass ring-inset-highlight flex flex-col gap-4 rounded-2xl p-4 lg:col-span-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {trackName}
            </span>
            <span
              className="inline-block h-1 w-1 rounded-full bg-border"
              aria-hidden
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Question {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
              isLive
                ? "border-danger/30 bg-danger/10 text-danger"
                : "border-border bg-surface-alt/50 text-text-muted",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                isLive ? "bg-danger animate-pulse" : "bg-text-muted",
              )}
              aria-hidden
            />
            {isLive ? "Recording" : "Standby"}
          </span>
        </header>

        {/* Video tile */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black object-cover [transform:scaleX(-1)]"
            playsInline
            muted
            aria-label="Your camera preview"
          />

          {/* Empty state overlay */}
          {phase === "idle" || phase === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center">
              {phase === "error" ? (
                <>
                  <AlertTriangle
                    className="h-6 w-6 text-warning"
                    aria-hidden
                  />
                  <p className="max-w-sm text-sm text-foreground">
                    {errorMsg}
                  </p>
                </>
              ) : (
                <>
                  <Video className="h-6 w-6 text-primary-glow" aria-hidden />
                  <p className="max-w-sm text-sm text-foreground">
                    Grant camera and microphone access to start your mock
                    interview. Your media stays in the browser unless you
                    explicitly upload an answer.
                  </p>
                </>
              )}
              <Button
                onClick={requestMedia}
                disabled={phase === "requesting"}
                className="mt-1 h-9 rounded-lg bg-primary px-4 text-primary-foreground hover:bg-primary-glow"
              >
                {phase === "requesting"
                  ? "Requesting…"
                  : phase === "error"
                    ? "Try again"
                    : "Enable camera and mic"}
              </Button>
            </div>
          ) : null}

          {/* Camera-off overlay (when user toggled cam off) */}
          {!camOn && phase !== "idle" && phase !== "error" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-text-muted">
              <VideoOff className="h-6 w-6" aria-hidden />
            </div>
          ) : null}

          {/* Timer pill */}
          {phase !== "idle" && phase !== "error" && phase !== "requesting" ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-black/60 px-2 py-1 font-mono text-[11px] text-foreground backdrop-blur">
              <Clock className="h-3 w-3 text-primary-glow" aria-hidden />
              {formattedTime}
            </span>
          ) : null}
        </div>

        {/* VU meter */}
        <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Microphone level
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {micOn ? "Live" : "Muted"}
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={520}
            height={56}
            className="mt-2 h-14 w-full"
            aria-hidden
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              disabled={!streamRef.current}
              aria-pressed={!micOn}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border transition-colors",
                micOn
                  ? "border-border bg-surface-alt/60 text-foreground hover:bg-white/[0.06]"
                  : "border-danger/30 bg-danger/10 text-danger",
                "disabled:opacity-50",
              )}
            >
              {micOn ? (
                <Mic className="h-4 w-4" aria-hidden />
              ) : (
                <MicOff className="h-4 w-4" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={toggleCam}
              disabled={!streamRef.current}
              aria-pressed={!camOn}
              aria-label={camOn ? "Turn camera off" : "Turn camera on"}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border transition-colors",
                camOn
                  ? "border-border bg-surface-alt/60 text-foreground hover:bg-white/[0.06]"
                  : "border-danger/30 bg-danger/10 text-danger",
                "disabled:opacity-50",
              )}
            >
              {camOn ? (
                <Video className="h-4 w-4" aria-hidden />
              ) : (
                <VideoOff className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {phase === "ready" ? (
              <Button
                onClick={startAnswer}
                className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary-glow glow-primary"
              >
                <Play className="mr-1.5 h-4 w-4" aria-hidden />
                Start answer
              </Button>
            ) : null}

            {phase === "answering" ? (
              <>
                <Button
                  variant="ghost"
                  onClick={togglePause}
                  className="h-10 rounded-xl border border-border bg-white/[0.02] px-4 text-foreground hover:bg-white/[0.06]"
                >
                  <Pause className="mr-1.5 h-4 w-4" aria-hidden />
                  Pause
                </Button>
                <Button
                  onClick={() => stopAnswer("user")}
                  className="h-10 rounded-xl bg-danger px-4 text-white hover:bg-danger/85"
                >
                  <Square className="mr-1.5 h-4 w-4" aria-hidden />
                  End answer
                </Button>
              </>
            ) : null}

            {phase === "paused" ? (
              <>
                <Button
                  onClick={togglePause}
                  className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary-glow"
                >
                  <Play className="mr-1.5 h-4 w-4" aria-hidden />
                  Resume
                </Button>
                <Button
                  onClick={() => stopAnswer("user")}
                  className="h-10 rounded-xl bg-danger px-4 text-white hover:bg-danger/85"
                >
                  <Square className="mr-1.5 h-4 w-4" aria-hidden />
                  End answer
                </Button>
              </>
            ) : null}

            {phase === "review" ? (
              <Button
                onClick={goToNext}
                className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary-glow"
              >
                {questionIndex + 1 >= totalQuestions ? "Finish" : "Next question"}
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Interviewer pane */}
      <aside className="lg:col-span-2">
        <div className="glass ring-inset-highlight flex h-full flex-col gap-4 rounded-2xl p-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary-glow">
              Interviewer
            </span>
            <h3 className="mt-0.5 font-serif text-base font-semibold tracking-tight">
              {phase === "finished" ? "All done" : "Your prompt"}
            </h3>
          </div>

          <div className="rounded-xl border border-border bg-surface-alt/50 p-4">
            <p className="font-serif text-base leading-snug text-foreground">
              {phase === "finished"
                ? "Great work — you completed the round. Review your answers below or take another track."
                : current
                  ? `"${current.prompt}"`
                  : "No questions configured for this track."}
            </p>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Progress
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {progressPct}%
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border"
              aria-hidden
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Tips per phase */}
          <ul className="flex flex-col gap-2 text-[12px] leading-relaxed text-text-secondary">
            {phaseTips(phase).map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-border bg-surface-alt/40 p-2.5"
              >
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-glow"
                  aria-hidden
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          {/* Recorded answers */}
          {answers.length > 0 ? (
            <div className="mt-auto">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Your answers
              </span>
              <ul className="flex flex-col gap-2">
                {answers.map((a, i) => (
                  <AnswerRow key={`${a.questionId}-${i}`} answer={a} index={i + 1} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  )
}

function phaseTips(phase: Phase): string[] {
  switch (phase) {
    case "idle":
      return [
        "We'll request camera + mic access in your browser.",
        "Audio is recorded locally — nothing leaves the page until you upload.",
        "Use a quiet space with even lighting on your face.",
      ]
    case "requesting":
      return ["Click 'Allow' in your browser's permission prompt."]
    case "ready":
      return [
        "Take a breath. Read the prompt twice before you start.",
        "Aim for STAR: Situation, Task, Action, Result.",
        "Recording begins the moment you press Start answer.",
      ]
    case "answering":
      return [
        "Speak slightly slower than feels natural.",
        "Anchor every claim with one specific number or example.",
        "End with the outcome and what you'd do differently.",
      ]
    case "paused":
      return ["Recording paused — resume when you're ready."]
    case "review":
      return [
        "Answer captured.",
        "Press Next question when you're ready to continue.",
      ]
    case "finished":
      return [
        "Round complete.",
        "Review each answer or pick another track for more practice.",
      ]
    case "error":
      return [
        "Camera or mic permission is required.",
        "Check your browser's site settings, then retry.",
      ]
  }
}

function AnswerRow({
  answer,
  index,
}: {
  answer: AnswerArtifact
  index: number
}) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const u = URL.createObjectURL(answer.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [answer.blob])

  const seconds = Math.round(answer.durationMs / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-alt/40 p-2.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Q{index} · {m}:{s.toString().padStart(2, "0")}
          {answer.endedReason === "timer" ? " · time-up" : ""}
        </span>
      </div>
      {url ? (
        <audio
          src={url}
          controls
          className="h-9 w-full"
          aria-label={`Answer ${index} playback`}
        />
      ) : null}
    </li>
  )
}

/** Pick the best supported MIME type for MediaRecorder on this browser. */
function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported?.(c)) return c
  }
  return null
}
