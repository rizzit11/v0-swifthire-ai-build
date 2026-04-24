"use client"

import { useEffect, useState } from "react"
import { useResumeStore, type ResumeStoreState } from "./store"

/**
 * Safe accessor for the persisted Zustand store. Prevents SSR/CSR flicker —
 * only returns the real store state after client-side hydration has
 * completed. Consumers should treat `undefined` as "still loading".
 */
export function useHydratedResumeStore<T>(
  selector: (state: ResumeStoreState) => T,
): T | undefined {
  const [hydrated, setHydrated] = useState(false)
  const value = useResumeStore(selector)

  useEffect(() => {
    // If rehydration already completed before this component mounted,
    // mark as hydrated immediately.
    if (useResumeStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsub = useResumeStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return () => {
      unsub()
    }
  }, [])

  return hydrated ? value : undefined
}
