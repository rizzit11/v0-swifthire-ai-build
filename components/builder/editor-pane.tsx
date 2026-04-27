"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useResumeStore } from "@/lib/resume/store"

/**
 * Left pane: stacked sections that mutate the Zustand store directly.
 * Inputs are deliberately uncontrolled-ish (using `value` from the store
 * + onChange dispatch) so undo/redo through the store stays consistent.
 */
export function EditorPane() {
  return (
    <div className="flex flex-col gap-6">
      <BasicsSection />
      <SettingsSection />
      <WorkSection />
      <ProjectsSection />
      <EducationSection />
      <SkillsSection />
    </div>
  )
}

/* -------------------- Reusable bits -------------------- */

function SectionHeader({
  title,
  onAdd,
}: {
  title: string
  onAdd?: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-serif text-sm font-semibold tracking-tight">
        {title}
      </h3>
      {onAdd ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="h-7 gap-1 border-border bg-white/[0.02] px-2 text-xs hover:bg-white/5"
        >
          <Plus className="h-3 w-3" aria-hidden />
          Add
        </Button>
      ) : null}
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  full,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  full?: boolean
}) {
  return (
    <div className={full ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
      <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 border-border bg-surface-alt/60 text-sm"
      />
    </div>
  )
}

function CardShell({
  onRemove,
  children,
}: {
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col gap-2 rounded-xl border border-border bg-white/[0.015] p-3">
      <button
        type="button"
        aria-label="Remove"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-md p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-danger"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
      {children}
    </div>
  )
}

/* -------------------- Sections -------------------- */

function BasicsSection() {
  const basics = useResumeStore((s) => s.data.basics)
  const setBasics = useResumeStore((s) => s.setBasics)

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Basics" />
      <FieldGrid>
        <InputField
          label="Full name"
          value={basics.name}
          onChange={(v) => setBasics({ name: v })}
          full
        />
        <InputField
          label="Headline"
          value={basics.label}
          onChange={(v) => setBasics({ label: v })}
          placeholder="Senior product engineer"
          full
        />
        <InputField
          label="Email"
          type="email"
          value={basics.email}
          onChange={(v) => setBasics({ email: v })}
        />
        <InputField
          label="Phone"
          value={basics.phone}
          onChange={(v) => setBasics({ phone: v })}
        />
        <InputField
          label="Website"
          value={basics.url}
          onChange={(v) => setBasics({ url: v })}
          full
        />
        <InputField
          label="City"
          value={basics.location.city}
          onChange={(v) =>
            setBasics({ location: { ...basics.location, city: v } })
          }
        />
        <InputField
          label="Region"
          value={basics.location.region}
          onChange={(v) =>
            setBasics({ location: { ...basics.location, region: v } })
          }
        />
      </FieldGrid>

      <div className="flex flex-col gap-1">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Summary
        </Label>
        <Textarea
          rows={4}
          value={basics.summary}
          onChange={(e) => setBasics({ summary: e.target.value })}
          placeholder="Two-to-three sentence pitch — focus on impact and recent wins."
          className="resize-none border-border bg-surface-alt/60 text-sm leading-relaxed"
        />
      </div>
    </section>
  )
}

function SettingsSection() {
  const settings = useResumeStore((s) => s.data.settings)
  const setSettings = useResumeStore((s) => s.setSettings)
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Design" />
      <FieldGrid>
        <div className="flex flex-col gap-1">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Template
          </Label>
          <Select
            value={settings.template}
            onValueChange={(v) =>
              setSettings({ template: v as typeof settings.template })
            }
          >
            <SelectTrigger className="h-8 border-border bg-surface-alt/60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Page size
          </Label>
          <Select
            value={settings.pageSize}
            onValueChange={(v) =>
              setSettings({ pageSize: v as typeof settings.pageSize })
            }
          >
            <SelectTrigger className="h-8 border-border bg-surface-alt/60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Accent
          </Label>
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => setSettings({ accentColor: e.target.value })}
            className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface-alt/60"
            aria-label="Accent color"
          />
        </div>
      </FieldGrid>
    </section>
  )
}

function WorkSection() {
  const work = useResumeStore((s) => s.data.work)
  const addWork = useResumeStore((s) => s.addWork)
  const updateWork = useResumeStore((s) => s.updateWork)
  const removeWork = useResumeStore((s) => s.removeWork)

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Experience" onAdd={addWork} />
      <div className="flex flex-col gap-3">
        {work.length === 0 ? (
          <EmptyHint>Click <strong>Add</strong> to insert a role.</EmptyHint>
        ) : null}
        {work.map((w, idx) => (
          <CardShell key={idx} onRemove={() => removeWork(idx)}>
            <FieldGrid>
              <InputField
                label="Role"
                value={w.position}
                onChange={(v) => updateWork(idx, { position: v })}
              />
              <InputField
                label="Company"
                value={w.name}
                onChange={(v) => updateWork(idx, { name: v })}
              />
              <InputField
                label="Start"
                value={w.startDate}
                onChange={(v) => updateWork(idx, { startDate: v })}
                placeholder="Jan 2023"
              />
              <InputField
                label="End"
                value={w.endDate}
                onChange={(v) => updateWork(idx, { endDate: v })}
                placeholder="Present"
              />
            </FieldGrid>
            <div className="flex flex-col gap-1">
              <Label className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Highlights (one per line)
              </Label>
              <Textarea
                rows={3}
                value={w.highlights.join("\n")}
                onChange={(e) =>
                  updateWork(idx, {
                    highlights: e.target.value
                      .split(/\r?\n/)
                      .map((l) => l.replace(/^[\s\-•·*]+/, "").trim())
                      .filter(Boolean),
                  })
                }
                className="resize-none border-border bg-surface-alt/60 text-xs leading-relaxed"
              />
            </div>
          </CardShell>
        ))}
      </div>
    </section>
  )
}

function ProjectsSection() {
  const projects = useResumeStore((s) => s.data.projects)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Projects" onAdd={addProject} />
      <div className="flex flex-col gap-3">
        {projects.map((p, idx) => (
          <CardShell key={idx} onRemove={() => removeProject(idx)}>
            <FieldGrid>
              <InputField
                label="Name"
                value={p.name}
                onChange={(v) => updateProject(idx, { name: v })}
                full
              />
              <InputField
                label="URL"
                value={p.url}
                onChange={(v) => updateProject(idx, { url: v })}
                full
              />
            </FieldGrid>
            <Textarea
              rows={2}
              placeholder="Short description"
              value={p.description}
              onChange={(e) =>
                updateProject(idx, { description: e.target.value })
              }
              className="resize-none border-border bg-surface-alt/60 text-xs leading-relaxed"
            />
          </CardShell>
        ))}
      </div>
    </section>
  )
}

function EducationSection() {
  const education = useResumeStore((s) => s.data.education)
  const addEducation = useResumeStore((s) => s.addEducation)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const removeEducation = useResumeStore((s) => s.removeEducation)

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Education" onAdd={addEducation} />
      <div className="flex flex-col gap-3">
        {education.map((e, idx) => (
          <CardShell key={idx} onRemove={() => removeEducation(idx)}>
            <FieldGrid>
              <InputField
                label="Institution"
                value={e.institution}
                onChange={(v) => updateEducation(idx, { institution: v })}
                full
              />
              <InputField
                label="Degree"
                value={e.studyType}
                onChange={(v) => updateEducation(idx, { studyType: v })}
              />
              <InputField
                label="Area"
                value={e.area}
                onChange={(v) => updateEducation(idx, { area: v })}
              />
              <InputField
                label="Start"
                value={e.startDate}
                onChange={(v) => updateEducation(idx, { startDate: v })}
              />
              <InputField
                label="End"
                value={e.endDate}
                onChange={(v) => updateEducation(idx, { endDate: v })}
              />
            </FieldGrid>
          </CardShell>
        ))}
      </div>
    </section>
  )
}

function SkillsSection() {
  const skills = useResumeStore((s) => s.data.skills)
  const addSkill = useResumeStore((s) => s.addSkill)
  const updateSkill = useResumeStore((s) => s.updateSkill)
  const removeSkill = useResumeStore((s) => s.removeSkill)

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Skills" onAdd={addSkill} />
      <div className="flex flex-col gap-2">
        {skills.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.015] p-2"
          >
            <Input
              value={s.name}
              onChange={(e) => updateSkill(idx, { name: e.target.value })}
              placeholder="Skill"
              className="h-8 border-border bg-surface-alt/60 text-sm"
            />
            <Input
              value={s.level}
              onChange={(e) => updateSkill(idx, { level: e.target.value })}
              placeholder="Level"
              className="h-8 w-28 border-border bg-surface-alt/60 text-sm"
            />
            <button
              type="button"
              aria-label="Remove skill"
              onClick={() => removeSkill(idx)}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-white/[0.015] px-3 py-3 text-xs text-text-muted">
      {children}
    </p>
  )
}
