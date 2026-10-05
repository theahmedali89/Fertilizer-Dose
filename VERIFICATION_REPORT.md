# Verification Report — Fertilizer Dose Agricultural Database
**Date:** 2026-10-05
**Scope:** 201 FertilizerRecommendations across 18 countries (4 batches)
**Method:** Import-accuracy cross-check against research reports + source linkage + sanity checks + conversion math spot-checks. 4 parallel verifiers, one per batch.

## Summary

| Batch | Countries | Verified | Kept under_review |
|---|---|---|---|
| 1 | PK, IN, BD | 59 | 5 |
| 2 | US, BR, ID, AU | 40 | 2 |
| 3 | CN, TR, MY, JP, KR | 44 | 0 |
| 4 | ES, FR, DE, IT, PL, RU | 51 | 0 |
| **Total** | **18** | **194** | **7** |

All 194 verified records had `verificationStatus` changed from `under_review` to `verified` in their JSON files. The 7 questionable records keep `under_review` with a `verificationNote` explaining the specific concern. Typecheck passes. **Not committed** (parent review).

## What was verified (and how)

### 1. Import accuracy
Every recommendation's N/P₂O₅/K₂O was traced back to its research report value. The `notes` field on each record documents the source and conversion (e.g. "PAU 2021 per-acre 60-25-25 x2.471"). All 194 verified records match their cited research values exactly.

### 2. Source linkage
All 201 `sourceKey` values resolve to real entries in their file's `sources` array (0 missing). Organizations and titles are sensible (PAU, Embrapa, GRDC, MARA, Arvalis, CREA, etc.).

**One minor gap (non-blocking):** Batch 1's IN-potato record references `pau-veg-2021`, which lives in ws1.json's sources array, not ws2.json's. The seed script merges sources across all batch1 files before creating recommendations, so the import resolves correctly. Recommend adding it to ws2.json's array later for file-level self-containment.

### 3. Sanity checks
- **NPK ranges:** All values within N 0–400, P₂O₅ 0–300, K₂O 0–300 kg/ha, except 2 legitimate outliers:
  - MY palm-oil K₂O=313 — verified correct (oil palm is very high-K; arithmetic re-checked: 1.91×136×1.205=313.01; historical 1970s figure, flagged in notes)
  - DE sugar-beet K₂O=335 — verified correct (midpoint of LWK Niedersachsen 380–290 range)
- **Window months:** All 348 planting windows have valid months 1–12. 0 invalid.
- **Null NPK:** 0 records with all three null. Honest nulls preserved where research gave none (e.g. PK potato K, AU all-K per GRDC soil-test policy, FR P/K soil-test-only).
- **Duplicates:** 25 apparent duplicate keys investigated — all are legitimate distinct records (different regions, growth stages, varieties, or sources). No accidental duplicates.

### 4. Conversion math (spot-checked)
- **PAU per-acre ×2.471:** All correct (e.g. tomato 60-25-25 → 148.3-61.8-61.8; wheat 50-25 → 124-62; rice 42-12-12 → 104-30-30)
- **US lbs/acre ×1.1209:** All 21 convert back to clean integers (e.g. 153.6→137.0, 201.8→180.0). No errors.
- **Japan kg/10a ×10:** All correct, including cabbage midpoint 290/150/290.
- **China mu×15:** Correct (e.g. Henan P 7–8 kg/mu → 112.5).
- **ID Permentan/Phonska:** Correct (e.g. 300×0.46=138, 275×0.10=27.5→28).
- **KR product-rate derivations:** Re-checked (urea 15kg×46%→69N; fused phosphate 37kg×20%→74P₂O₅; KCl 6.3×60%→38K₂O).

**Rounding notes (not errors):** Two values differ from strict rounding but match the research reports exactly (US soybean-IL K₂O 94.1 vs 94.16; US wheat-KS P₂O₅ 37.5 vs 37.55; IN maize P₂O₅ 60 vs 59.3; KR napa-cabbage N 300 vs 299). Import is faithful to research; values were NOT altered per the never-invent rule. The IN maize 60-vs-59.3 is flagged for Ahmed's decision.

## Records kept under_review (7)

### Batch 1 — ws2.json (5)
1. **Soybean IN-MP (24-64-32):** Values match research (ICAR-IISR Indore, Madhya Pradesh RDF), but `regionSlug` is null — should be `in-mp`. Region linkage imprecise.
2. **Soybean IN-MH (30-60-30):** Same issue for Maharashtra (VNMKV Parbhani) — should be `in-mh`.
3.–5. **Sugarcane PK poor/avg/rich fertility (294-170.5-123.6 / 229.8-113.7-123.6 / 165.6-56.8-61.8):** ×2.471 math is correct, but source is a scribd mirror of an extension presentation — reliability questionable. Flagged "treat with caution" per the original known-issue flag.

### Batch 2 — br.json (2)
6. **Maize BR-Cerrado first crop at sowing:** P₂O₅=60 (2nd P-class column) but K₂O=40 (3rd K-class column) in Raij et al. 1996 table — internally inconsistent soil-class mapping. Research never defines which column "medium" maps to.
7. **Coffee BR-Southeast producing:** N=300/P₂O₅=40/K₂O=300 match the *low* soil-P/low leaf-N columns, but `soilContext` says "Medium soil/leaf test" (medium would be 220/25/225). Label doesn't match values.

## Structural records (verified as properly labelled)

These are NOT normal agronomic recommendations but are correctly flagged as such in their notes:
- **France (8):** All labelled "BILAN PRÉVISIONNEL METHOD EXAMPLE" — no invented flat P/K. P/K null where soil-test-only.
- **Germany (6):** N framed as DüV Anlage 4 legal upper limit (not agronomic optimum); P/K from LWK Niedersachsen class-C only.
- **Spain (4 ITAP):** N-maxima flagged as "LEGAL N maxima, NOT agronomic optima."
- **Russia (8):** 7 carry "EXPERIMENTAL TRIAL DOSE"; 1 (Stavropol) is a labelled worked example, not a recommendation.

## Key data decisions confirmed correct
- Cotton PK 150-50-50 (CCRI primary); NIAB 150-75-75 variant in notes only, not averaged ✓
- BD rice: 4 separate records (Aus/Aman/BRRI/Aman-FRG/Boro), never collapsed ✓
- Brazil safrinha corn separate from first-crop via `variety` field ✓
- Italy durum-wheat vs soft wheat as separate items ✓
- Indonesia all national-level (regionSlug null) — matches research (no provincial tables exist) ✓
- AU K null throughout — correct per GRDC soil-test policy ✓
- Rapeseed reuses existing `canola` slug (FR/DE/PL) — no duplicate item ✓
- PK vegetable NPK: none imported (honestly not found, not copied from IN) ✓

## What I could NOT verify
- Whether the primary source documents (PAU PDFs, Embrapa bulletins, etc.) actually contain these values — no access to paywalled/official documents. Verification is limited to: JSON matches research report, research report cites a named source, math is correct, sources resolve.
- Agronomic correctness beyond what the research found (e.g. whether PAU's 124-62-0 is agronomically optimal — we verify it IS what PAU published, not whether PAU is right).
- The 7 under_review records need human judgment on: region slug assignment (2), source reliability acceptance (3), soil-class column mapping (2).

## Files changed
18 JSON files in `prisma/data/batch{1,2,3,4}/` — only `verificationStatus` flips (194) and `verificationNote` additions (7). No other fields touched. Windows and sources untouched.

## Recommended next steps for Ahmed
1. Review the 7 `verificationNote`s and decide: fix region slugs (2), accept/reject scribd sugarcane (3), resolve BR soil-class mapping (2).
2. Decide on IN maize P₂O₅ 60 vs 59.3 rounding.
3. Commit + push when satisfied — the seed will apply `verified` status on next Vercel deploy.
