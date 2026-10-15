# Dedup Report — Import 2026-10-15 Part 2 (Ahmed's new agronomic batch)

> **Method:** Parsed 64 Section-1 records + 64 Section-2 items from Ahmed's two messages.
> Dedup checked against seed-data files (`prisma/data/*/`) **and** the approved
> `import-2026-10-15/final-data.json` (d6d8eef batch) as proxies for DB state —
> **NOT live DB**. Live-DB verification MUST run before any import.
> **Nothing was imported.** Analysis only.

## Summary

| Section | Parsed | Already handled (no-op) | NEW | Blocked / needs decision |
|---|---|---|---|---|
| §1 European (PL/ES/FR/DE) | 53 | 53 (50 in d6d8eef batch + 3 dup-same in seeds) | 0 | 0 |
| §1 Under-review items | 11 | 0 | 1 (FR okra / Grand Est) | 10 (9 no-country + 1 no-NPK) |
| §2 Growing items (general NPK) | 64 | 64 (all in growing-npk.json as midpoints) | 0 | 0 — but see §6 schema flag |

**Bottom line:** Out of 128 parsed records/items, only **1 is genuinely new**
(FR / okra / Grand Est). Everything else duplicates already-imported data.

---

## 1. Section 1 — European records (53): ALL already handled

50 of 53 match `import-2026-10-15/final-data.json` (the approved d6d8eef batch)
with **identical values** — re-import would be a complete no-op.
The remaining 3 match vegdose seeds exactly (DUPLICATE-same-values; these were
already evaluated and skipped in the part-1 report §3).

| # | Country | Crop | Region | N | P2O5 | K2O | Status |
|---|---|---|---|---|---|---|---|
| 1 | PL | cabbage | — | 180–240 | 60–90 | 160–220 | in d6d8eef (update) |
| 2 | PL | garlic | — | 100–130 | 60–80 | 90–130 | dup-same in seeds (skipped part-1) |
| 3 | PL | peas | — | 30–45 | 50–70 | 60–80 | in d6d8eef (update) |
| 4 | PL | radish | — | 50–80 | 40–60 | 60–90 | in d6d8eef (update) |
| 5 | PL | brinjal | — | 140–180 | 70–100 | 140–200 | in d6d8eef (update) |
| 6 | PL | chili | — | 130–170 | 60–90 | 140–200 | in d6d8eef (update) |
| 7 | PL | cauliflower | — | 180–240 | 70–100 | 160–220 | in d6d8eef (update) |
| 8 | PL | carrot | — | 90–130 | 50–80 | 140–200 | in d6d8eef (update) |
| 9 | PL | spinach | — | 80–120 | 45–65 | 80–120 | in d6d8eef (update) |
| 10 | PL | potato | — | 120–160 | 60–90 | 140–200 | in d6d8eef (update) |
| 11 | PL | onion | — | 120–160 | 60–85 | 120–180 | in d6d8eef (update) |
| 12 | PL | tomato | — | 140–180 | 70–100 | 180–240 | in d6d8eef (update) |
| 13 | PL | sugar-beet | — | 110–150 | 60–85 | 160–220 | in d6d8eef (insert) |
| 14 | PL | barley | — | 80–120 | 45–65 | 60–90 | in d6d8eef (insert) |
| 15 | ES | carrot | — | 100–140 | 50–75 | 150–220 | in d6d8eef (update) |
| 16 | ES | radish | — | 50–75 | 35–50 | 45–70 | in d6d8eef (update) |
| 17 | ES | peas | — | 25–40 | 45–65 | 50–70 | in d6d8eef (update) |
| 18 | ES | spinach | — | 80–120 | 40–60 | 80–120 | in d6d8eef (update) |
| 19 | ES | cauliflower | — | 150–200 | 60–90 | 130–180 | in d6d8eef (update) |
| 20 | ES | cabbage-chinese | — | 120–160 | 50–70 | 100–140 | dup-same in seeds (skipped part-1) |
| 21 | ES | cabbage | — | 140–190 | 60–85 | 120–170 | in d6d8eef (update) |
| 22 | ES | chili | — | 160–220 | 70–100 | 160–230 | in d6d8eef (update) |
| 23 | ES | brinjal | — | 140–190 | 60–90 | 140–200 | in d6d8eef (update) |
| 24 | ES | onion | — | 120–160 | 60–80 | 110–160 | in d6d8eef (update) |
| 25 | ES | tomato | — | 180–240 | 80–120 | 180–270 | in d6d8eef (update) |
| 26 | ES | sugar-beet | — | 120–160 | 60–85 | 140–200 | in d6d8eef (insert) |
| 27 | ES | rice | — | 120–160 | 45–65 | 40–60 | in d6d8eef (insert) |
| 28 | ES | olive | Andalucía | 60–100 | 25–40 | 80–130 | in d6d8eef (insert) |
| 29 | ES | sunflower | — | 50–75 | 35–55 | 35–55 | in d6d8eef (insert) |
| 30 | ES | maize | — | 240–320 | 85–120 | 110–160 | in d6d8eef (insert) |
| 31 | FR | radish | — | 40–65 | 30–45 | 40–65 | in d6d8eef (update) |
| 32 | FR | peas | — | 25–40 | 45–65 | 50–75 | in d6d8eef (update) |
| 33 | FR | brinjal | — | 130–170 | 60–90 | 140–200 | in d6d8eef (update) |
| 34 | FR | chili | — | 130–170 | 60–90 | 150–210 | in d6d8eef (update) |
| 35 | FR | cauliflower | — | 170–230 | 65–95 | 140–200 | in d6d8eef (update) |
| 36 | FR | spinach | — | 90–130 | 45–65 | 80–120 | in d6d8eef (update) |
| 37 | FR | carrot | — | 90–130 | 55–80 | 140–200 | in d6d8eef (update) |
| 38 | FR | potato | — | 140–190 | 70–110 | 160–240 | in d6d8eef (update) |
| 39 | FR | onion | — | 110–150 | 55–80 | 110–160 | in d6d8eef (update) |
| 40 | FR | tomato | — | 150–200 | 70–100 | 160–240 | in d6d8eef (update) |
| 41 | FR | soybean | — | 0–0 | 45–65 | 50–75 | in d6d8eef (insert) |
| 42 | FR | sugar-beet | — | 110–150 | 60–85 | 160–240 | in d6d8eef (insert) |
| 43 | FR | sunflower | — | 50–80 | 40–55 | 45–65 | in d6d8eef (insert) |
| 44 | FR | canola | — | 150–210 | 60–90 | 70–110 | in d6d8eef (insert) |
| 45 | FR | barley | — | 130–170 | 45–65 | 50–75 | in d6d8eef (insert) |
| 46 | FR | wheat | — | 170–240 | 50–75 | 50–80 | in d6d8eef (insert) |
| 47 | DE | potato | — | 140–180 | 65–90 | 180–260 | in d6d8eef (update) |
| 48 | DE | radish | — | 60–90 | 35–55 | 50–80 | in d6d8eef (update) |
| 49 | DE | garlic | — | 90–120 | 50–70 | 80–120 | in d6d8eef (update) |
| 50 | DE | spinach | — | 100–140 | 45–65 | 80–120 | in d6d8eef (update) |
| 51 | DE | onion | — | 110–140 | 50–75 | 120–160 | in d6d8eef (update) |
| 52 | DE | carrot | — | 90–130 | 50–75 | 140–200 | in d6d8eef (update) |
| 53 | DE | cabbage-chinese | — | 130–170 | 50–70 | 120–160 | dup-same in seeds (skipped part-1) |

> Note: "in d6d8eef" means the record was in the approved 168-record batch
> (pushed to GitHub; live-DB application still unverified per parent's notes).

## 2. Section 1 — NEW record (1)

| # | Country | Crop | Region | N | P2O5 | K2O | Method | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | FR | okra | Grand Est | 70–90 | 40–60 | 60–90 | Tunnel dose; sow 5-5 (May under tunnel); open-field non-viable (thermal limits) | CTIFL |

- No existing FR/okra regional record in seeds (only fr-national exists).
- Region slug **`fr-grand-est` exists** in `batch4/fr.json` newRegions → mappable.

## 3. Section 1 — NEED-COUNTRY (9): cannot dedup or import

These records carry NPK + method + source but **no country**. FertilizerRecommendation
requires countryId; guessing a country would violate the no-invent rule.
Ahmed must specify the country (or countries) for each before any import.

| # | Crop | N | P2O5 | K2O | Method | Source | Possible countries (from sources — NOT assumed) |
|---|---|---|---|---|---|---|---|
| 1 | beans | 30–50 | 60–80 | 40–60 | 100% basal at sowing (0 DAS) | ICAR-IIPR Kanpur / Embrapa Arroz e Feijão | IN or BR? |
| 2 | buckwheat | 30–45 | 40–60 | 30–50 | 100% basal at seedbed preparation | MAFF Japan / Cornell | JP or US? |
| 3 | cassava | 80–120 | 40–60 | 100–150 | 1/3 N + full P + 1/3 K basal (0–30 DAP); 2/3 N+K at 60–90 DAP earthing-up | IITA Ibadan / BSIP Kementan RI | NG or ID? |
| 4 | coconut | 100–150 | 50–80 | 180–250 | 2 splits: pre-monsoon (May–Jun) + post-monsoon (Sep–Oct); 500g N / 320g P2O5 / 1200g K2O per palm/year at 175 palms/ha | ICAR-CPCRI Kasaragod | IN? |
| 5 | millet (proso & foxtail) | 40–65 | 25–40 | 20–35 | 50% N + full P/K basal; 50% N at tillering | UNL CropWatch Nebraska / ICAR-IIMR | US or IN? |
| 6 | oats | 60–90 | 35–55 | 40–70 | 50% N + full P/K basal; 50% N at jointing/tillering | Univ Minnesota / LWK Niedersachsen | US or DE? |
| 7 | sesame | 40–60 | 25–40 | 25–40 | 50% N + full P/K basal; 50% N at flower bud initiation (30 DAS) | ICAR-AICRP Sesame / Texas A&M | IN or US? |
| 8 | sorghum | 80–120 | 35–55 | 35–60 | 30% N + full P/K basal; 70% N at 5–6 leaf stage (30–35 DAS) | Texas A&M / GRDC Australia | US or AU? |
| 9 | sweet-potato | 45–70 | 40–60 | 90–150 | 1/3 N + full P + 1/3 K basal; 2/3 N+K at vine training/earthing-up (30–45 DAP); excess N reduces tuber bulking | LSU AgCenter / BSIP Balitkabi | US or ID? |

> For reference, the d6d8eef batch already imported these crops for specific
> countries (BR/beans, JP/buckwheat, ID/cassava, KR/sesame, AU+US/sorghum,
> KR+JP/sweet-potato) with DIFFERENT values — so these 9 are not obviously
> the same records, but without a country they cannot be matched.

## 4. Section 1 — NO-NPK-DATA (1): not importable as a recommendation

| # | Country | Crop | Region | Note |
|---|---|---|---|---|
| 1 | FR | okra | Île-de-France | Sowing info only (sow 5-5 May under tunnel; protected cultivation only). No NPK values given. Source: CTIFL / Chambre d'Agriculture Île-de-France |

Region slug `fr-ile-de-france` exists. If Ahmed supplies the tunnel NPK dose, this
becomes importable like the Grand Est record.

## 5. Section 1 — skipped

- **Money Plant**: NEEDS-SOURCE per Ahmed's own note (no commercial field dose exists for an indoor houseplant). Correctly excluded — same as part-1 handling.

## 6. Section 2 — all 64 items ALREADY IMPORTED (as midpoints) ⚠️

Every one of Ahmed's 64 Section-2 items already exists in
`prisma/data/growing-npk.json` (commit 204b323, "Research import (Ahmed 2026-10-14)"),
with values equal to the **rounded midpoints** of Ahmed's ranges (verified for all
64 — 0 mismatches, 0 missing).

| # | Slug (mapped) | Ahmed range N–P–K | Existing (midpoint) | Status |
|---|---|---|---|---|
| 1 | alfalfa | 20–35 / 75–110 / 120–180 | 28 / 92 / 150 | HAS-NPK (same data) |
| 2 | barley | 60–100 / 30–50 / 40–70 | 80 / 40 / 55 | HAS-NPK (same data) |
| 3 | beans | 30–50 / 60–80 / 40–60 | 40 / 70 / 50 | HAS-NPK (same data) |
| 4 | bean | 35–50 / 60–80 / 40–60 | 42 / 70 / 50 | HAS-NPK (same data) |
| 5 | brinjal | 120–160 / 60–90 / 60–100 | 140 / 75 / 80 | HAS-NPK (same data) |
| 6 | buckwheat | 30–45 / 40–60 / 30–50 | 38 / 50 / 40 | HAS-NPK (same data) |
| 7 | cabbage | 160–220 / 60–90 / 130–190 | 190 / 75 / 160 | HAS-NPK (same data) |
| 8 | canola | 120–170 / 45–70 / 50–80 | 145 / 58 / 65 | HAS-NPK (same data) |
| 9 | carrot | 90–130 / 60–90 / 140–200 | 110 / 75 / 170 | HAS-NPK (same data) |
| 10 | cassava | 80–120 / 40–60 / 100–150 | 100 / 50 / 125 | HAS-NPK (same data) |
| 11 | cauliflower | 140–190 / 70–100 / 100–150 | 165 / 85 / 125 | HAS-NPK (same data) |
| 12 | chickpea | 15–25 / 40–60 / 20–35 | 20 / 50 / 28 | HAS-NPK (same data) |
| 13 | chili | 120–160 / 60–80 / 60–90 | 140 / 70 / 75 | HAS-NPK (same data) |
| 14 | cabbage-chinese | 150–200 / 60–90 / 110–150 | 175 / 75 / 130 | HAS-NPK (same data) |
| 15 | chinese-cabbage | 180–240 / 80–120 / 140–180 | 210 / 100 / 160 | HAS-NPK (same data) |
| 16 | citrus | 160–240 / 50–80 / 120–200 | 200 / 65 / 160 | HAS-NPK (same data) |
| 17 | cocoa | 80–120 / 40–70 / 100–160 | 100 / 55 / 130 | HAS-NPK (same data) |
| 18 | coconut | 100–150 / 50–80 / 180–250 | 125 / 65 / 215 | HAS-NPK (same data) |
| 19 | coffee | 200–300 / 40–80 / 200–300 | 250 / 60 / 250 | HAS-NPK (same data) |
| 20 | cotton | 140–200 / 50–80 / 50–90 | 170 / 65 / 70 | HAS-NPK (same data) |
| 21 | cowpea | 20–30 / 40–60 / 25–40 | 25 / 50 / 32 | HAS-NPK (same data) |
| 22 | cucumber | 110–150 / 60–90 / 120–180 | 130 / 75 / 150 | HAS-NPK (same data) |
| 23 | daikon | 110–150 / 90–130 / 110–150 | 130 / 110 / 130 | HAS-NPK (same data) |
| 24 | durum-wheat | 110–160 / 45–70 / 40–70 | 135 / 58 / 55 | HAS-NPK (same data) |
| 25 | finger-millet | 45–60 / 30–45 / 25–35 | 52 / 38 / 30 | HAS-NPK (same data) |
| 26 | garlic | 110–150 / 60–90 / 100–140 | 130 / 75 / 120 | HAS-NPK (same data) |
| 27 | grape | 50–80 / 30–50 / 80–140 | 65 / 40 / 110 | HAS-NPK (same data) |
| 28 | groundnut | 20–30 / 40–60 / 40–60 | 25 / 50 / 50 | HAS-NPK (same data) |
| 29 | jute | 60–80 / 20–35 / 40–60 | 70 / 28 / 50 | HAS-NPK (same data) |
| 30 | lentil | 15–25 / 35–50 / 20–40 | 20 / 42 / 30 | HAS-NPK (same data) |
| 31 | lupins | 0–20 / 35–55 / 40–65 | 10 / 45 / 52 | HAS-NPK (same data) |
| 32 | mango | 120–180 / 50–75 / 120–180 | 150 / 62 / 150 | HAS-NPK (same data) |
| 33 | marigold | 80–120 / 60–80 / 60–80 | 100 / 70 / 70 | HAS-NPK (same data) |
| 34 | millet | 40–65 / 25–40 / 20–35 | 52 / 32 / 28 | HAS-NPK (same data) |
| 35 | mung-bean | 20–30 / 40–60 / 20–40 | 25 / 50 / 30 | HAS-NPK (same data) |
| 36 | mustard | 60–90 / 30–50 / 30–50 | 75 / 40 / 40 | HAS-NPK (same data) |
| 37 | napa-cabbage | 140–180 / 60–90 / 120–160 | 160 / 75 / 140 | HAS-NPK (same data) |
| 38 | rubber | 60–90 / 50–80 / 80–120 | 75 / 65 / 100 | HAS-NPK (same data) |
| 39 | neem | 30–50 / 20–35 / 20–40 | 40 / 28 / 30 | HAS-NPK (same data) |
| 40 | oats | 60–90 / 35–55 / 40–70 | 75 / 45 / 55 | HAS-NPK (same data) |
| 41 | palm-oil | 120–180 / 60–100 / 180–280 | 150 / 80 / 230 | HAS-NPK (same data) |
| 42 | okra | 90–120 / 50–70 / 60–90 | 105 / 60 / 75 | HAS-NPK (same data) |
| 43 | olive | 60–100 / 25–45 / 80–140 | 80 / 35 / 110 | HAS-NPK (same data) |
| 44 | onion | 110–150 / 60–90 / 110–160 | 130 / 75 / 135 | HAS-NPK (same data) |
| 45 | pearl-millet | 60–80 / 30–45 / 25–40 | 70 / 38 / 32 | HAS-NPK (same data) |
| 46 | peas | 25–40 / 50–70 / 50–80 | 32 / 60 / 65 | HAS-NPK (same data) |
| 47 | pepper | 150–210 / 70–100 / 150–230 | 180 / 85 / 190 | HAS-NPK (same data) |
| 48 | pigeon-pea | 20–30 / 45–65 / 20–35 | 25 / 55 / 28 | HAS-NPK (same data) |
| 49 | potato | 140–200 / 80–120 / 180–260 | 170 / 100 / 220 | HAS-NPK (same data) |
| 50 | radish | 50–75 / 35–55 / 50–75 | 62 / 45 / 62 | HAS-NPK (same data) |
| 51 | rose | 180–260 / 60–100 / 180–280 | 220 / 80 / 230 | HAS-NPK (same data) |
| 52 | rye | 70–110 / 40–60 / 60–90 | 90 / 50 / 75 | HAS-NPK (same data) |
| 53 | sesame | 40–60 / 25–40 / 25–40 | 50 / 32 / 32 | HAS-NPK (same data) |
| 54 | shallot | 90–120 / 50–75 / 70–100 | 105 / 62 / 85 | HAS-NPK (same data) |
| 55 | sorghum | 80–120 / 35–55 / 35–60 | 100 / 45 / 48 | HAS-NPK (same data) |
| 56 | soybean | 0–25 / 45–75 / 60–100 | 12 / 60 / 80 | HAS-NPK (same data) |
| 57 | spinach | 90–130 / 45–65 / 70–110 | 110 / 55 / 90 | HAS-NPK (same data) |
| 58 | sugar-beet | 110–150 / 60–90 / 160–240 | 130 / 75 / 200 | HAS-NPK (same data) |
| 59 | sugarcane | 120–180 / 40–80 / 120–180 | 150 / 60 / 150 | HAS-NPK (same data) |
| 60 | sunflower | 50–80 / 40–60 / 40–70 | 65 / 50 / 55 | HAS-NPK (same data) |
| 61 | sweet-potato | 45–70 / 40–60 / 90–150 | 58 / 50 / 120 | HAS-NPK (same data) |
| 62 | tomato | 170–240 / 80–120 / 180–270 | 205 / 100 / 225 | HAS-NPK (same data) |
| 63 | triticale | 70–110 / 40–60 / 50–80 | 90 / 50 / 65 | HAS-NPK (same data) |
| 64 | yam | 80–110 / 40–60 / 90–140 | 95 / 50 / 115 | HAS-NPK (same data) |

### ⚠️ SCHEMA FLAG — midpoints were stored (do NOT repeat)

`GrowingItem.npkN/npkP/npkK` are single Floats, but Ahmed's data gives **ranges**.
The 2026-10-14 import collapsed ranges to **rounded midpoints** — e.g. soybean
N "0–25" became `12`, lupins N "0–20" became `10`. A midpoint is an invented
number: it never appeared in any source and misrepresents the recommendation
(e.g. "0–25 kg N/ha" honestly means "little to no N needed"; `12` looks like a
precise prescription).

**Recommendation (do NOT implement without approval):**
- **(a) Preferred:** add `npkNMin/npkNMax/npkPMin/npkPMax/npkKMin/npkKMax` (Float,
  nullable) to GrowingItem via Prisma migration; backfill from Ahmed's ranges;
  update the calculator/display to render ranges honestly (as FertilizerRecommendation
  already does). Keep the single-value fields for legacy point data or deprecate them.
- (b) Alternative: store general (non-country) guidance as FertilizerRecommendation
  rows — but `countryId` is required there, so this needs a sentinel "global" country
  or a schema change anyway. (a) is cleaner.
- Also: the existing midpoint values in growing-npk.json should eventually be
  replaced with true ranges — flag for Ahmed's decision (re-seed from ranges).

## 7. Slug-mapping ambiguities resolved

| # | Ahmed label | Mapped to | Basis |
|---|---|---|---|
| 1 | Chili / Paprika (PL), Chili / Pepper (ES) | `chili` | Existing ES/PL seeds use `chili`; Section 2 keeps `pepper` as a separate item (bell pepper) |
| 2 | Chinese Cabbage (ES/DE) | `cabbage-chinese` | Matches existing ES/DE vegdose `cabbage-chinese` records (Section 2 distinguishes `cabbage-chinese` [vegetable] vs `chinese-cabbage` [napa crop]) |
| 3 | Beans (under-review, no country) | `beans` | Matches growing-npk `beans` (field bean); kept separate from `bean` |
| 4 | Citrus Orange → `citrus`, Coffee Arabica → `coffee`, Oil Palm → `palm-oil`, Natural Rubber → `rubber` | — | Matches growing-npk.json keys from the 2026-10-14 import |
| 5 | Millet / Proso & Foxtail | `millet` | Matches growing-npk `millet` |

## 8. Region notes

- `fr-grand-est` and `fr-ile-de-france` Region slugs **exist** in `batch4/fr.json`
  newRegions → the FR okra records are mappable without new Region rows.
- ES olive "Andalucía" was already handled in the d6d8eef batch (insert with region).
- No other region labels in this batch.

## 9. Files produced

- `prisma/data/import-2026-10-15-part2/import-data.json` — 64 parsed Section-1 records
- `prisma/data/import-2026-10-15-part2/dedup-report.md` — this report
- `/tmp/dedup_part2.py` — analysis script (auditable, ephemeral)

## 10. Recommended next steps (for parent agent)

1. **Tell Ahmed the headline:** 127 of 128 records are already imported — only
   **FR / okra / Grand Est** is new. Ask whether to import just that one record.
2. **Ask Ahmed for countries** for the 9 no-country under-review items (§3) — do not guess.
3. **Ask Ahmed about the midpoint issue** (§6): the 2026-10-14 import stored rounded
   midpoints in growing-npk.json. Propose the schema migration (a) for honest ranges;
   do NOT re-seed until he decides.
4. **Live-DB check** before any import (seed proxy may be stale, per part-1 report).
5. Okra Île-de-France needs NPK values from Ahmed if he wants it imported.
