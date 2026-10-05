# Batch 4 Population Report — Spain, France, Germany, Italy, Poland, Russia

**Status: POPULATED. NOT pushed. Awaiting Ahmed's approval for push (stop gate active).**
Date: 2026-10-05. Ahmed approved the Batch 4 population ("start" — final batch).

## Records added (all `verificationStatus: under_review`, never verified/published on import)

| Country | Sources | Regions | Recommendations | Windows | Refused |
|---|---|---|---|---|---|
| ES — Spain | 10 | 4 | 13 | 44 | 6 |
| FR — France | 15 | 4 | 8 | 18 | 4 |
| DE — Germany | 12 | 3 | 6 | 16 | 5 |
| IT — Italy | 10 | 2 | 6 | 10 | 8 |
| PL — Poland | 9 | 3 | 10 | 12 | 5 |
| RU — Russia | 11 | 5 | 8 | 10 | 8 |
| **Totals** | **67** | **21** | **51** | **110** | **36** |

New identity-only growing items added to `src/lib/growing.ts` (all `under_review`, `indexable: false`, no invented agronomics): `durum-wheat` (Triticum durum, crop), `sugar-beet` (Beta vulgaris, crop), `rye` (Secale cereale, crop), `triticale` (× Triticosecale, crop), `olive` (Olea europaea, plant/fruit), `grape` (Vitis vinifera, plant/fruit), `citrus` (Citrus sinensis, plant/fruit). Soft wheat reuses the existing `wheat` slug; durum wheat is a separate slug.

**Deviation from the task brief (needs your awareness, Ahmed):**
1. The brief asked for a new `rapeseed` item, but `canola` ("Canola (Rapeseed)", Brassica napus) already exists in `growing.ts` from an earlier batch. I reused `canola` for all FR/DE/PL rapeseed records instead of creating a duplicate item. No new `rapeseed` slug was added.
2. The brief's RU slug list was krasnodar/volga/siberia/central only, but the research has real named-source records for Rostov and Stavropol (North Caucasus/South): Stavropol GAU sunflower windows, Rostov maize trial, Stavropol VNIIMK maize trial, АгроЛаборатория-Ставрополь wheat example. Following the Batch 3 `jp-chubu` precedent, I added region `ru-south` (South — North Caucasus, Rostov/Stavropol) rather than misattributing or silently dropping the data.
3. The brief's DE list included `de-brandenburg`, but no Brandenburg-specific source exists (gap). Brandenburg region was NOT created, per the "only create regions with actual data" rule.

## Key data decisions

1. **Ranges → midpoints** for n/p2o5/k2o; the original range is always preserved in `notes`. Applies to ES (ITAP maxima recorded as the maxima, not midpoints — see 4), DE (LWK NI class-C range midpoints), PL, RU (trial dose midpoints), FR (bilan examples are exact products, not ranges).
2. **Spain ITAP Boletín 70** records are nitrate-vulnerable-zone legal N maxima (2006), explicitly flagged in every record's notes as "NOT agronomic optima — usable as N ceilings only". They were seeded because the data is sourced and real, but the records are `under_review` and the caveat travels with them. If you prefer these excluded entirely, say so and I will remove.
3. **France (structural):** no flat NPK exists. All 8 recommendations are labelled "BILAN PRÉVISIONNEL METHOD EXAMPLE" with n set (wheat 240, maize 242, rapeseed 245, sunflower 112, sugar beet 220 flat) and p2o5/k2o = null where soil-test-only. Notes say "France publishes no fixed regional doses; P/K soil-test based". The sugar-beet exports figure 230-80-390 is recorded in notes as an uptake reference, NOT a dose.
4. **Germany (structural):** N from federal DüV Anlage 4 at the reference yield (wheat 230 @80 dt/ha, barley 180 @70, rapeseed 200 @40, maize 200 @90, sugar beet 170 @650, potato 180 @450), flagged as a LEGAL UPPER LIMIT, not an agronomic optimum, with yield-adjustment rules in notes. P/K from LWK Niedersachsen Grunddüngung 2020 class-C midpoints (only LWK NI table found; attached to de-lower-saxony; no Bayern/NRW tables exist — see gaps).
5. **Russia (structural):** every recommendation note says "EXPERIMENTAL TRIAL DOSE — no official Минсельхоз norm found". KubSAU wheat (98/52/null), Ulyanovsk spring wheat (45/30/30, 90/60/60), Voronezh spring barley (30/30/30, 60/60/60), Rostov maize N90P90 (best trial), Stavropol maize N30P30K30 (no income gain — flagged), Stavropol amophos example N10P52.
6. **Italy:** durum-wheat and wheat (soft) are separate items; all 6 recommendations are ER DPI dose-standard on it-emilia-romagna. Puglia/Sicily skipped (no official regional sheets — practice sources refused).
7. **Poland:** IUNG-PIB doses are national and yield-based — all 10 recommendations use `regionSlug: null` with soilContext "IUNG-PIB national, yield-based"; rye population vs hybrid distinguished via `variety`; hybrid rye N = null (only the N cap is published).
8. **Perennial flowering windows** (olive, citrus): stored with activityType SOW (only SOW/HARVEST are displayable) and notes explicitly saying "MAPA calendario FLOWERING months (perennial crop — not a sowing window)". Citrus Andalucía harvest split by variety into 3 windows (Navelina Oct–Feb; Navel Oct–May / Navelate Jan–Jun; Clementina Sep–Jan).

## Gaps refused (all stay "No verified data available yet")

- **ES (6):** wheat CLM full NPK; wheat Andalucía full NPK (P/K); barley NPK outside Aragón; sunflower NPK CLM/Aragón/CyL; olive NPK any region; durum-vs-soft wheat NPK distinction.
- **FR (4):** fixed regional NPK for any crop × region; P₂O₅/K₂O numerics (soil-test only); wheat harvest for Occitanie; France-wide sugar-beet sowing from the weaker secondary source.
- **DE (5):** flat NPK "recipe" tables (don't exist — system is yield/soil-test dependent); Bayern LfL P/K table; NRW LWK P/K table; Brandenburg-specific source; precise grain-maize harvest month.
- **IT (8):** Lombardy standard NPK; Puglia durum official NPK (practice refused); Sicily official NPK; maize harvest month; industry-tomato harvest month; grape planting/harvest months; wheat harvest in official sources (secondary only, used with caveat); CREA/MIPAAF sheets.
- **PL (5):** region-specific NPK (national only); harvest months for wheat/rye/triticale; potato harvest (below-hierarchy source); region-specific sowing windows for rye/potato/sugar beet; spring wheat (out of scope).
- **RU (8):** N80P30K60 (login-blocked, unverified); sunflower BSAU uptake (not a dose); Agroliga commercial basal (below hierarchy); MSULAB sweet-corn dose (wrong crop/context); spring wheat Siberia NPK; VNIIMK sunflower NPK; Kuban/Black Earth maize NPK; windows for maize/spring barley/spring wheat-outside-Siberia/winter wheat Volga+Central/sunflower outside Stavropol.

## QA

- `npm run typecheck` — PASS (0 errors).
- `npm run lint` — 0 errors. (1 pre-existing warning in `src/components/plant-doctor/DiagnosisForm.tsx`, unrelated to batch4 — not touched.)
- JSON validation script — all 6 files parse; every recommendation/window `sourceKey` resolves to a source in its file; every `itemSlug` resolves to an item in `growing.ts`; every `regionSlug` resolves; all months 1–12; all records `under_review`; no dedupe collisions remain (two RU trial-dose pairs were disambiguated via `soilContext`).
- Seed NOT run against a live DB (no connection available here). `seed-batch4.ts` follows the exact batch3 idempotent pattern; nothing committed.

## Files produced

- `prisma/data/batch4/{es,fr,de,it,pl,ru}.json` — extracted data
- `prisma/seed-batch4.ts` — idempotent seeder
- `prisma/seed.ts` — wired `seedBatch4` after `seedBatch3`
- `src/lib/growing.ts` — 7 new identity-only items
- `/home/hatch/workspace/khaadguide/research-report-batch4.md` — master research report

**Still needed from Ahmed (existing open items, not new):** fresh GitHub PAT to push (now 4 unpushed commits including batch1/batch3/batch4 work — confirm which to push); Neon/Vercel Postgres `DATABASE_URL` + `AUTH_SECRET` + `GEMINI_API_KEY` env vars; professional translations for 17 locales; live-browser visual QA.
