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

**Settings → Reset demo data** restores the original sample data on the device.

### Demo tip: see the whole loop live
Open two browser tabs. Sign in as the teacher in one and the parent in the other. When the teacher publishes scores, marks attendance or posts an announcement, the parent's dashboard and notifications update immediately.

## How it maps to the PRD

| PRD requirement | Where |
|---|---|
| FR-01 Account / profile | `SignUp`, `SignIn`, `Profile` — accounts stored on-device, passwords SHA-256 hashed |
| FR-02 Child profile | Sign-up step 2, `AddChild`, child switcher in the header / sidebar |
| FR-03 Academic dashboard | `Dashboard` — average, attendance, strengths, concerns, teacher note |
| FR-04 Academic Journey | `Journey` — a snapshot is recorded each time results change |
| FR-05 Strengths & concerns | `lib/academics.ts` (`subjectStatus`, `statusFor`) — rule-based, no diagnosis |
| FR-06 "How Can I Help?" | `Support` + `lib/guidance.ts` — guidance for every subject |
| FR-07 Learner activity | `LearnerSignIn`, `LearnerHome` — next step, tick off tasks |
| FR-08 Data relationship | Everything is derived from the `StudentRecord` in `lib/store.tsx`; nothing is hard-coded per child |
| FR-09 Privacy | Profile → Privacy controls: visibility, co-guardians, sharing with the teacher, data export; teachers only see their own school's classes |
| FR-10 Responsive UX | Bottom nav on mobile, sidebar on desktop, light & dark themes |
| Monitor improvement (core loop) | "I'll try this" records a baseline score; the dashboard shows the change once new results arrive |

## Architecture

- **React 19 + TypeScript + Vite + Tailwind CSS v4**, React Router for URLs.
- **`src/lib/store.tsx`** is the single source of truth. For the MVP it persists to `localStorage` (PRD §10: controlled sample data, no school integrations). Its action functions (`saveScores`, `startAction`, `signInParent`, …) are the seam where a real backend (e.g. Supabase or Firebase) would plug in without changing the screens.
- Sessions are per browser tab, so a parent and a teacher can be signed in side by side.
- Charts and the teacher and learner areas are lazy-loaded to keep the first download small on mobile data.

## Prototype limitations (be upfront in the demo)

- Data lives in the browser only: no server, no syncing between devices.
- "Forgot password" resets the password on the device (no email service).
- Guidance is a curated rule-based library, not AI (PRD §14: constrained and non-diagnostic).
- Legal pages are plain-language drafts, not reviewed legal text.
