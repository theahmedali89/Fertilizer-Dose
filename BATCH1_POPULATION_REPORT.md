# Batch 1 Population Report — 2026-10-05

**Status:** Code + data complete, typecheck clean. **NOT committed** (parent review). **NOT pushed.**
**Scope:** Pakistan, India, Bangladesh ONLY. No Batch 2/3/4 data.

## Task 1 — NPK corrections (done FIRST)

| Crop | Old (wrong) | New (PAU) | Source |
|---|---|---|---|
| Wheat | 120-60-40 | **124-62-0** | PAU Package of Practices, Rabi 2025–26 (K soil-test-based) |
| Rice | 120-60-60 | **104-30-30** | PAU Package of Practices, Kharif 2026 (P/K on deficiency) |
| Maize | 120-60-40 | **124-60-30** | PAU Package of Practices, Kharif 2026 (K conditional) |

- Corrected in `src/lib/agronomy.ts` (feeds the dose calculator + future seeds).
- `prisma/seed-batch1.ts` applies a **guarded** `updateMany` to existing DB rows (matches only the old `npkSource` strings → idempotent, admin-safe). Sets `verificationStatus: under_review`.
- The old values were misattributed to "PAU package of practices" — they match no PAU document.

## Task 2 — Batch 1 population

All records `under_review` (never verified/published on import). All writes idempotent.

| Model | Added |
|---|---|
| Country | 1 — **BD (Bangladesh)** |
| Region | 5 — `bd-national` (windows only; all BD doses are national-level, so recommendations use `regionId: null`), `in-mp`, `in-mh`, `in-gj`, `in-ap` (sourced state data) |
| GrowingItem | 7 — cauliflower, cabbage, radish (vegetables); jute, mustard, lentil, chickpea (crops). Identity only, `under_review`, non-indexable |
| Source | 83 (deduplicated by organization+title) |
| FertilizerRecommendation | 64 |
| PlantingWindow | 155 (+ WindowSource links) |

Data files: `prisma/data/batch1/ws{1..4}.json` · Seed logic: `prisma/seed-batch1.ts` (called from `prisma/seed.ts` after the base seed).

### Notable data decisions
- **Cotton PK:** single record **150-50-50** (CCRI Multan Ann. Prog. Rep. 2023–24); NIAB 150-75-75 variant in notes only — not averaged, no second record.
- **Potato PK:** N+P only (`k2o: null`) — K not found in any named source.
- **Bangladesh rice:** 4 records, seasons never collapsed — Aus (50-11-15), Aman/BRRI (50-15-17), Aman/FRG-2018 (90-10-35, kept separate), Boro (75-30-30).
- **Sugarcane PK:** 3 per-fertility records (poor/avg/rich) from a secondary scribd mirror — flagged "treat with caution" in notes.
- **PAU per-acre → kg/ha:** ×2.471, 1 decimal (e.g. wheat 124-62-0 is already per-ha in PAU docs).
- **NURSERY activityType** (2 rice rows) remapped to SOW with note; schema allows only SOW/TRANSPLANT/PLANT/HARVEST/LAND_PREPARATION.
- **BD okra/cabbage** (FRG 2005, BJAR 2022 Atia) were dropped in a worker handoff — recovered manually from ws1 into ws4.json.

### Deliberately left empty (25 refused — "No verified data available yet")
- **PK vegetables:** NO NPK for any of the 13 (no official PK source; IN values NOT copied across the border).
- **PK maize** NPK (NARC 150-75-75 is trial-only); **PK potato K**; **BD lentil** official NPK; **BD wheat** FRG-2018 single figure.
- **Windows:** Balochistan maize/sugarcane, Balochistan highland wheat harvest, KPK maize/cotton harvest, Swat rice harvest, UP cotton harvest, UP potato calendar, Balochistan province-specific rice/cotton months (national window used with caveat note instead).

## QA
- `npm run typecheck` ✅ · `npx eslint` on touched files ✅ (0 errors)
- Data integrity: 0 duplicate natural keys, all 83 sourceKeys resolve, all months 1–12, all activityTypes valid, no all-null NPK records.
- Seed NOT run (no DB connection in this environment) — first production run will execute via the Vercel build (`prisma db seed`).

## Files changed (uncommitted)
- `src/lib/agronomy.ts` — 3 NPK corrections
- `src/lib/growing.ts` — 7 new items
- `prisma/seed.ts` — wires in `seedBatch1()`
- `prisma/seed-batch1.ts` — NEW (idempotent population logic)
- `prisma/data/batch1/ws{1..4}.json` — NEW (extracted data)
