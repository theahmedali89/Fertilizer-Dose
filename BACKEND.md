# Backend — Fertilizer Dose

Full-stack backend: PostgreSQL (Prisma 7), Auth.js v5 credentials auth with
roles, admin CMS, cloud garden sync, and Gemini-powered Plant Doctor.

## What was built

| Area | Details |
|---|---|
| Database | `prisma/schema.prisma` — 21 tables: Auth.js models (User, Account, Session, VerificationToken), CMS (Fertilizer, GrowingItem, GrowthStage, Region, PlantingWindow, Source + 3 join tables, Post, Faq, Setting), Garden (GardenPlot, Planting, SavedCalculation, GardenReminder), Diagnosis |
| Migrations | `prisma/migrations/0_init/migration.sql` (generated, 21 tables) |
| Seed | `prisma/seed.ts` — idempotent upserts from the static datasets (fertilizers, growing items + stages, regions, windows, posts, FAQs) |
| Auth | Auth.js v5 credentials provider (bcryptjs, cost 12), JWT sessions, roles USER/EDITOR/ADMIN. First-ever signup becomes ADMIN. Middleware protects `/admin/*` (staff) and `/account/*` (signed in). Edge-safe `auth.config.ts` + full `auth.ts` |
| Pages | `/login`, `/signup`, `/account`; header auth buttons (login / account / admin / logout) |
| Admin CMS | `/admin` — dashboard with counts + full CRUD for fertilizers, growing items (+ stages), planting windows, regions, sources, blog posts, FAQs, user roles. All `noindex`, `force-dynamic`, zod-validated server actions |
| Public site | All public pages read via `src/server/data.ts`: DB when `DATABASE_URL` is set, static fallback otherwise (builds never need a DB) |
| Garden sync | `PUT/GET /api/garden/state` (auth-required, zod-validated full-state sync); `GardenSync` component merges cloud + browser copies (newer wins per record) and debounced-pushes changes |
| Plant Doctor | `POST /api/plant-doctor/diagnose` — magic-byte upload validation (JPG/PNG/WebP ≤ 5 MB), per-IP/per-user rate limiting (10/20 per hour), Gemini 2.0 Flash via REST (strict JSON), diagnoses stored when DB is set, honest 501 without `GEMINI_API_KEY` |
| Security | Security headers (HSTS, nosniff, DENY framing, referrer + permissions policies), bcrypt hashing, zod everywhere, no secrets in client bundles |

## Setup

```bash
# 1. Database — get a free Postgres (Neon, Supabase, or Vercel Postgres)
# 2. Environment
cp .env.example .env
# fill in: DATABASE_URL, AUTH_SECRET (npx auth secret), GEMINI_API_KEY

# 3. Migrate + seed
npx prisma migrate deploy
npx prisma db seed

# 4. Run
npm run dev
```

Open `/signup` — the first account becomes ADMIN. Manage content at `/admin`.

## Deploying on Vercel

1. Import the GitHub repo (`theahmedali89/Fertilizer-Dose`)
2. Add environment variables: `DATABASE_URL`, `AUTH_SECRET`, `GEMINI_API_KEY`
3. Deploy — no build config changes needed
   (since 2026-10-09, `vercel-build` is `prisma generate && next build` only:
   migrate/seed no longer run during builds, after a build failed on P1001
   when the DB was unreachable from the build environment)
4. After first deploy, run migrations once against the production DB:
   `DATABASE_URL="<prod-url>" npx prisma migrate deploy && DATABASE_URL="<prod-url>" npx prisma db seed`

Without `DATABASE_URL`, the deployed site works exactly like the frontend-only
build (static data + browser-local garden).

## Notes & limits

- Rate limiting is in-memory (single instance). For multi-instance production,
  swap `src/server/rate-limit.ts` for a shared store (e.g. Upstash Redis).
- No email provider yet: signup is email+password only (no verification/reset
  emails). Add Auth.js email provider + SMTP when needed.
- Prisma 7 requires the `prisma.config.ts` datasource format and the
  `@prisma/adapter-pg` driver adapter (both wired).
