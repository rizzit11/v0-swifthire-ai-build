# SwiftHire AI — Local Development Guide

This app is a Next.js 16 + Supabase + Stripe project. Because **every
product feature lives behind authentication** (resume upload, parser,
JD matching, HR dashboards), running locally is the fastest way to
exercise the full pipeline end-to-end.

Note: this is a Node.js project, so the dependency list lives in
`package.json` (the Node equivalent of Python's `requirements.txt`).
You never need to type each package by hand — one install command
pulls everything in.

---

## 1. Prerequisites

Install these once on your laptop:

| Tool | Version | How |
| --- | --- | --- |
| Node.js | **>= 20.x LTS** | https://nodejs.org (pick LTS) |
| pnpm | latest | `npm install -g pnpm` |
| Git | latest | https://git-scm.com/downloads |

Verify:

```bash
node -v    # v20.x or higher
pnpm -v    # 9.x or higher
```

---

## 2. Get the code

If you downloaded the ZIP from v0:

```bash
unzip swifthire-ai.zip
cd swifthire-ai
```

Or if you connected the v0 chat to a GitHub repo:

```bash
git clone <your-repo-url> swifthire-ai
cd swifthire-ai
```

---

## 3. Install dependencies

```bash
pnpm install
```

This reads `package.json` and installs every dependency (Next.js,
React, Supabase SSR, AI SDK, Framer Motion, Tailwind, shadcn/ui,
Stripe, etc.). Treat this as the equivalent of `pip install -r
requirements.txt`.

---

## 4. Configure environment variables

Create a file named `.env.local` in the project root with the
following keys. Copy the values from your Vercel project — open the
Vercel dashboard, pick the SwiftHire AI project, go to
**Settings → Environment Variables**, and copy each one.

```bash
# ---- Supabase (auth + database + storage) ----
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...           # used by server-side routes
POSTGRES_URL=...                         # direct postgres URL (optional, SQL scripts)

# ---- Vercel AI Gateway (resume parser uses Gemini Flash) ----
AI_GATEWAY_API_KEY=...

# ---- Stripe (billing; optional locally) ----
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...          # only needed if running stripe CLI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ---- Supabase auth redirect override (recommended locally) ----
# Ensures Supabase email-confirm links come back to localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

**Important — Supabase auth redirect URL:**
In your Supabase project dashboard, under
**Authentication → URL Configuration**, add
`http://localhost:3000/auth/callback` to the list of allowed redirect
URLs. Otherwise the email-confirm link will refuse to return to your
laptop.

---

## 5. (Already done for you) Database migrations

The SQL migrations in `scripts/` have already been run against your
Supabase instance from the v0 chat. If you ever need to reset or
re-apply them against a fresh Supabase project, execute them in
numeric order against the Postgres connection:

```
scripts/001_swifthire_schema.sql
scripts/002_profile_trigger.sql
scripts/003_storage_buckets.sql
scripts/004_resume_ux_columns.sql
scripts/005_parse_jobs_link.sql
scripts/006_profiles_alignment.sql
```

You can run them from the Supabase SQL editor, or via `psql`:

```bash
psql "$POSTGRES_URL" -f scripts/001_swifthire_schema.sql
# …repeat for each file in order
```

---

## 6. Run the dev server

```bash
pnpm dev
```

Open **http://localhost:3000**.

You should see the landing page. Click **Get started** or
**Sign in** in the top-right to go through the auth flow.

Expected flow:

1. `/auth/sign-up` → pick **Candidate** or **HR**, enter email + password.
2. Supabase sends a confirmation email. Open the link → it bounces
   through `/auth/callback` and drops you on `/dashboard`.
3. `/dashboard` routes you to `/candidate` or `/hr` based on your
   role.
4. As a candidate, upload a PDF at `/candidate/resumes` — the upload
   route returns 202 immediately, then polls `/api/resumes/jobs/:id`
   until Gemini Flash finishes parsing.

---

## 7. Optional — test without email confirmation

If you want to skip email-confirm for faster local iteration, open
your Supabase dashboard → **Authentication → Providers → Email** and
toggle **Confirm email** off. Re-enable it before shipping.

---

## 8. Common issues

**"Functions cannot be passed directly to Client Components"**
You are on an old build — pull the latest code. The fix landed in
`components/app/sidebar-nav.tsx` + the candidate/HR layouts (nav
items use string icon keys instead of component references).

**Supabase auth bounces me back to the landing page after confirming.**
Your redirect URL is not allow-listed. Go to Supabase → Authentication
→ URL Configuration and add `http://localhost:3000/auth/callback`.

**Resume upload returns 500.**
Check your server logs for an `AI_GATEWAY_API_KEY` or
`SUPABASE_SERVICE_ROLE_KEY` error. Both are required by the parser
route. They must be set in `.env.local` — public `NEXT_PUBLIC_*`
variables are not enough for server-side routes.

**Stripe webhook never fires locally.**
Install the Stripe CLI (`brew install stripe/stripe-cli/stripe`),
then in a separate terminal:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
The CLI prints a `whsec_` secret — paste it into
`STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## 9. Production build (optional sanity check)

```bash
pnpm build
pnpm start
```

This runs the same production bundle Vercel will deploy — useful for
catching issues that only appear with server-side rendering turned on.

---

## 10. Scripts quick reference

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start dev server on http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server (requires `pnpm build` first) |
| `pnpm lint` | Run ESLint across the project |

Happy shipping.
this is for production testing
