# Batch 2 Population Report — 2026-10-05

**Status:** Code + data complete, typecheck clean, lint 0 errors. **NOT committed** (parent review). **NOT pushed.**
**Scope:** United States, Brazil, Indonesia, Australia ONLY. No Batch 1 changes. No Batch 3/4 work.

## Research

Master report: `/home/hatch/workspace/khaadguide/research-report-batch2.md`
Detail files: `ws-batch2-us.md` (280 lines), `ws-batch2-br.md`, `ws-batch2-id.md` (147 lines), `ws-batch2-au.md` (111 lines)

## Population

All records `under_review` (never verified/published on import). All writes idempotent.

| Model | Added |
|---|---|
| Country | 4 — **US** (acre), **BR** (hectare), **ID** (hectare), **AU** (hectare) |
| Region | 17 — US: corn-belt, great-plains, southern-plains, southeast, pnw; BR: cerrado, south, southeast; ID: java, sumatra, kalimantan, sulawesi; AU: wa, nsw, vic, qld, sa |
| GrowingItem | 4 — coffee, palm-oil, canola, barley (identity only, under_review, non-indexable) |
| Source | 31 (deduplicated) |
| FertilizerRecommendation | 42 |
| PlantingWindow | 35 (+ WindowSource links) |

Data files: `prisma/data/batch2/{us,br,id,au}.json` · Seed logic: `prisma/seed-batch2.ts` (wired into `prisma/seed.ts` after seedBatch1).

### Notable data decisions
- **US:** lbs/acre × 1.1209 → kg/ha. MRTN N rates are price-dependent snapshots (noted). Soybean N=0 (fixation). State rates never presented as national.
- **Brazil:** safrinha corn kept strictly separate from first-crop corn (variety field). Sugarcane plant cane vs ratoon separate (growthStage). Cerrado soybean P/K NOT seeded (PR table not generalized).
- **Indonesia:** all national-level (regionId null for recommendations); wet/dry/rainfed rice separate. Palm oil @143 palms/ha assumption noted.
- **Australia:** budget-rule formulas in notes, never converted to invented fixed numbers. All K stays null (soil-test based). Southern hemisphere seasons correct.

### Deliberately refused
US: IN/AL/MS/CA/Dakotas NPK, IL corn N table, PNW windows. Brazil: Cerrado soybean P/K, SP coffee, safrinha P/K table, NE NPK, coffee planting window. Indonesia: all region-specific NPK, provincial calendars. Australia: all K recs, cotton/sugarcane P/K, irrigated wheat, sugarcane planting window.

## QA
- `npm run typecheck` ✅ clean
- `npm run lint` ✅ 0 errors (1 pre-existing `<img>` warning, untouched)
- Data integrity: 0 duplicate keys, all itemSlug/sourceKey/regionSlug resolve, valid months/activity types
- Seed **not executed** (no DB connection) — runs on next Vercel deploy via `prisma db seed`
