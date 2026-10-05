# Batch 3 Population Report — CN / TR / MY / JP / KR

Date: 2026-10-05. Approved by Ahmed 2026-10-05 (~16:30 UTC). **NOT committed** — parent reviews first. Do NOT start Batch 4.

## Records added (on next seed run)

| Model | CN | TR | MY | JP | KR | Total |
|---|---|---|---|---|---|---|
| Countries | 1 | 1 | 1 | 1 | 1 | **5** |
| Regions | 4 | 5 | 3 | 5 | 5 | **22** |
| Sources | 15 | 9 | 7 | 9 | 6 | **46** |
| Fertilizer recommendations | 16 | 7 | 6 | 8 | 7 | **44** |
| Planting windows | 12 | 13 | 1 | 12 | 10 | **48** |
| WindowSource links | 12 | 13 | 1 | 12 | 10 | **48** |
| Growing items (identity-only, via base seed) | — | 1 (sunflower) | 1 (rubber) | 1 (daikon) | 1 (napa-cabbage) | **4** |

All imported records: `verificationStatus = "under_review"` (or `draft` fallback). Seed is idempotent (insert-if-missing); nothing verified or published on import.

## Key decisions

1. **Ranges → midpoints**, original range always preserved in `notes` (e.g. TR wheat 80–90 → 85).
2. **China:** winter wheat and summer maize seeded as SEPARATE recommendations via `growthStage` ("Winter wheat" / "Summer maize (after wheat)"); spring maize (Northeast) separate again. Early/late double-crop rice seeded **N-only** (`p2o5: null, k2o: null`) — P/K not found in any named source.
3. **Türkiye:** K₂O gaps seeded as `null` (barley, sunflower) — never interpolated. Güçdemir 2006 values carry the "soil-test table, first two classes; 2006 vintage" qualifier. Southeast cotton gets a SOW window only; harvest end unverified (refused).
4. **Malaysia:** Sabah oil palm 129-30-254 (P/K elemental→oxide conversion flagged as mine); Peninsular figures flagged historical (1970s Tarmizi EOR); industry-average 91-44-240 flagged as application data, not a recommendation. **Rubber = identity item only, NO recommendation record** (LGM/MRB NPK not found). Oil palm gets a year-round SOW window (1–12) with the "no fixed season" note.
5. **Japan:** Hokkaido wheat (きたほなみ) and onion seeded **N-only** (P/K soil-diagnosis based). Extra region `jp-chubu` added for the Aichi (Chubu) cabbage records — deliberately NOT in the original region list; added rather than misattributing Aichi data to Kanto.
6. **Korea:** onion seeded N-only; napa cabbage seeded from **product-schedule-derived** values (300-200-270) with the guide's nutrient-text discrepancy (N 20–26 / P 12–20 / K 20–30 kg/10a) preserved in notes; barley (69-74-38) derived from product rates with the arithmetic flagged; Gangwon phosphate reference seeded as a P-only record; barley N cross-check (80 N) seeded as a separate N-only record.
7. **New identity items** in `src/lib/growing.ts` (all `under_review`, `indexable: false`, no agronomics): `sunflower` (Helianthus annuus, crop), `rubber` (Natural Rubber, Hevea brasiliensis, crop), `daikon` (Raphanus sativus var. longipinnatus, vegetable), `napa-cabbage` (Brassica rapa subsp. pekinensis, vegetable). `palm-oil` reused from batch2. Tea NOT added (no data found).
8. **KR research file caveat:** `ws-batch3-kr.md` was truncated at write time — it ends mid-row at the Napa cabbage windows entry; §§4–5 (gaps / source URLs) never existed in the file. Korea gaps in the master report are reconstructed from the visible sections; KR source URLs are `null` in `kr.json` with full citations in title/notes.
9. **Seed files:** `prisma/seed-batch3.ts` created (copy of seed-batch2.ts; files cn/tr/my/jp/kr, data dir batch3, legacyCountryName CN→china, TR→turkiye, MY→malaysia, JP→japan, KR→south-korea, function `seedBatch3`, log prefix `batch3:`); wired into `prisma/seed.ts` after `seedBatch2`.

## Refused (18 entries — "No verified data available yet")

- **CN (3):** South China early/late rice P₂O₅/K₂O; Northeast (Jilin) rice sowing/harvest months; Yangtze-province-level rice NPK.
- **TR (4):** barley K₂O (Central Anatolia); sunflower K₂O (Thrace); cotton K₂O (Mediterranean); Southeast cotton harvest window end.
- **MY (4):** rubber NPK (LGM/MRB); rice granary month ranges + season-specific NPK; current MPOB blanket NPK; peat-soil oil palm (Sarawak) MPOB figures.
- **JP (4):** Hokkaido rice NPK; Hokkaido wheat P/K; Hokkaido onion P/K + calendar; Yamagata rice harvest months.
- **KR (3):** RDA soil.rda.go.kr per-crop table values (needs live browser); onion P₂O₅/K₂O; reconciled napa cabbage NPK.

## QA

- `npm run typecheck` — **PASS** (tsc --noEmit clean)
- `npm run lint` — **0 errors**, 1 pre-existing warning (`src/components/plant-doctor/DiagnosisForm.tsx` `<img>` → `@next/next/no-img-element`; unrelated to this batch)
- JSON validation: all 5 files parse; every recommendation/window `sourceKey` resolves to a source in its file; all records `under_review`
- Runtime check via tsx: all 13 batch3 `itemSlug`s resolve against `GROWING_ITEMS` (38 items after the 4 additions)
- Full `next build` **not run** (not required by this task; typecheck covers the new code paths)

## Files touched (uncommitted)

- `/home/hatch/workspace/khaadguide/research-report-batch3.md` (master report)
- `prisma/data/batch3/{cn,tr,my,jp,kr}.json` (new)
- `src/lib/growing.ts` (+4 identity items)
- `prisma/seed-batch3.ts` (new)
- `prisma/seed.ts` (wire-in)
- `BATCH3_POPULATION_REPORT.md` (this file)

**STOP GATE: Batch 4 not started. Nothing committed — parent reviews first.**
