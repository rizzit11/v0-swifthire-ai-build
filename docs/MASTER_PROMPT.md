# SwiftHire AI — Master Prompt & State of the Build

> Use this document as the single source of truth when starting a new chat with
> any AI assistant (v0, Cursor, Claude, ChatGPT). Paste the **"Master prompt"**
> section first, then whatever new feature you want built.

---

## 1. Master prompt (copy–paste this verbatim)

> You are my senior full-stack engineer on **SwiftHire AI**, an AI-native
> recruitment platform with two personas — **Candidate** and **HR**.
>
> **Stack:** Next.js 16 (App Router, Turbopack, React 19), TypeScript, Tailwind
> CSS v4 (tokens in `app/globals.css` via `@theme inline`), shadcn/ui, Framer
> Motion, Supabase (auth + Postgres + Storage + RLS), Vercel AI Gateway +
> Gemini Flash for resume parsing, Stripe (installed, checkout to be wired),
> `@supabase/ssr` for auth, pnpm.
>
> **Design language:** dark premium, Huly / Linear / Aceternity aesthetic.
> Primary `#7C3AED`, secondary cyan `#06B6D4`, accent green `#22C55E`,
> background `#070B14`. Glass surfaces (`.glass`, `.glass-strong`), subtle
> inner-highlight, primary glow only on hero + primary CTAs. Serif for
> headings (Geist), sans for body (Inter), mono for metrics (JetBrains Mono).
> Parallax on backdrops, `whileInView` reveals, `prefers-reduced-motion`
> respected. Integrity language is strictly **"Integrity Signals"** /
> **"Confidence Indicators"** — never "cheat-proof".
>
> **Architecture rules:**
> - Every Supabase table has RLS. Tenant isolation via `company_id`. Candidate
>   demographics are write-only from the candidate; unreadable by HR.
> - The resume parser pipeline is **async**: `POST /api/resumes/upload` returns
>   `202 Accepted + { jobId }`, then runs work in Next.js `after()`. Clients
>   poll `GET /api/resumes/jobs/[id]` until `completed` or `failed`.
> - Server components load data with the SSR Supabase client. Client components
>   use `createClient()` from `lib/supabase/client.ts`. Middleware uses
>   `lib/supabase/proxy.ts` to refresh cookies on every request.
> - **Never** pass functions (like Lucide icons) as props across the Server →
>   Client boundary — use string keys and resolve the icon on the client side.
> - New DB changes go into a new `scripts/NNN_*.sql` file (additive only,
>   never rewrite older migrations) and must be executed before the app code
>   that reads the new columns is shipped.
>
> **Spec decisions already made:**
> - Candidate / HR role split, role router at `/dashboard`.
> - Resume data-of-record is `resumes.parsed_data` (`jsonb`). ATS score stored
>   on `resumes.ats_score`. Parse status enum: `pending | processing |
>   completed | failed`.
> - Landing page is public; every `/candidate/*` and `/hr/*` route is
>   session-gated via middleware.
> - Password rules: min 8 chars, strength meter + visibility toggle on forms.
> - OAuth providers: Google + GitHub via `supabase.auth.signInWithOAuth`.
>   User must enable them in the Supabase dashboard → Authentication →
>   Providers and paste client id/secret. Redirect URL must include
>   `/auth/callback`.
>
> Follow these rules in every change. Use parallel tool calls. Read before
> editing. Don't rewrite working code. Add new migrations when the schema
> must change.

---

## 2. What has been built (by phase)

### 2.1 Phase 1 — Landing + Design System (complete)

- **Design tokens** (`app/globals.css`):
  - Surfaces (`--background #070B14`, `--surface`, `--surface-alt`).
  - Brand (`--primary #7C3AED`, `--primary-glow`, `--secondary #06B6D4`,
    `--accent #22C55E`).
  - Semantic (`--danger`, `--warning`), text (`--text-primary`, `--text-secondary`,
    `--text-muted`).
  - Radius (14px buttons, 20px cards).
  - Utilities: `.glass`, `.glass-strong`, `.ring-inset-highlight`, `.bg-grid`,
    `.bg-grid-fade`, `.hero-beam`, `.glow-primary`, `.text-gradient-brand`,
    `.text-gradient-primary`, `.caret-blink`, `.animate-shimmer`, `.animate-float`.
- **Typography** via `next/font`: Inter (`--font-inter`, sans), Geist
  (`--font-geist`, serif + display), JetBrains Mono (`--font-jetbrains-mono`).
- **Root layout** (`app/layout.tsx`) — SEO metadata, theme-color `#070B14`,
  `<html className="bg-background">`.
- **Marketing sections** (all in `components/marketing/`):
  - `navbar.tsx` — scroll-reactive glass, sign in / get started wired to
    `/auth/login` + `/auth/sign-up`.
  - `hero.tsx` — parallax grid + beam, `AutoTypingResume` panel with inline
    ATS chip + Integrity-signal chip (not floating anymore).
  - `auto-typing-resume.tsx` — John Doe persona, typed summary, section list.
  - `trusted-by.tsx` — compact shimmer logo strip.
  - `feature-bento.tsx` — 6 features from Section 6 of the spec, each with an
    inline live demo (builder preview + sections panel, parser fields with
    confidence, JD score ring, funnel, rubric, bias bars). The Resume Builder
    card is a two-pane layout so no vacuum inside the card.
  - `how-it-works.tsx` — 4 steps.
  - `candidate-flow.tsx`, `hr-flow.tsx`, `bias-explainability.tsx` — each
    uses the Section 6.5 fairness frame.
  - `pricing.tsx` — 3 tiers, CTAs routed to `/auth/sign-up?plan=...`.
  - `testimonials.tsx`, `footer.tsx`.
  - `parallax-layer.tsx` — reusable decorative parallax; `decorative` prop
    controls pointer-events + aria-hidden.

### 2.2 Phase 2 — Database + Auth + Infra (complete)

- **SQL migrations** (all executed):
  - `001_swifthire_schema.sql` — `profiles`, `companies`, `hr_profiles`,
    `candidate_demographics`, `jobs`, `resumes`, `resume_versions`,
    `applications`, `interview_sessions`, `interview_thumbnails`,
    `bias_reports`, `resume_parse_jobs`. All RLS-enabled.
  - `002_profile_trigger.sql` — `handle_new_user()` trigger on `auth.users`
    that seeds `public.profiles`.
  - `003_storage_buckets.sql` — private `resumes` bucket + per-user folder
    policies.
  - `004_resume_ux_columns.sql` — `title`, `is_primary`, `ats_score`,
    `storage_path`, `parse_status` on `resumes`. Unique primary index.
  - `005_parse_jobs_link.sql` — `resume_id`, `started_at` on `resume_parse_jobs`.
  - `006_profiles_alignment.sql` — `onboarded` column, relaxed `role` NOT
    NULL, re-applied trigger.
- **Supabase infra** (`lib/supabase/*`):
  - `client.ts`, `server.ts`, `proxy.ts`, all using `@supabase/ssr`.
  - `middleware.ts` refreshes cookies; redirects unauth'd traffic away from
    `/candidate/*`, `/hr/*`, `/dashboard`.
- **Auth pages** (`app/auth/*`):
  - `/auth/login`, `/auth/sign-up`, `/auth/sign-up-success`, `/auth/error`,
    `/auth/callback/route.ts` (calls `exchangeCodeForSession`).
  - Split-screen layout with brand panel + aurora mesh.
  - **OAuth buttons** (Google + GitHub) via `signInWithOAuth`, see
    `components/auth/oauth-buttons.tsx`.
  - **PasswordInput** with show/hide toggle (`components/auth/password-input.tsx`).
  - **SignUpForm** with candidate/HR role picker + live password strength meter.

### 2.3 Phase 3 — Dashboards + Resume Parser Pipeline (complete)

- **Role router** at `/dashboard/page.tsx` reads `profiles.role` and
  redirects to `/candidate` or `/hr`.
- **App shell** (`components/app/app-shell.tsx`) — glass sidebar, brand
  mark, account card with avatar + email + sign-out button. Sticky page
  header. Nav items passed as plain objects with string `icon` keys; the
  client `SidebarNav` resolves the icon. (Fixes the "functions cannot be
  passed to Client Components" error.)
- **Candidate workspace** (`/candidate/*`):
  - **Overview** — welcome card with real first name from `user_metadata`,
    stats (resumes, ATS, placeholder metrics), shortcut cards.
  - **Resumes** — drag-and-drop uploader, list of resumes with parsed data
    chips. Real upload → `202 + jobId` → polling → ATS score roundtrip.
  - **JD matching** — `JdMatchingStudio`: paste JD / pick from 3 presets,
    Analyze button, score ring, matched/missing chips, 3 explainable
    suggestions.
  - **Practice interviews** — `InterviewStudio`: 3 tracks
    (behavioral / system / leadership), sample prompt + waveform recorder
    mock, rubric feedback (4 dimensions + confidence indicator).
- **HR workspace** (`/hr/*`):
  - **Overview** — welcome card, stat cards wired to real `jobs` +
    `applications` counts, shortcut cards, Next-up tile.
  - **Roles** — `HrJobsStudio`: stat strip, roles list with status pills +
    applicant/shortlist metrics, selected role detail card with rubric
    score + AI shortlist signal panel.
  - **Applicants** — `HrApplicantsStudio`: searchable table, stage pills,
    selected-candidate panel with score ring + rubric breakdown +
    strengths/gaps chips.
  - **Fairness** — `HrFairnessStudio`: headline cards (overall score, 80%
    rule flags, blinded dimensions), Gender + Ethnicity subgroup tables
    with auto-flagging below 80% ratio, audit log feed.
- **Resume parser API** (`app/api/resumes/*`):
  - `POST /api/resumes/upload` — auth-checked, creates `resumes` +
    `resume_parse_jobs` rows, uploads to Storage, returns `202 + jobId`,
    schedules parse via `after()`.
  - `GET /api/resumes/jobs/[id]` — polled by client; returns `pending |
    processing | completed | failed` + `ats_score` when ready.
  - `lib/resume/parser.ts` — downloads the PDF from a signed URL, calls
    Gemini Flash via AI Gateway with a strict Zod schema (contact,
    experience, skills, education, ATS score, suggestions).

### 2.4 Problems solved along the way

1. **Server → Client icon props crash** — fixed `SidebarNav` to accept
   string `icon` keys instead of Lucide component functions.
2. **Schema ↔ code drift** — my first app code used `user_id` / `parsed_json`;
   real schema uses `candidate_id` / `parsed_data`. Added migration 004/005
   and conformed every read/write to the canonical columns and the
   `pending/processing/completed/failed` status enum.
3. **Profile trigger blocked sign-up** when `profiles.role` was NOT NULL —
   fixed in migration 006.
4. **Hero negative space + floating chips** — chips moved inline into the
   resume panel's header; section paddings tightened from `py-24/32` to
   `py-16/20`; the AI Resume Builder bento card re-designed as a two-pane
   demo so no empty middle.
5. **Dashboard dullness** — every inner route now renders realistic demo
   data with interactive elements (score rings, rubric bars, searchable
   table, subgroup bar charts).

---

## 3. What's next (suggested phase list)

1. **Wire Stripe checkout** — pricing page → `POST /api/billing/checkout`
   → webhook → update `profiles.subscription_tier`. Stripe is already
   connected.
2. **Real JD matching** — replace the client-side heuristic with a server
   action that calls Gemini Flash with the candidate's `parsed_data` and
   returns a trace of supporting resume passages per suggestion.
3. **Interview sessions** — persist `interview_sessions` and
   `interview_thumbnails`, record audio via MediaRecorder, send to the
   server for rubric scoring.
4. **HR role publishing** — form to post a `jobs` row, AI-drafted JD from
   a short prompt, public apply page.
5. **Applicant ingestion** — candidates click **Apply** on a job; create
   an `applications` row; trigger AI scoring job.
6. **Real fairness dashboard** — server function joins
   `candidate_demographics` and `applications` with RLS-bypass rights,
   returns only aggregated subgroup rates (never per-person).
7. **Stripe subscription gate** — middleware check on premium routes.

---

## 4. Environment variables

| Key | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (added by integration) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (added by integration) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; used for bypass in fairness/audit jobs |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway; required for resume parser |
| `STRIPE_SECRET_KEY` | Stripe secret; wire when you start billing work |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | **Local only**: `http://localhost:3000/auth/callback` so email-confirm links return to your machine |

---

## 5. How to enable Google + GitHub OAuth

Supabase's OAuth providers need to be switched on once:

1. Open your Supabase project → **Authentication → Providers**.
2. **Google** — follow the "Enable" button; create a new client in Google
   Cloud Console (OAuth 2.0 Client ID, web app), paste the client id and
   secret into Supabase.
3. **GitHub** — follow the "Enable" button; create a new OAuth app at
   `https://github.com/settings/developers`, paste client id + secret.
4. For **both**, set the **Authorized Redirect URI** (in the provider
   console, not in Supabase) to your Supabase callback, which looks like:

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

   Supabase shows the exact URL on the provider's settings panel.

5. Finally, in Supabase → **Authentication → URL Configuration**, add
   every app origin you'll use to the **Redirect URLs** list:

   - `https://<your-vercel-app>.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `https://<your-custom-domain>/auth/callback` (if any)

Without this, clicking the Google / GitHub buttons will 400 with
`unauthorized_client` or a Supabase "Invalid redirect URL" error.

---

## 6. Folder map (curated)

```
app/
  api/resumes/upload/route.ts          # 202 + after() parser
  api/resumes/jobs/[id]/route.ts       # polling status
  auth/
    callback/route.ts                  # exchangeCodeForSession
    login/page.tsx                     # uses AuthLayout
    sign-up/page.tsx
    sign-up-success/page.tsx
    error/page.tsx
  candidate/
    layout.tsx                         # AppShell + candidate nav
    page.tsx                           # overview
    resumes/page.tsx                   # upload + list
    jobs/page.tsx                      # JD matching
    interviews/page.tsx                # practice
  hr/
    layout.tsx                         # AppShell + hr nav
    page.tsx                           # overview
    jobs/page.tsx                      # roles
    applicants/page.tsx
    fairness/page.tsx
  dashboard/page.tsx                   # role router
  page.tsx                             # landing
  layout.tsx                           # fonts + metadata
  globals.css                          # tokens + utilities

components/
  auth/
    auth-layout.tsx                    # split-screen shell
    login-form.tsx
    sign-up-form.tsx
    oauth-buttons.tsx                  # Google + GitHub
    password-input.tsx                 # show/hide toggle
  app/
    app-shell.tsx                      # sidebar + header
    sidebar-nav.tsx                    # string-keyed icons
    sign-out-button.tsx
  candidate/
    resume-uploader.tsx
    resume-list.tsx
    jd-matching-studio.tsx
    interview-studio.tsx
  hr/
    jobs-studio.tsx
    applicants-studio.tsx
    fairness-studio.tsx
  marketing/*                          # all landing sections

lib/
  supabase/{client,server,proxy}.ts
  auth/redirect.ts
  resume/parser.ts                     # Gemini Flash + Zod

scripts/
  001_swifthire_schema.sql
  002_profile_trigger.sql
  003_storage_buckets.sql
  004_resume_ux_columns.sql
  005_parse_jobs_link.sql
  006_profiles_alignment.sql

middleware.ts                          # session refresh + route guard
README.md                              # local-run guide
docs/MASTER_PROMPT.md                  # this file
```

---

## 7. Acceptance checklist (what to verify after each deploy)

- [ ] `/` loads with Inter/Geist/JetBrains fonts; hero beam visible; no
      console errors.
- [ ] `/auth/sign-up` shows Google + GitHub buttons, the 2-column split
      layout on lg screens, role picker, password strength meter, and a
      working show/hide eye toggle.
- [ ] Creating an account lands you on `/auth/sign-up-success`; the
      confirmation email opens `/auth/callback?code=...` which redirects
      to `/dashboard`.
- [ ] `/dashboard` redirects to `/candidate` or `/hr` based on role.
- [ ] Candidate Overview shows the real first name; `/candidate/resumes`
      accepts a PDF, shows "Queued → Processing → Completed", and stores
      the ATS score.
- [ ] HR Overview shows real job/application counts (or zero). HR inner
      pages render the rich demos.
- [ ] `prefers-reduced-motion: reduce` disables parallax and reveal
      animations.
