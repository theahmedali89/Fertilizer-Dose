# Agricultural Data Model — Phase A

**Date:** 2026-10-05
**Scope:** Database architecture for the global country-wise agricultural database (master prompt Phase A). Extends the existing Prisma schema; no models duplicated, no production data destroyed.

## Design principles

1. **Country ≠ Language.** Agricultural facts are stored once per country/region. UI language only changes presentation (via `GrowingItemTranslation` + the existing `next-intl` dictionaries). Switching Pakistan/English → Pakistan/Arabic never changes the underlying recommendation.
2. **No fake data, ever.** Every agronomic fact carries a source and a verification status. Missing data is `NULL` / `DATA_NOT_AVAILABLE`, never invented.
3. **Applicability is explicit.** A fertilizer recommendation always names its country (and region where relevant). Nothing is a "global" recommendation.
4. **Additive migrations only.** Production has live users, gardens, and blog data. No `DROP TABLE`, no `DROP COLUMN`, no `--force-reset`.

---

## New models

### `Country`
Top-level agricultural authority boundary.

| Field | Type | Notes |
|---|---|---|
| `code` | String @unique | `PK`, `IN`, `BD`… |
| `name` | String | `Pakistan` |
| `slug` | String @unique | `pakistan` (URL-safe) |
| `defaultUnit` | String @default("acre") | Land unit default for the country |
| `status` | String @default("active") | `active` \| `inactive` |

Relations: `regions`, `seasons`, `recommendations`.
**Why:** previously `Region.country` was a free-text string (`"pakistan"`/`"india"`) with no referential integrity and no place to store country-level metadata.

### `Season`
Named agro-climatic seasons (Rabi, Kharif, Spring…), scoped to a country or a region.

| Field | Notes |
|---|---|
| `countryId` | FK → Country (required) |
| `regionId` | FK → Region, nullable (`null` = country-wide) |
| `name` | e.g. `Rabi`, `Kharif` — only where geographically appropriate |
| `startMonth` / `endMonth` | 1–12; cross-year ranges (Nov→Feb) supported by query logic |
| `sourceId` | FK → Source, nullable |

Index: `(countryId, regionId)`.
**Why:** seasons differ by country/region; they were previously free-text on `GrowingItem` with no structure.

### `GrowingItemTranslation`
Per-locale **presentation** of a growing item. Facts stay on `GrowingItem` (shared); only names/descriptions are translated.

| Field | Notes |
|---|---|
| `growingItemId` | FK → GrowingItem, cascade delete |
| `locale` | `hi`, `ar`, `es`… (matches `next-intl` locale codes) |
| `name` / `localName` | Translated + country-specific local name |
| `description` / `growingNotes` | Text, nullable |
| `status` | `draft` \| `machine_translated` \| `review_required` \| `reviewed` \| `published` (default `draft`) |

Unique: `(growingItemId, locale)`. Index: `(locale)`.
**Why:** prevents 18 duplicated agronomic records; translations can never contradict the shared fact.

### `FertilizerRecommendation`
The highest-risk data in the system. One row = one verified recommendation with explicit applicability.

| Field | Notes |
|---|---|
| `growingItemId` | FK → GrowingItem, cascade |
| `countryId` | FK → Country (required) |
| `regionId` | FK → Region, nullable (`null` = country-wide) |
| `variety`, `soilContext`, `irrigationContext`, `growthStage` | Applicability context |
| `n` | kg elemental **N** / ha |
| `p2o5` / `k2o` | kg **P₂O₅** / **K₂O** / ha (oxide basis) |
| `nutrientBasis` | Default `"P2O5_K2O"` — explicit so elemental P/K are never confused with oxides |
| `micronutrients`, `applicationTiming`, `applicationMethod` | Text, nullable |
| `sourceId` | FK → Source, **required**, `onDelete: Restrict` (a recommendation must never lose its source) |
| `verificationStatus` | Default `draft` — researched data starts here, never auto-verified |
| `lastReviewed` | Nullable timestamp |

Indexes: `(countryId, regionId)`, `(growingItemId, countryId)`.
**Why:** the old flat `npkN/npkP/npkK` columns on `GrowingItem` could not express region, variety, growth stage, or source. They are kept (legacy) during transition; new recommendations go here.

---

## Changed models

### `Region`
- Added `countryId String?` FK → `Country` (nullable for safe migration; `onDelete: SetNull`).
- Kept the legacy `country` string column during transition (backfilled in seed; removed in a later phase once all code uses the relation).
- Index on `countryId`.

### `GrowingItem`
- `category` comment extended: `crop | vegetable | fruit | herb | flower | garden_plant | indoor_plant | outdoor_plant | plant (legacy)`. Existing `crop`/`plant`/`vegetable` values keep working (plain string column, no constraint change).
- New relations: `translations`, `recommendations`.
- `verificationStatus` default changed `in_review` → `under_review` (see enum migration).

### `PlantingWindow`
- Added `activityType String @default("SOW")` — `SOW` \| `TRANSPLANT` \| `PLANT` \| `HARVEST` \| `LAND_PREPARATION`. Existing rows default to `SOW` (their original meaning).
- Added `seasonId String?` FK → `Season` (nullable, `onDelete: SetNull`).
- New index `(regionId, activityType)`; kept `(regionId, startMonth)`.

### `Source`
- Added `sourceType String?` — `government` \| `university` \| `extension` \| `research` \| `international` \| `peer_reviewed` \| `other`.
- Added `verificationStatus VerificationStatus @default(under_review)`.
- New relations: `seasons`, `recommendations`.

### `VerificationStatus` enum
**Before:** `verified`, `in_review`.
**After:** `draft`, `under_review`, `verified`, `published`, `archived`.

---

## Enum migration — why two migrations

Prisma's default enum migration (`CREATE TYPE …_new` + `USING` cast + `DROP TYPE …_old`) **fails on production data**: existing rows contain `'in_review'`, which is absent from the new enum, so the cast throws.

Postgres also cannot `DROP` an enum value, and cannot *use* a newly added value in the same transaction that added it.

Safe approach (applied):

1. **`20261005140600_global_agri_phase_a_enum`** — `ALTER TYPE … ADD VALUE` ×4 only. No data touched.
2. **`20261005140700_global_agri_phase_a`** — data remap + all DDL:
   ```sql
   UPDATE "GrowingItem" SET "verificationStatus" = 'under_review'
     WHERE "verificationStatus" = 'in_review';
   UPDATE "PlantingWindow" SET "verificationStatus" = 'under_review'
     WHERE "verificationStatus" = 'in_review';
   ```
   The legacy `'in_review'` value remains inside the Postgres enum type (harmless, unused); application code uses only the five new values.

Both migrations contain **zero** `DROP TABLE` / `DROP COLUMN`.

---

## Seed changes (`prisma/seed.ts`)

- Seeds the 2 currently configured countries (idempotent `upsert` by `code`):
  - `PK` — Pakistan — `pakistan` — default unit `acre`
  - `IN` — India — `india` — default unit `acre`
- Backfills `Region.countryId` for existing regions by mapping the legacy string (`pakistan`→`PK`, `india`→`IN`). Skips rows that already have a `countryId` (admin edits survive).
- New countries must be added via Admin → Countries, never invented in seed.

---

## TypeScript consistency

The enum rename touched all layers so `tsc` stays green:

| File | Change |
|---|---|
| `src/lib/growing.ts` | `VerificationStatus` type → 5-value union; static values `in_review` → `under_review` |
| `src/lib/planting.ts` | Same type + value update |
| `src/server/data.ts` | DB passthrough type → 5-value union |
| `src/server/actions/admin.ts` | zod `verificationStatus` enums → all 5 values (growing + window schemas) |
| `admin/growing/GrowingForm.tsx`, `admin/windows/WindowForm.tsx` | Status dropdowns now offer Draft / Under review / Verified / Published / Archived |
| `admin/*/new/page.tsx` | New-record default → `under_review` |
| `src/components/growing/GrowingIndex.tsx` | Status filter type updated |

`npm run typecheck` passes. `npx prisma validate` passes.

---

## What Phase A does NOT do (later phases)

- Admin UI for Countries, Seasons, Translations, FertilizerRecommendations, bulk import, coverage dashboard (Phase A UI work).
- Country selector, "What to Grow This Month", global search (Phase B).
- Backfilling real per-region fertilizer recommendations (Phase E, one country at a time, sources required).
- Removing the legacy `Region.country` string column and `GrowingItem.npkN/P/K` flat fields (after code migrates to the new relations).
- Lifting `noindex` on non-English locales (needs reviewed translations, including item translations).
