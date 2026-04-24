"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import {
  coerceResume,
  emptyResume,
  resumeDataSchema,
  type ResumeData,
  type ResumeSettings,
  type Work,
  type Education,
  type Project,
  type Skill,
} from "./schema"

export interface ResumeStoreState {
  // Identity
  resumeId: string | null
  dirty: boolean
  savedAt: number | null

  // Data
  data: ResumeData

  // Bootstrap / lifecycle
  hydrateFromServer: (resumeId: string, data: unknown) => void
  markSaved: () => void
  reset: () => void

  // Basics
  setBasics: (patch: Partial<ResumeData["basics"]>) => void
  setPictureKey: (key: string | undefined) => void

  // Settings
  setSettings: (patch: Partial<ResumeSettings>) => void

  // Work
  addWork: () => void
  updateWork: (idx: number, patch: Partial<Work>) => void
  removeWork: (idx: number) => void

  // Education
  addEducation: () => void
  updateEducation: (idx: number, patch: Partial<Education>) => void
  removeEducation: (idx: number) => void

  // Projects
  addProject: () => void
  updateProject: (idx: number, patch: Partial<Project>) => void
  removeProject: (idx: number) => void

  // Skills
  addSkill: () => void
  updateSkill: (idx: number, patch: Partial<Skill>) => void
  removeSkill: (idx: number) => void
}

function markDirty<T extends { dirty: boolean }>(set: (fn: (s: T) => T) => void) {
  set((s) => ({ ...s, dirty: true }))
}

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set) => ({
      resumeId: null,
      dirty: false,
      savedAt: null,
      data: emptyResume,

      hydrateFromServer: (resumeId, serverData) => {
        set({
          resumeId,
          data: coerceResume(serverData),
          dirty: false,
          savedAt: Date.now(),
        })
      },
      markSaved: () => set({ dirty: false, savedAt: Date.now() }),
      reset: () =>
        set({
          resumeId: null,
          data: emptyResume,
          dirty: false,
          savedAt: null,
        }),

      // ===== Basics =====
      setBasics: (patch) =>
        set((s) => ({
          dirty: true,
          data: { ...s.data, basics: { ...s.data.basics, ...patch } },
        })),
      setPictureKey: (key) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            basics: { ...s.data.basics, pictureKey: key },
          },
        })),

      // ===== Settings =====
      setSettings: (patch) =>
        set((s) => ({
          dirty: true,
          data: { ...s.data, settings: { ...s.data.settings, ...patch } },
        })),

      // ===== Work =====
      addWork: () =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            work: [
              ...s.data.work,
              {
                name: "",
                position: "",
                url: "",
                startDate: "",
                endDate: "",
                summary: "",
                highlights: [],
              },
            ],
          },
        })),
      updateWork: (idx, patch) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            work: s.data.work.map((w, i) => (i === idx ? { ...w, ...patch } : w)),
          },
        })),
      removeWork: (idx) =>
        set((s) => ({
          dirty: true,
          data: { ...s.data, work: s.data.work.filter((_, i) => i !== idx) },
        })),

      // ===== Education =====
      addEducation: () =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            education: [
              ...s.data.education,
              {
                institution: "",
                area: "",
                studyType: "",
                startDate: "",
                endDate: "",
                score: "",
              },
            ],
          },
        })),
      updateEducation: (idx, patch) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            education: s.data.education.map((e, i) =>
              i === idx ? { ...e, ...patch } : e,
            ),
          },
        })),
      removeEducation: (idx) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            education: s.data.education.filter((_, i) => i !== idx),
          },
        })),

      // ===== Projects =====
      addProject: () =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            projects: [
              ...s.data.projects,
              {
                name: "",
                description: "",
                url: "",
                highlights: [],
                keywords: [],
              },
            ],
          },
        })),
      updateProject: (idx, patch) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            projects: s.data.projects.map((p, i) =>
              i === idx ? { ...p, ...patch } : p,
            ),
          },
        })),
      removeProject: (idx) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            projects: s.data.projects.filter((_, i) => i !== idx),
          },
        })),

      // ===== Skills =====
      addSkill: () =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            skills: [...s.data.skills, { name: "", level: "", keywords: [] }],
          },
        })),
      updateSkill: (idx, patch) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            skills: s.data.skills.map((sk, i) =>
              i === idx ? { ...sk, ...patch } : sk,
            ),
          },
        })),
      removeSkill: (idx) =>
        set((s) => ({
          dirty: true,
          data: {
            ...s.data,
            skills: s.data.skills.filter((_, i) => i !== idx),
          },
        })),
    }),
    {
      name: "swifthire:resume-draft",
      storage: createJSONStorage(() => localStorage),
      // Don't persist identity — always resync from the server on load.
      partialize: (s) => ({ data: s.data }),
      // Validate drafts on rehydrate in case the schema evolved.
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current
        const p = persisted as { data?: unknown }
        const parsed = resumeDataSchema.safeParse(p.data)
        return {
          ...current,
          data: parsed.success ? parsed.data : current.data,
        }
      },
    },
  ),
)

// Avoid touching Zustand internals on the server during RSC rendering.
export const resumeStoreHydration = useResumeStore.persist
