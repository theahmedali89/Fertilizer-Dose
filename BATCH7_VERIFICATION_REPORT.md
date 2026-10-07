# Verification Report — Batch 7 Population (Items 1 & 2)

**Date:** 2026-10-07 · **Approver:** Ahmed ("1 or 2 ko chala do")
**Scope:** held-record resolutions + batch-7 crop data, all imported as `under_review` (NOT verified on import).

## Item 1 — Held-record resolutions (3 new records)

| Record | NPK (kg/ha) | Source | Checks |
|---|---|---|---|
| Sunflower PK S-PK-2 | 150-100-62 | Tahir & Shehzadi 2017, PJAR 30(2):122-128, DOI 10.17582/journal.pjar/2017/30.2.122.128 | Oxide forms confirmed (DAP/urea/SOP in methods); region-scoped to irrigated central Punjab (Faisalabad); no conflict with S-PK-1 (Pothwar 80-60-0) |
| Lentil PK | 52.3-57-0 | Shah et al. 2025, Discover Agriculture 3:201, DOI 10.1007/s44279-025-00333-1 (citing Govt. of Punjab) | Bag math: 57/2.471 = 23.06 kg/acre = 1 bag DAP; N = 30 + 124×0.18 = 52.3; press-advisory label preserved |
| Sugar beet PK SB-PK-2 | 150-100-62.5 | Ahmad et al. 2012, IJAB 14:605-608 (Lodhra Farm, Leiah) | P₂O₅/K₂O explicit in methods; labeled TRIAL applied rate, not extension recommendation |

**S-PK-1 correction:** stale "CONFLICT" note on the batch-5 record replaced — both doses are genuine for different agro-ecologies (Pothwar/arid vs irrigated central Punjab). Applied to both the recommendation's `applicationMethod` and the PMAS-UAAR source's `notes`.

**Deliberately NOT populated:** SB-PK-3 (elemental-P vs P₂O₅ ambiguity + Mardan/KPK miscoding), J-IN-3 (seed-production jute — never a fibre dose), barley/chickpea PK (no official data after 3 research passes).

## Item 2 — Batch 7 crops (17 records)

| Crop | Records | NPK examples | Source | isPrimary |
|---|---|---|---|---|
| Triticale × IN | 2 | 40-40-0 (rainfed), 150-60-40 (irrigated) | TNAU AGRO301 (teaching material) | no |
| Triticale × PK | 1 | 158.1-113.7-61.8 | Sher et al. 2022, MDPI (trial rate; oxide convention assumed) | no |
| Rubber × IN | 9 | 10-10-4 … 60-40-24 (kg/ha/**yr**) | Rubber Board schedule via KAU | yes (official) |
| Oil palm × IN | 5 | 57.2-28.6-57.2 … 171.6-85.8-171.6 (kg/ha/**yr**) | NIPHM GoI (3) / TNAU (2) | yes NIPHM only |

**Deliberately NOT populated:** R-IN-1 (rye — low-confidence media source, K>N anomaly, treated as gap); TNAU oil-palm third-year K=2700 row (page typo, excluded); no PK rubber/oil-palm records (no cultivation — Indian doses never borrowed).

## Verification (26 checks, all pass)

1. Counts: 20 recommendations (3 held + 17 batch-7), 2 windows, 8 sources.
2. Every record/window imports as `under_review`.
3. All `sourceKey` references resolve; all item slugs exist in `src/lib/growing.ts`.
4. Excluded items absent: no rye, no SB-PK-3, no J-IN-3, no PK rubber/oil-palm, no PK barley/chickpea.
5. `isPrimary` on official schedules only (9 rubber + 3 NIPHM = 12); trials/advisories/teaching stay non-primary.
6. Conversions re-verified: 64:46:25 kg/acre × 2.471 = 158.1/113.7/61.8 ✓; 400 g × 143 palms / 1000 = 57.2 ✓; rubber grade math exact (10-10-4-1.5 @ 100 kg) ✓; lentil 57/2.471 = 23.06 ✓, N 52.3 ✓.
7. NPK fidelity: 17/17 batch-7 records match `research-batch7/batch7-data.json` in order (R-IN-1 excluded).
8. Sanity ranges: all N/P/K within 0–300 kg/ha.
9. RB-IN-7 vs RB-IN-9 kept distinct (different stages, same 30-30-30) — not collapsed.
10. Region slugs: `pk-punjab` (exists), `in-tn` (exists), rubber national → null (batch-6 coffee convention).
11. Perennial semantics: doses labeled kg/ha/YEAR in `variety` + `applicationTiming`; no windows for rubber/oil-palm (batch-6 coffee precedent).

## QA

- `npx tsc --noEmit`: clean
- `npm run lint`: 0 errors (5 pre-existing warnings, untouched files)
- `npm run build`: clean
- Seed dry-run: not run against live DB (no sandbox DB access); script follows the idempotent batch-6 pattern exactly and applies on next Vercel deploy via `prisma migrate deploy` + seed.
