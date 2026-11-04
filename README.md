# Kaam Setu (काम सेतु)

**Har hath ko sahi kaam** — a voice-first job bridge for Bharat. Kaam Setu connects blue-collar workers (drivers, delivery, construction, electricians, domestic help, and more) with verified employers offering daily-wage and monthly-salary work.

Built as a full-stack web app: workers speak or type in Hindi / Hinglish / English to find jobs, listen to job details read aloud, apply in one tap, and call employers directly. Employers post jobs, review applicants, and accept or reject — all from a hiring desk dashboard.

## Features

- **Voice search** — Web Speech API, Hindi + English recognition
- **Text-to-speech job cards** — every job can be read aloud (hi-IN / en-IN)
- **Trilingual UI** — English / हिंदी / Hinglish with one-tap switching
- **Job discovery** — category chips, city filter, daily/monthly wage filter, urgent-hiring filter, full-text search across titles (EN + HI), company, city, description
- **One-tap apply** — worker applications with an optional message to the employer
- **Call employer** — direct tel: contact from every card
- **Saved jobs + matching** — skill/city/wage-based job recommendations for workers
- **Employer desk** — post jobs (live instantly), see applicant counts, review applicants, accept/reject, close/reopen listings
- **Verified employer badges** — seeded employers are pre-verified; platform owner can verify more
- **Live stats** — open jobs, workers, employers, cities covered

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend  | Hono + tRPC 11 (end-to-end types) |
| Database | MySQL via Drizzle ORM (schema in `db/schema.ts`) |
| Auth     | Kimi OAuth 2.0 (JWT sessions) |
| Voice    | Web Speech API (recognition + synthesis) |

## Project layout

```
api/            Hono server, tRPC routers, query layer
  routers/      jobsRouter, profileRouter, applicationsRouter
  queries/      Drizzle query functions
db/             schema.ts, relations.ts, seed.ts
contracts/      shared types/constants (frontend <-> backend)
src/
  pages/        Home, Jobs, PostJob, Dashboard, Profile, Login, NotFound
  components/   JobCard, JobBoard, SiteHeader, SiteFooter, VoiceSearchBar, JobDialogs, FlipButton
  hooks/        useSpeech (voice search + job speaker), useAuth
  lib/          lang.tsx (EN/HI/Hinglish dictionary), constants (categories, INR formatting)
```

## Data model

- `users` — platform auth users (Kimi OAuth)
- `profiles` — worker/employer profile: role, city, phone, skills, experience, preferred wage, company
- `jobs` — bilingual titles, category, city/area, salary range, wage type, benefits (JSON), urgent/verified flags, status
- `applications` — worker -> job applications with pending/accepted/rejected status (unique per worker+job)
- `saved_jobs` — worker bookmarks (unique per worker+job)

## Running locally

```bash
npm install
npm run db:push      # sync schema to MySQL (DATABASE_URL in .env)
npx tsx db/seed.ts   # seed 20 realistic demo jobs
npm run dev          # dev server at http://localhost:3000
npm run build && npm start   # production
```

> Kimi OAuth and the managed database are platform capabilities — a self-hosted copy needs its own auth provider and MySQL.

## Deployment

The app is delivered and hosted on the Kimi platform (preview + publish with a public URL). This repository mirrors the application source.

---

© 2026 Kaam Setu. Made for the hands that build India.
