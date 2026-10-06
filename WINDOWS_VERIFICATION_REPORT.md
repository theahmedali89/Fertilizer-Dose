# Planting Windows Verification Report

**Date:** 2026-10-06 | **Scope:** all 348 planting windows in `prisma/data/batch{1,2,3,4}/*.json` (all were `under_review`)
**Research basis:** `research-report-batch{1,2,3,4}.md` + detail files (`ws1-vegetables.md`, `ws2-fieldcrops.md`, `ws3-regions.md`, `ws4-bangladesh.md`, `ws-batch2-{us,br,id,au}.md`, `ws-batch3-{cn,tr,my,jp,kr}.md`, `ws-batch4-{de,es,fr,it,pl,ru}.md`)

## Verdict

| Result | Count |
|---|---|
| **verified** | **335** |
| **under_review** (with documented `verificationNote`) | **13** |
| **Total** | **348** |

All 335 verified windows had their `verificationStatus` set to `"verified"` in the JSON files. No months or activityType values were changed — questionable records were kept `under_review` with an explanatory `verificationNote` only.

## Checks performed

1. **Import accuracy:** every window's `startMonth`/`endMonth`/`activityType` was checked against the months documented in the research reports per crop+region. Cross-year windows (e.g. 11→2, 12→1, 10→3) treated as valid.
2. **Month range:** all startMonth/endMonth in 1–12 (pass).
3. **Activity types:** all in {SOW, TRANSPLANT, PLANT, HARVEST, LAND_PREPARATION} (pass).
4. **Duplicates:** no exact duplicates on (itemSlug, regionSlug, startMonth, endMonth, activityType) (pass).
5. **sourceKey resolution:** 2 failures found and fixed (see below); all other sourceKeys resolve in-file.

## Data fix (before verdicts)

Two windows in `batch1/ws2.json` — `potato/in-punjab` 9→10 SOW and 1→1 SOW — cited `sourceKey: "pau-veg-2021"`, which lives in `batch1/ws1.json`'s `sources` array, not ws2's. Both records were **moved to `batch1/ws1.json`** (ws1: 51→53 windows; ws2: 30→28), where their source now resolves in-file. Their months were verified against the PAU vegetable research (autumn: last week Sep–mid Oct; spring: 2nd fortnight Jan) → **verified**. No values changed; per-file counts shifted but the batch total is unchanged (348).

## Kept under_review (13) — reasons

**Wrong activityType (transplant documented, SOW recorded)** — 10 records. Research explicitly documents transplanting; the records use SOW. Months are correct, so values were NOT changed:
1. `batch1/ws4.json` rice/bd-national 6–7 — Aman (mostly T. Aman) is transplanted Jun–Jul; no nursery window in research.
2. `batch3/cn.json` rice/cn-south 7–7 — late-rice nursery sown **Jun 15–25**; late Jul–early Aug is transplanting (month AND activity mismatch).
3. `batch3/jp.json` rice/jp-hokkaido 5–5 — transplanted in May (nursery April).
4. `batch3/jp.json` rice/jp-kyushu 4–4 — early cultivation transplanted in April.
5. `batch3/jp.json` rice/jp-kyushu 6–6 — normal cultivation transplanted in June.
6. `batch3/jp.json` rice/jp-kanto 5–6 — transplanted May 15 / Jun 22 by variety.
7. `batch3/kr.json` rice/kr-jeolla 5–6 — RDA standard: transplanted late May–early Jun.
8. `batch3/kr.json` onion/kr-jeolla 10–10 — 60-day seedlings transplanted late Oct.
9. `batch4/it.json` tomato/it-emilia-romagna 4–5 — industry tomato transplanted end-Apr–May.

**SOW window extends beyond the sourced sowing period** — 2 records:
10. `batch1/ws4.json` tomato/bd-national 9–12 SOW — BAMIS Dhaka calendar bounds the seedbed to Sep–Oct; Oct–Dec is transplanting.
11. `batch1/ws4.json` chili/bd-national 10–12 SOW — BARI ARR 2023–24 bounds the seedbed to 2nd week of Oct; late Nov–Dec is transplanting.

**No named-source month basis** — 2 records:
12. `batch2/us.json` wheat/us-pnw 4–5 SOW — research explicitly lists the PNW planting window as an unverified gap (UI Idaho guide is nutrients-only; WA/OSU guides not found).
13. `batch2/id.json` maize/id-java 4–6 SOW — research documents no official fixed planting months for corn (dry-season crop within the Apr–Sep framework only); 4–6 narrows this without a sourced month table.

## Deliberate conventions accepted (verified, but noted)

- **Spain olive/citrus flowering months** (`es.json`): perennial flowering months (e.g. olive Andalucía Mar–Jun, citrus Navelina Mar–May) are stored with `activityType: SOW` per the documented integration decision in `research-report-batch4.md` §5.2, with honest "FLOWERING months (perennial crop — not a sowing window)" notes. Months match MAPA Calendario research → verified, but the UI should treat these carefully (they are NOT sowing events).
- **Nursery→SOW mappings** (e.g. rice/pk-punjab "Nursery mid-June. [mapped from nursery record]") are documented in notes and match research months → verified.

## Seed fix (`prisma/seed-batch{1,2,3,4}.ts`)

1. **Window section** now UPDATEs `verificationStatus` for existing records instead of silently skipping (same pattern as the recommendation fix), in all 4 files.
2. **`vs()` bug fix (important):** the old `vs()` mapped `"verified"` → `"draft"`. Applying the requested update pattern verbatim would have **demoted all 335 verified windows (and, on re-seed, the 194 previously-verified recommendations) to `draft`** in the database. `vs()` now passes `"verified"` through. This latent bug existed since commit `4346738` and affected recommendations too — now repaired for both.
3. `verificationNote` is JSON-only documentation (the `PlantingWindow` model has no such column); the seed writes `verificationStatus` only.
4. `npm run typecheck` ✅ passes. ESLint on the four seed files: clean.

## Not committed

All changes are local and uncommitted, awaiting parent review:
- 20 data JSON files (`prisma/data/batch*/*.json`) — statuses, notes, 2-record move
- `prisma/seed-batch1.ts` … `prisma/seed-batch4.ts` — window update + `vs()` fix

(Unrelated pre-existing uncommitted changes to `prisma/seed.ts` and `src/messages/ar.json` were left untouched.)

## Limits (honest)

- This pass verified **JSON ↔ research fidelity** (months and activity labels match the research reports), not research ↔ primary source. It does not re-validate the underlying agronomy.
- 335 "verified" means the data faithfully represents the cited research — including records whose research basis is itself approximate (e.g. FR maize harvest "Sep–Oct (approximate)"), which are documented as such in notes.
