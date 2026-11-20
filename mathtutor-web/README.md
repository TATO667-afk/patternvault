# מורה מתמטיקה AI — Web Platform (Phase 5)

A hosted Next.js + Supabase rebuild of the Phase 1–4 artifact, so students use the
platform **without their own Claude account**. The AI runs server-side with the
operator's key; deterministic math verification is shared, server-side, and tested.

> The original artifact is preserved as a backup in this folder:
> `ARTIFACT_BACKUP_math-tutor.html` and `ARTIFACT_BACKUP_verify.js`.

## Stack
Next.js 14 (App Router) · TypeScript · React 18 · Tailwind · Supabase (Auth + Postgres + RLS) ·
Anthropic server SDK · math.js (deterministic CAS) · MathJax (SVG) · Vitest. RTL Hebrew throughout.

## Project layout
```
src/
  app/
    layout.tsx, globals.css, page.tsx
    (auth)/login, register, reset-password      # auth UI (client)
    auth/callback, auth/signout                  # auth routes
    (app)/layout.tsx                             # protected shell + nav
    (app)/onboarding dashboard library practice tutor exam progress settings import
    api/ai/{solve,recognize,evaluate,generate,hint,tutor,exam,exam-eval}/route.ts
  components/  Nav, MathText, Speak, PracticeClient, TutorClient, ExamClient
  lib/
    math/verify.ts (+ .test.ts)                  # deterministic engine (ported, tested)
    ai/ anthropic, schemas (zod), prompts, json, ratelimit, usage, guard
    supabase/ client, server, middleware
    curriculum.ts, progress.ts (+ .test.ts), session.ts, types.ts, api.ts
supabase/migrations/0001_init.sql                # schema + indexes + RLS + triggers
middleware.ts                                    # session refresh + route protection
```

## Environment variables (`.env.local`)
See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser-safe.
- `ANTHROPIC_API_KEY` — **server only**, never exposed to the client.
- `ANTHROPIC_MODEL` — e.g. `claude-sonnet-4-5`.
- `NEXT_PUBLIC_SITE_URL` — e.g. your Vercel URL (used for auth email redirects).
- `AI_DAILY_CALL_LIMIT` — per-user daily AI quota (default 120).
- `SUPABASE_SERVICE_ROLE_KEY` — optional, server-only, for maintenance scripts.

## Supabase setup
1. Create a project at supabase.com → **Settings → API** for the URL + anon key.
2. **SQL Editor** → paste and run `supabase/migrations/0001_init.sql`
   (or `supabase db push` with the Supabase CLI). This creates all tables,
   indexes, the auto-profile trigger, the progress-aggregation trigger, and
   enables Row Level Security with owner-only policies on every table.
3. **Authentication → Providers → Email**: enable email. For production, keep
   "Confirm email" on. Add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to the
   **Redirect URLs** allow-list.

## Local development
```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev                  # http://localhost:3000
npm run test                 # vitest: verifier + progress logic
npm run typecheck            # tsc --noEmit
npm run build                # production build
```

## Deploy to Vercel
1. Push this directory to a Git repo and import it in Vercel.
2. Add every variable from `.env.example` in **Project → Settings → Environment Variables**
   (do **not** prefix the Anthropic key with `NEXT_PUBLIC`).
3. Set `NEXT_PUBLIC_SITE_URL` to the deployed URL and add `/auth/callback` to the
   Supabase redirect allow-list.
4. Deploy. Build command `next build`, output is auto-detected.

## Security & privacy
- The Anthropic key lives only in server env; all model calls go through `/api/ai/*`.
- Every AI route: auth check → in-memory rate limit → durable daily quota → zod
  structured-output validation → deterministic verification where applicable.
- RLS ensures a student reads/writes only their own rows; the frontend is never
  the authority.
- Uploaded images are **not** stored — only recognized text is returned.
- `AI_DAILY_CALL_LIMIT` caps per-user cost; `ai_usage` records calls for monitoring.

## Verification integrity
The deterministic CAS (`lib/math/verify.ts`) is the only source of "verified".
Routes return a separate `verify`/`verdict` computed server-side; LLM output is
never presented as mathematically verified. Where the CAS cannot check an answer,
the UI shows "לא אומת אוטומטית".

## Known limitations / not yet verified
See the delivery report. In short: auth, database, and live AI require your
Supabase + Anthropic credentials and have **not** been run end-to-end here. The
build, type-checking, the verifier, and the progress logic are tested.
