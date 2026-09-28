# LEIF — Parent & Child Academic Support (MVP)

LEIF helps parents understand their child's academic progress, spot areas that need attention, and get practical ways to help at home. This is the TS Academy capstone MVP, built from the Figma Make prototype and the *LEIF Global MVP PRD V1.0* (`src/imports/`).

## Run it

```bash
npm install
npm run dev        # http://localhost:8443 (or set PORT)
npm run build      # production build in dist/
```

Requires Node 20+.

## Demo accounts

Every sign-in page has a **"Use demo account"** button. The same values live in `src/lib/seed.ts`.

| Role    | Sign in with                                                   |
|---------|----------------------------------------------------------------|
| Parent  | `fatima@leif.demo` / `leif1234` (Fatima, Amara's mum)          |
| Teacher | School *Federal Government College, Lagos*, ID `TCH-0042` / `leif1234` |
| Learner | Code `STU-001`, PIN `1234` (Amara)                             |

To restore the demo data in the cloud, re-run `supabase/seed.sql`. In browser-only mode, use **Settings → Reset demo data**.

### Demo tip: see the whole loop live
Sign in as the teacher on one device (or a private/incognito window) and as the parent on another. When the teacher publishes scores, marks attendance or posts an announcement, the parent's dashboard and notifications update within a second or two.

## How it maps to the PRD

| PRD requirement | Where |
|---|---|
| FR-01 Account / profile | `SignUp`, `SignIn`, `Profile` — Supabase Auth accounts; consent time recorded at sign-up |
| FR-02 Child profile | Sign-up step 2, `AddChild`, child switcher in the header / sidebar |
| FR-03 Academic dashboard | `Dashboard` — average, attendance, strengths, concerns, teacher note |
| FR-04 Academic Journey | `Journey` — a snapshot is recorded each time results change |
| FR-05 Strengths & concerns | `lib/academics.ts` (`subjectStatus`, `statusFor`) — rule-based, no diagnosis |
| FR-06 "How Can I Help?" | `Support` + `lib/guidance.ts` — guidance for every subject |
| FR-07 Learner activity | `LearnerSignIn`, `LearnerHome` — next step, tick off tasks |
| FR-08 Data relationship | Everything is derived from each child's `students` row; `score_uploads` keeps who published what, and when |
| FR-09 Privacy | Profile → Privacy controls: visibility, co-guardians, sharing with the teacher, data export; teachers only see their own school's classes |
| FR-10 Responsive UX | Bottom nav on mobile, sidebar on desktop, light & dark themes |
| Monitor improvement (core loop) | "I'll try this" records a baseline score; the dashboard shows the change once new results arrive |

## Database (Supabase)

LEIF runs on **Supabase** (Postgres, Auth and Realtime) when these two variables are set, locally in `.env.local` and in Vercel → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Without them the app falls back to **browser-only mode** (data in `localStorage`), which is handy inside Figma Make or for offline demos.

**Setting up a new Supabase project:**
1. SQL Editor: run [`supabase/schema.sql`](supabase/schema.sql) (tables, Row Level Security, functions, realtime).
2. SQL Editor: run [`supabase/seed.sql`](supabase/seed.sql) (demo accounts and learners). Regenerate it with `npx tsx scripts/generate-seed-sql.ts > supabase/seed.sql`.
3. Authentication: turn off "Confirm email" for demos; add your local and Vercel URLs under URL Configuration.

**Tables:** `profiles` (parents and teachers), `students`, `learner_pins`, `score_uploads` (audit history), `support_actions`, `announcements`, `notifications`, `events` (analytics). The database itself enforces privacy: parents see only their own children, co-guardians see a child only when allowed, teachers see only their own classes at their own school, and teachers never see learner PINs.

**Success metrics:** run the queries in [`supabase/metrics.sql`](supabase/metrics.sql) to get the PRD §16 numbers (onboarding, concern → guidance → action funnel, guidance usefulness).

## Architecture

- **React 19 + TypeScript + Vite + Tailwind CSS v4**, React Router for URLs.
- `src/lib/store.tsx` chooses the backend. `store-remote.tsx` (Supabase) and `store-local.tsx` (browser) implement the same actions (`saveScores`, `startAction`, `signInParent`, …), so the screens don't depend on where the data lives.
- Learners sign in with their code and PIN through checked database functions; they don't have accounts.
- Charts and the teacher and learner areas are lazy-loaded to keep the first download small on mobile data.

## Prototype limitations (be upfront in the demo)

- Anyone can register as a teacher for any school name. Real verification against a school's staff list is out of MVP scope.
- Supabase's built-in email service only sends a few emails per hour; use a custom SMTP provider before a real launch.
- Guidance is a curated rule-based library, not AI (PRD §14: constrained and non-diagnostic).
- Legal pages are plain-language drafts, not reviewed legal text.
