"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { track } from "@/lib/analytics/posthog"

/* ============================================================
 * Connection state machine
 * ============================================================ */

export type SocketStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed"
  | "error"

export interface InterviewSocketMessage {
  type: string
  // Free-form payload — the protocol is owned by the interview server.
  // We intentionally don't constrain it client-side.
  [key: string]: unknown
}

export interface InterviewSocketOptions {
  /**
   * Full ws:// or wss:// URL. When omitted, the hook stays in "idle"
   * and never opens a socket — useful for rendering a "coming soon"
   * UI without wiring up a server yet.
   */
  url?: string | null
  /** Auto-connect when the hook mounts. Defaults to true if url is set. */
  autoConnect?: boolean
  /** ms between heartbeat pings the client sends to the server. */
  heartbeatMs?: number
  /** ms after a heartbeat with no message before we consider the link dead. */
  heartbeatTimeoutMs?: number
  /** Initial backoff delay; doubles each retry up to maxBackoffMs. */
  initialBackoffMs?: number
  maxBackoffMs?: number
  /** Cap on consecutive reconnect attempts before giving up. */
  maxRetries?: number
  /** Distinct id for analytics correlation (interview session id). */
  sessionId?: string
  /** Called for every parsed message from the server. */
  onMessage?: (msg: InterviewSocketMessage) => void
}

export interface InterviewSocketHandle {
  status: SocketStatus
  /** Number of consecutive reconnect attempts since the last clean open. */
  retryCount: number
  /** Last roundtrip latency (in ms) measured via heartbeat. null until 1st pong. */
  latencyMs: number | null
  /** Manually start the connection (no-op if already connecting/open). */
  connect: () => void
  /** Manually close. Marks the socket "closed" and disables reconnect until next connect(). */
  disconnect: (reason?: string) => void
  /** Send a JSON-serialisable payload. Returns false if the link is not open. */
  send: (msg: InterviewSocketMessage) => boolean
}

/* ============================================================
 * Hook
 * ============================================================ */

const DEFAULTS: Required<
  Pick<
    InterviewSocketOptions,
    | "heartbeatMs"
    | "heartbeatTimeoutMs"
    | "initialBackoffMs"
    | "maxBackoffMs"
    | "maxRetries"
  >
> = {
  heartbeatMs: 15_000,
  heartbeatTimeoutMs: 8_000,
  initialBackoffMs: 750,
  maxBackoffMs: 30_000,
  maxRetries: 8,
}

/**
 * useInterviewSocket
 *
 * A resilient WebSocket client tuned for interview sessions:
 *   - exponential backoff with jitter, capped at maxBackoffMs
 *   - app-level heartbeat (ping/pong) so we detect zombie sockets
 *     even when TCP keepalive fails (proxies, captive portals, etc.)
 *   - PostHog-friendly telemetry through our typed `track` wrapper
 *   - StrictMode-safe: every effect cleans up its socket / timers
 */
export function useInterviewSocket(
  options: InterviewSocketOptions,
): InterviewSocketHandle {
  const {
    url,
    autoConnect = true,
    heartbeatMs = DEFAULTS.heartbeatMs,
    heartbeatTimeoutMs = DEFAULTS.heartbeatTimeoutMs,
    initialBackoffMs = DEFAULTS.initialBackoffMs,
    maxBackoffMs = DEFAULTS.maxBackoffMs,
    maxRetries = DEFAULTS.maxRetries,
    sessionId,
    onMessage,
  } = options

  const [status, setStatus] = useState<SocketStatus>("idle")
  const [retryCount, setRetryCount] = useState(0)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  // Refs hold mutable connection state without retriggering effects.
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const heartbeatDeadlineRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const lastPingAtRef = useRef<number | null>(null)
  const manualCloseRef = useRef(false)

  // Latest onMessage in a ref so effects don't tear down on every render.
  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  /* ---------- timers ---------- */

  const clearHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
    if (heartbeatDeadlineRef.current) {
      clearTimeout(heartbeatDeadlineRef.current)
      heartbeatDeadlineRef.current = null
    }
  }, [])

  const clearReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  /* ---------- backoff ---------- */

  // Exponential with jitter — keeps thundering herds off the server when
  // many candidates lose connectivity simultaneously.
  const nextBackoff = useCallback(() => {
    const base = Math.min(
      initialBackoffMs * 2 ** Math.max(0, retryRef.current - 1),
      maxBackoffMs,
    )
    const jitter = Math.random() * 0.3 * base
    return Math.round(base + jitter)
  }, [initialBackoffMs, maxBackoffMs])

  /* ---------- low-level connect ---------- */

  // Forward declarations so connect ↔ scheduleReconnect can call each other.
  const scheduleReconnectRef = useRef<((reason: string) => void) | null>(null)

  const connectImpl = useCallback(() => {
    if (!url) {
      setStatus("idle")
      return
    }
    // Don't stack sockets on top of each other.
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.CONNECTING ||
        wsRef.current.readyState === WebSocket.OPEN)
    ) {
      return
    }

    manualCloseRef.current = false
    setStatus(retryRef.current === 0 ? "connecting" : "reconnecting")

    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch {
      setStatus("error")
      scheduleReconnectRef.current?.("ctor_error")
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      setStatus("open")
      retryRef.current = 0
      setRetryCount(0)

      // Start heartbeats. We send a ping every heartbeatMs and arm a
      // deadline timer; if no message arrives within heartbeatTimeoutMs
      // after the ping, we treat the socket as dead and force-reconnect.
      heartbeatTimerRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        const sentAt = Date.now()
        lastPingAtRef.current = sentAt
        try {
          ws.send(JSON.stringify({ type: "ping", t: sentAt }))
        } catch {
          // Channel collapsed mid-send; let the close handler reconnect.
          return
        }
        heartbeatDeadlineRef.current = setTimeout(() => {
          // No pong in time — force the socket to close so onclose
          // triggers our reconnect path with a fresh backoff slot.
          try {
            ws.close(4000, "heartbeat_timeout")
          } catch {
            /* noop */
          }
        }, heartbeatTimeoutMs)
      }, heartbeatMs)

      track("interview_started", {
        sessionId: sessionId ?? null,
      })
    }

    ws.onmessage = (event) => {
      // Any incoming traffic implicitly proves the socket is alive,
      // so cancel a pending heartbeat deadline.
      if (heartbeatDeadlineRef.current) {
        clearTimeout(heartbeatDeadlineRef.current)
        heartbeatDeadlineRef.current = null
      }

      let parsed: InterviewSocketMessage
      try {
        parsed = JSON.parse(event.data) as InterviewSocketMessage
      } catch {
        // Non-JSON payload — surface as a generic frame so callers can
        // still reason about it without crashing.
        parsed = { type: "raw", data: event.data }
      }

      if (parsed.type === "pong" && lastPingAtRef.current != null) {
        const rtt = Date.now() - lastPingAtRef.current
        setLatencyMs(rtt)
        return
      }

      onMessageRef.current?.(parsed)
    }

    ws.onerror = () => {
      // The browser does not give us useful detail on errors; rely on
      // onclose for the actual recovery path.
      setStatus("error")
    }

    ws.onclose = (event) => {
      clearHeartbeat()
      wsRef.current = null

      if (manualCloseRef.current) {
        setStatus("closed")
        track("interview_completed", {
          sessionId: sessionId ?? null,
          code: event.code,
        })
        return
      }

      // Unexpected close — reconnect (unless we've exhausted retries).
      track("interview_abandoned", {
        sessionId: sessionId ?? null,
        code: event.code,
        reason: event.reason || "unknown",
        retry: retryRef.current,
      })
      scheduleReconnectRef.current?.(event.reason || "unexpected_close")
    }
  }, [
    url,
    heartbeatMs,
    heartbeatTimeoutMs,
    sessionId,
    clearHeartbeat,
  ])

  const scheduleReconnect = useCallback(
    (_reason: string) => {
      if (manualCloseRef.current) return
      if (retryRef.current >= maxRetries) {
        setStatus("error")
        return
      }
      retryRef.current += 1
      setRetryCount(retryRef.current)
      const delay = nextBackoff()
      setStatus("reconnecting")
      reconnectTimerRef.current = setTimeout(() => {
        connectImpl()
      }, delay)
    },
    [connectImpl, maxRetries, nextBackoff],
  )

  scheduleReconnectRef.current = scheduleReconnect

  /* ---------- public API ---------- */

  const connect = useCallback(() => {
    clearReconnect()
    retryRef.current = 0
    setRetryCount(0)
    connectImpl()
  }, [connectImpl, clearReconnect])

  const disconnect = useCallback(
    (reason?: string) => {
      manualCloseRef.current = true
      clearReconnect()
      clearHeartbeat()
      const ws = wsRef.current
      wsRef.current = null
      if (ws && ws.readyState <= WebSocket.OPEN) {
        try {
          ws.close(1000, reason ?? "client_disconnect")
        } catch {
          /* noop */
        }
      }
      setStatus("closed")
    },
    [clearReconnect, clearHeartbeat],
  )

  const send = useCallback((msg: InterviewSocketMessage) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return false
    try {
      ws.send(JSON.stringify(msg))
      return true
    } catch {
      return false
    }
  }, [])

  /* ---------- auto-connect lifecycle ---------- */

  useEffect(() => {
    if (!autoConnect || !url) return
    connect()
    return () => {
      disconnect("unmount")
    }
    // We intentionally only re-run when url/autoConnect change. connect /
    // disconnect are stable through useCallback chains.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect])

  /* ---------- handle ---------- */

  return useMemo(
    () => ({
      status,
      retryCount,
      latencyMs,
      connect,
      disconnect,
      send,
    }),
    [status, retryCount, latencyMs, connect, disconnect, send],
  )
}
