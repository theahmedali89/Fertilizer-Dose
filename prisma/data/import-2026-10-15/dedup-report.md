# Dedup Report — Import 2026-10-15 (Ahmed's NPK data)

> **Method:** Parsed 197 records from Ahmed's message. Dedup checked against seed-data files
> (`prisma/data/*/`) as a proxy for DB state — **NOT live DB** (production DB is db.prisma.io,
> unreachable from this environment; local .env points to localhost). Live-DB verification
> MUST run before any import.

## Summary

| Category | Count |
|---|---|
| Total parsed | 197 |
| NEW (no existing country+crop+region) | 59 |
| DUPLICATE (combo exists in seeds) | 120 |
| NEW-REGION (region has no DB slug yet) | 18 |

### Duplicate breakdown
- Same values as existing: **29** (no change needed if imported)
- Different values: **91** (Ahmed's data would UPDATE these)
- Existing statuses in seeds: {'verified': 120}
- under_review matches in seed proxy: **0**

> Note: seed files mark these as 'verified', but the live DB may have under_review
> records not reflected in seeds. The parent agent should run a live-DB check
> (country+crop+region → verificationStatus) before import.

## 1. NEW records (59) — safe to insert

| # | Country | Crop | Region | N | P2O5 | K2O |
|---|---|---|---|---|---|---|
| 1 | AU | barley | — | 50–85 | 25–40 | 0–30 |
| 2 | AU | canola | — | 75–130 | 30–50 | 0–40 |
| 3 | AU | sorghum | — | 60–100 | 25–40 | 0–30 |
| 4 | AU | wheat | — | 60–110 | 25–45 | 0–40 |
| 5 | BD | jute | — | 50–70 | 20–30 | 35–50 |
| 6 | BD | lentil | — | 15–25 | 35–50 | 25–35 |
| 7 | BD | maize | — | 200–260 | 80–120 | 120–170 |
| 8 | BD | mustard | — | 60–85 | 30–45 | 35–50 |
| 9 | BD | rice | — | 120–150 | 45–60 | 60–90 |
| 10 | BD | sugarcane | — | 120–150 | 60–85 | 80–110 |
| 11 | BD | wheat | — | 90–120 | 50–70 | 40–60 |
| 12 | BR | beans | Southeast | 60–90 | 40–70 | 30–50 |
| 13 | BR | coffee | Southeast | 200–300 | 40–80 | 200–300 |
| 14 | BR | maize | Southeast | 120–160 | 50–80 | 40–70 |
| 15 | BR | rice | Southeast | 50–80 | 40–70 | 30–50 |
| 16 | BR | sugarcane | Southeast | 100–140 | 30–50 | 120–160 |
| 17 | CN | canola | — | 120–160 | 50–75 | 60–90 |
| 18 | CN | cotton | — | 160–220 | 60–90 | 75–110 |
| 19 | CN | maize | — | 160–210 | 50–75 | 60–90 |
| 20 | CN | rice | — | 110–145 | 45–65 | 50–75 |
| 21 | CN | soybean | — | 25–40 | 45–65 | 45–65 |
| 22 | CN | sugarcane | South China | 200–260 | 80–120 | 160–240 |
| 23 | CN | wheat | — | 160–200 | 65–90 | 50–80 |
| 24 | ES | maize | — | 240–320 | 85–120 | 110–160 |
| 25 | ES | rice | — | 120–160 | 45–65 | 40–60 |
| 26 | ES | sugar-beet | — | 120–160 | 60–85 | 140–200 |
| 27 | ES | sunflower | — | 50–75 | 35–55 | 35–55 |
| 28 | FR | barley | — | 130–170 | 45–65 | 50–75 |
| 29 | FR | canola | — | 150–210 | 60–90 | 70–110 |
| 30 | FR | soybean | — | 0–0 | 45–65 | 50–75 |
| 31 | FR | sugar-beet | — | 110–150 | 60–85 | 160–240 |
| 32 | FR | sunflower | — | 50–80 | 40–55 | 45–65 |
| 33 | FR | wheat | — | 170–240 | 50–75 | 50–80 |
| 34 | ID | cassava | — | 80–110 | 40–60 | 90–130 |
| 35 | ID | groundnut | — | 25–35 | 40–55 | 35–50 |
| 36 | ID | rice | — | 90–125 | 36–54 | 40–60 |
| 37 | ID | sugarcane | — | 120–150 | 60–90 | 90–135 |
| 38 | JP | buckwheat | Tohoku | 30–45 | 40–60 | 35–50 |
| 39 | JP | rice | Tohoku | 70–95 | 60–85 | 70–95 |
| 40 | JP | soybean | — | 20–30 | 60–80 | 60–80 |
| 41 | JP | wheat | — | 100–140 | 80–120 | 70–100 |
| 42 | KR | barley | — | 70–95 | 50–70 | 40–60 |
| 43 | KR | maize | — | 140–180 | 60–80 | 80–100 |
| 44 | KR | sesame | — | 60–80 | 40–50 | 40–55 |
| 45 | KR | soybean | — | 25–35 | 40–60 | 40–60 |
| 46 | KR | sweet-potato | — | 45–60 | 45–65 | 100–140 |
| 47 | MY | rice | Peninsular | 100–130 | 40–60 | 40–60 |
| 48 | PK | canola | Punjab | 80–100 | 50–65 | 30–45 |
| 49 | PK | mustard | Punjab | 75–90 | 45–60 | 25–35 |
| 50 | PK | olive | Punjab | 80–120 | 45–65 | 90–135 |
| 51 | PK | sunflower | Punjab | 75–90 | 50–65 | 0–30 |
| 52 | PL | barley | — | 80–120 | 45–65 | 60–90 |
| 53 | PL | sugar-beet | — | 110–150 | 60–85 | 160–220 |
| 54 | TR | chickpea | — | 20–30 | 40–60 | 0–30 |
| 55 | TR | lentil | — | 20–30 | 45–60 | 0–30 |
| 56 | TR | sunflower | — | 70–90 | 45–60 | 30–50 |
| 57 | TR | wheat | — | 100–140 | 50–70 | 0–40 |
| 58 | US | cowpea | Southeast | 30–45 | 45–65 | 45–65 |
| 59 | US | soybean | — | 0–0 | 45–75 | 65–110 |

## 2. NEW-REGION records (18) — need Region rows first

These country+crop combos are new *because* the region has no existing Region slug.
Import must create the Region (or map to null) before inserting.

| # | Country | Crop | Region (Ahmed) | N | P2O5 | K2O | Flag |
|---|---|---|---|---|---|---|---|
| 1 | CN | potato | Yangtze & Southwest | 120–160 | 60–90 | 120–180 | region 'Yangtze & Southwest' has no existing slug -> NEW region needed |
| 2 | DE | barley | Niedersachsen & Bayern | 130–170 | 55–75 | 80–125 | region 'Niedersachsen & Bayern' has no existing slug -> NEW region needed |
| 3 | DE | canola | Niedersachsen & Bayern | 160–200 | 70–100 | 120–180 | region 'Niedersachsen & Bayern' has no existing slug -> NEW region needed |
| 4 | DE | maize | Bayern | 160–200 | 70–95 | 140–200 | region 'Bayern' has no existing slug -> NEW region needed |
| 5 | DE | rye | Niedersachsen & Bayern | 120–160 | 50–75 | 90–140 | region 'Niedersachsen & Bayern' has no existing slug -> NEW region needed |
| 6 | DE | sugar-beet | Bayern | 120–160 | 70–100 | 180–280 | region 'Bayern' has no existing slug -> NEW region needed |
| 7 | DE | triticale | Niedersachsen & Bayern | 130–180 | 55–75 | 80–120 | region 'Niedersachsen & Bayern' has no existing slug -> NEW region needed |
| 8 | DE | wheat | Niedersachsen & Bayern | 170–220 | 65–85 | 90–135 | region 'Niedersachsen & Bayern' has no existing slug -> NEW region needed |
| 9 | ES | olive | Andalucía | 60–100 | 25–40 | 80–130 | region 'Andalucía' has no existing slug -> NEW region needed |
| 10 | JP | sweet-potato | Kanto | 30–50 | 60–90 | 90–130 | region 'Kanto' has no existing slug -> NEW region needed |
| 11 | KR | rice | Gyeongsang | 80–100 | 40–55 | 50–70 | region 'Gyeongsang' has no existing slug -> NEW region needed |
| 12 | KR | wheat | Chungcheong | 90–110 | 60–80 | 40–60 | region 'Chungcheong' has no existing slug -> NEW region needed |
| 13 | PK | grape | KPK | 90–130 | 50–75 | 110–160 | region 'KPK' has no existing slug -> NEW region needed |
| 14 | TR | barley | Southeast Anatolia | 70–100 | 45–65 | 0–30 | region 'Southeast Anatolia' has no existing slug -> NEW region needed |
| 15 | TR | maize | Southeast Anatolia | 180–240 | 70–90 | 50–80 | region 'Southeast Anatolia' has no existing slug -> NEW region needed |
| 16 | US | cotton | Texas | 80–135 | 45–70 | 45–90 | region 'Texas' has no existing slug -> NEW region needed |
| 17 | US | sorghum | Georgia | 80–120 | 40–60 | 60–90 | region 'Georgia' has no existing slug -> NEW region needed |
| 18 | US | wheat | Great Plains | 90–135 | 40–65 | 35–55 | region 'Great Plains' has no existing slug -> NEW region needed |

## 3. DUPLICATES — same values (29)

Existing record already matches Ahmed's values. Import would be a no-op (or status-only update).

- **AU / carrot / Western Australia** — N[110, 150] P[60, 85] K[150, 220] (existing: {'ranges': {'n': '110-150', 'p2o5': '60-85', 'k2o': '150-220'}}, status=verified, src=vegdose)
- **AU / onion / national** — N[130, 170] P[65, 90] K[110, 160] (existing: {'ranges': {'n': '130-170', 'p2o5': '65-90', 'k2o': '110-160'}}, status=verified, src=vegdose)
- **DE / cabbage-chinese / national** — N[130, 170] P[50, 70] K[120, 160] (existing: {'ranges': {'n': '130-170', 'p2o5': '50-70', 'k2o': '120-160'}}, status=verified, src=vegdose)
- **ES / cabbage-chinese / national** — N[120, 160] P[50, 70] K[100, 140] (existing: {'ranges': {'n': '120-160', 'p2o5': '50-70', 'k2o': '100-140'}}, status=verified, src=vegdose)
- **ID / brinjal / national** — N[90, 120] P[60, 80] K[60, 90] (existing: {'ranges': {'n': '90-120', 'p2o5': '60-80', 'k2o': '60-90'}}, status=verified, src=vegdose)
- **ID / cabbage / national** — N[110, 140] P[60, 80] K[60, 85] (existing: {'ranges': {'n': '110-140', 'p2o5': '60-80', 'k2o': '60-85'}}, status=verified, src=vegdose)
- **ID / cabbage-chinese / national** — N[90, 120] P[50, 70] K[60, 80] (existing: {'ranges': {'n': '90-120', 'p2o5': '50-70', 'k2o': '60-80'}}, status=verified, src=vegdose)
- **ID / carrot / national** — N[50, 65] P[45, 60] K[60, 80] (existing: {'ranges': {'n': '50-65', 'p2o5': '45-60', 'k2o': '60-80'}}, status=verified, src=vegdose)
- **ID / potato / national** — N[130, 160] P[90, 120] K[120, 160] (existing: {'ranges': {'n': '130-160', 'p2o5': '90-120', 'k2o': '120-160'}}, status=verified, src=vegdose)
- **ID / spinach / national** — N[60, 80] P[30, 45] K[30, 45] (existing: {'ranges': {'n': '60-80', 'p2o5': '30-45', 'k2o': '30-45'}}, status=verified, src=vegdose)
- **ID / tomato / Kalimantan** — N[90, 120] P[80, 110] K[80, 100] (existing: {'ranges': {'n': '90-120', 'p2o5': '80-110', 'k2o': '80-100'}}, status=verified, src=vegdose)
- **KR / chili / Gangwon** — N[160, 190] P[80, 100] K[120, 150] (existing: {'ranges': {'n': '160-190', 'p2o5': '80-100', 'k2o': '120-150'}}, status=verified, src=vegdose)
- **KR / potato / national** — N[90, 120] P[80, 100] K[100, 130] (existing: {'ranges': {'n': '90-120', 'p2o5': '80-100', 'k2o': '100-130'}}, status=verified, src=vegdose)
- **MY / okra / Peninsular** — N[80, 100] P[50, 65] K[60, 80] (existing: {'ranges': {'n': '80-100', 'p2o5': '50-65', 'k2o': '60-80'}}, status=verified, src=vegdose)
- **PL / garlic / national** — N[100, 130] P[60, 80] K[90, 130] (existing: {'ranges': {'n': '100-130', 'p2o5': '60-80', 'k2o': '90-130'}}, status=verified, src=vegdose)
- **US / brinjal / Corn Belt** — N[135, 180] P[80, 120] K[110, 180] (existing: {'ranges': {'n': '135-180', 'p2o5': '80-120', 'k2o': '110-180'}}, status=verified, src=vegdose)
- **US / cabbage / Corn Belt** — N[140, 190] P[80, 120] K[110, 170] (existing: {'ranges': {'n': '140-190', 'p2o5': '80-120', 'k2o': '110-170'}}, status=verified, src=vegdose)
- **US / cabbage / Southeast** — N[160, 210] P[80, 110] K[110, 160] (existing: {'ranges': {'n': '160-210', 'p2o5': '80-110', 'k2o': '110-160'}}, status=verified, src=vegdose)
- **US / carrot / Corn Belt** — N[90, 135] P[60, 110] K[130, 180] (existing: {'ranges': {'n': '90-135', 'p2o5': '60-110', 'k2o': '130-180'}}, status=verified, src=vegdose)
- **US / cauliflower / Corn Belt** — N[160, 210] P[90, 135] K[130, 190] (existing: {'ranges': {'n': '160-210', 'p2o5': '90-135', 'k2o': '130-190'}}, status=verified, src=vegdose)
- **US / chili / Corn Belt** — N[120, 160] P[70, 110] K[110, 160] (existing: {'ranges': {'n': '120-160', 'p2o5': '70-110', 'k2o': '110-160'}}, status=verified, src=vegdose)
- **US / garlic / Corn Belt** — N[110, 150] P[70, 100] K[90, 135] (existing: {'ranges': {'n': '110-150', 'p2o5': '70-100', 'k2o': '90-135'}}, status=verified, src=vegdose)
- **US / okra / Corn Belt** — N[90, 110] P[60, 90] K[90, 130] (existing: {'ranges': {'n': '90-110', 'p2o5': '60-90', 'k2o': '90-130'}}, status=verified, src=vegdose)
- **US / onion / Corn Belt** — N[110, 150] P[80, 110] K[110, 150] (existing: {'ranges': {'n': '110-150', 'p2o5': '80-110', 'k2o': '110-150'}}, status=verified, src=vegdose)
- **US / peas / Corn Belt** — N[25, 45] P[55, 80] K[55, 80] (existing: {'ranges': {'n': '25-45', 'p2o5': '55-80', 'k2o': '55-80'}}, status=verified, src=vegdose)
- **US / potato / Corn Belt** — N[170, 225] P[110, 170] K[170, 250] (existing: {'ranges': {'n': '170-225', 'p2o5': '110-170', 'k2o': '170-250'}}, status=verified, src=vegdose)
- **US / radish / Corn Belt** — N[45, 70] P[40, 60] K[45, 70] (existing: {'ranges': {'n': '45-70', 'p2o5': '40-60', 'k2o': '45-70'}}, status=verified, src=vegdose)
- **US / spinach / Corn Belt** — N[90, 135] P[60, 90] K[90, 135] (existing: {'ranges': {'n': '90-135', 'p2o5': '60-90', 'k2o': '90-135'}}, status=verified, src=vegdose)
- **US / tomato / Corn Belt** — N[135, 190] P[90, 135] K[170, 240] (existing: {'ranges': {'n': '135-190', 'p2o5': '90-135', 'k2o': '170-240'}}, status=verified, src=vegdose)

## 4. DUPLICATES — different values (91)

Ahmed's values DIFFER from existing. Import would UPDATE these records.
Parent: confirm with Ahmed before overwriting 'verified' records.

- **AU / garlic / New South Wales**
  - Ahmed:    N[110, 145] P[60, 85] K[100, 140]
  - Existing: {'p2o5': 103.1} (status=verified, src=vegdose)
- **BD / brinjal / national**
  - Ahmed:    N[140, 175] P[60, 80] K[120, 160]
  - Existing: {'ranges': {'n': '100-120', 'p2o5': '45-60', 'k2o': '50-65'}} (status=verified, src=vegdose)
- **BD / okra / national**
  - Ahmed:    N[60, 80] P[40, 55] K[70, 100]
  - Existing: {'ranges': {'n': '80-100', 'p2o5': '40-50', 'k2o': '50-60'}} (status=verified, src=vegdose)
- **BD / onion / national**
  - Ahmed:    N[100, 130] P[80, 110] K[80, 110]
  - Existing: {'ranges': {'n': '80-100', 'p2o5': '50-65', 'k2o': '70-85'}} (status=verified, src=vegdose)
- **BD / peas / national**
  - Ahmed:    N[15, 25] P[35, 45] K[25, 35]
  - Existing: {'ranges': {'n': '25-35', 'p2o5': '50-60', 'k2o': '35-45'}} (status=verified, src=vegdose)
- **BD / potato / national**
  - Ahmed:    N[120, 150] P[60, 80] K[120, 160]
  - Existing: {'ranges': {'n': '135-165', 'p2o5': '65-85', 'k2o': '135-165'}} (status=verified, src=vegdose)
- **BD / tomato / national**
  - Ahmed:    N[90, 120] P[60, 80] K[70, 100]
  - Existing: {'ranges': {'n': '100-125', 'p2o5': '55-75', 'k2o': '60-80'}} (status=verified, src=vegdose)
- **BR / brinjal / Southeast**
  - Ahmed:    N[100, 140] P[80, 140] K[90, 140]
  - Existing: {'ranges': {'n': '120-160', 'p2o5': '100-150', 'k2o': '100-150'}} (status=verified, src=vegdose)
- **BR / cabbage / Southeast**
  - Ahmed:    N[120, 160] P[100, 200] K[100, 160]
  - Existing: {'ranges': {'n': '130-170', 'p2o5': '100-150', 'k2o': '90-130'}} (status=verified, src=vegdose)
- **BR / carrot / Southeast**
  - Ahmed:    N[90, 130] P[100, 180] K[120, 180]
  - Existing: {'ranges': {'n': '90-120', 'p2o5': '120-180', 'k2o': '110-160'}} (status=verified, src=vegdose)
- **BR / cauliflower / Southeast**
  - Ahmed:    N[140, 180] P[120, 200] K[120, 180]
  - Existing: {'ranges': {'n': '150-200', 'p2o5': '120-180', 'k2o': '100-150'}} (status=verified, src=vegdose)
- **BR / chili / Southeast**
  - Ahmed:    N[110, 150] P[80, 160] K[100, 160]
  - Existing: {'ranges': {'n': '130-180', 'p2o5': '120-180', 'k2o': '120-180'}} (status=verified, src=vegdose)
- **BR / garlic / Southeast**
  - Ahmed:    N[80, 120] P[80, 150] K[60, 100]
  - Existing: {'ranges': {'n': '120-160', 'p2o5': '140-200', 'k2o': '120-170'}} (status=verified, src=vegdose)
- **BR / okra / Southeast**
  - Ahmed:    N[80, 110] P[60, 120] K[80, 120]
  - Existing: {'ranges': {'n': '80-110', 'p2o5': '60-90', 'k2o': '60-90'}} (status=verified, src=vegdose)
- **BR / onion / Southeast**
  - Ahmed:    N[100, 130] P[100, 180] K[90, 140]
  - Existing: {'ranges': {'n': '100-140', 'p2o5': '100-160', 'k2o': '100-150'}} (status=verified, src=vegdose)
- **BR / potato / Southeast**
  - Ahmed:    N[140, 190] P[150, 250] K[140, 220]
  - Existing: {'ranges': {'n': '140-180', 'p2o5': '150-240', 'k2o': '140-220'}} (status=verified, src=vegdose)
- **BR / spinach / Southeast**
  - Ahmed:    N[80, 110] P[40, 70] K[60, 100]
  - Existing: {'ranges': {'n': '80-110', 'p2o5': '50-80', 'k2o': '50-80'}} (status=verified, src=vegdose)
- **BR / tomato / Southeast**
  - Ahmed:    N[180, 250] P[150, 300] K[180, 300]
  - Existing: {'ranges': {'n': '160-220', 'p2o5': '150-250', 'k2o': '160-240'}} (status=verified, src=vegdose)
- **CN / carrot / South China**
  - Ahmed:    N[120, 160] P[60, 80] K[150, 210]
  - Existing: {'ranges': {'n': '100-130', 'p2o5': '50-75', 'k2o': '120-170'}} (status=verified, src=vegdose)
- **CN / chili / Yangtze River Basin**
  - Ahmed:    N[140, 180] P[60, 90] K[120, 160]
  - Existing: {'ranges': {'n': '150-250', 'p2o5': '70-100', 'k2o': '130-180'}} (status=verified, src=vegdose)
- **CN / garlic / North China Plain**
  - Ahmed:    N[150, 200] P[70, 100] K[120, 160]
  - Existing: {'ranges': {'n': '160-200', 'p2o5': '70-90', 'k2o': '110-150'}} (status=verified, src=vegdose)
- **CN / spinach / Northeast**
  - Ahmed:    N[70, 90] P[35, 50] K[35, 50]
  - Existing: {'ranges': {'n': '80-110', 'p2o5': '40-55', 'k2o': '50-75'}} (status=verified, src=vegdose)
- **CN / tomato / Yangtze Basin**
  - Ahmed:    N[180, 230] P[80, 120] K[180, 260]
  - Existing: {'ranges': {'n': '170-280', 'p2o5': '75-110', 'k2o': '180-260'}} (status=verified, src=vegdose)
- **DE / cabbage / national**
  - Ahmed:    N[160, 210] P[60, 85] K[130, 180]
  - Existing: {'ranges': {'n': '180-230', 'p2o5': '60-85', 'k2o': '130-190'}} (status=verified, src=vegdose)
- **DE / carrot / national**
  - Ahmed:    N[90, 130] P[50, 75] K[140, 200]
  - Existing: {'ranges': {'n': '110-140', 'p2o5': '50-75', 'k2o': '140-210'}} (status=verified, src=vegdose)
- **DE / cauliflower / national**
  - Ahmed:    N[180, 240] P[70, 95] K[140, 200]
  - Existing: {'ranges': {'n': '190-240', 'p2o5': '60-90', 'k2o': '140-200'}} (status=verified, src=vegdose)
- **DE / garlic / national**
  - Ahmed:    N[90, 120] P[50, 70] K[80, 120]
  - Existing: {'ranges': {'n': '100-130', 'p2o5': '60-80', 'k2o': '90-130'}} (status=verified, src=vegdose)
- **DE / onion / national**
  - Ahmed:    N[110, 140] P[50, 75] K[120, 160]
  - Existing: {'ranges': {'n': '110-145', 'p2o5': '50-75', 'k2o': '110-150'}} (status=verified, src=vegdose)
- **DE / potato / national**
  - Ahmed:    N[140, 180] P[65, 90] K[180, 260]
  - Existing: {'ranges': {'n': '120-160', 'p2o5': '70-100', 'k2o': '180-250'}} (status=verified, src=vegdose)
- **DE / radish / national**
  - Ahmed:    N[60, 90] P[35, 55] K[50, 80]
  - Existing: {'ranges': {'n': '50-70', 'p2o5': '30-50', 'k2o': '50-75'}} (status=verified, src=vegdose)
- **DE / spinach / national**
  - Ahmed:    N[100, 140] P[45, 65] K[80, 120]
  - Existing: {'ranges': {'n': '90-130', 'p2o5': '40-65', 'k2o': '70-110'}} (status=verified, src=vegdose)
- **ES / brinjal / national**
  - Ahmed:    N[140, 190] P[60, 90] K[140, 200]
  - Existing: {'ranges': {'n': '150-200', 'p2o5': '70-100', 'k2o': '150-220'}} (status=verified, src=vegdose)
- **ES / cabbage / national**
  - Ahmed:    N[140, 190] P[60, 85] K[120, 170]
  - Existing: {'ranges': {'n': '140-180', 'p2o5': '50-80', 'k2o': '100-140'}} (status=verified, src=vegdose)
- **ES / carrot / national**
  - Ahmed:    N[100, 140] P[50, 75] K[150, 220]
  - Existing: {'ranges': {'n': '110-150', 'p2o5': '60-90', 'k2o': '140-200'}} (status=verified, src=vegdose)
- **ES / cauliflower / national**
  - Ahmed:    N[150, 200] P[60, 90] K[130, 180]
  - Existing: {'ranges': {'n': '160-210', 'p2o5': '60-90', 'k2o': '120-170'}} (status=verified, src=vegdose)
- **ES / chili / national**
  - Ahmed:    N[160, 220] P[70, 100] K[160, 230]
  - Existing: {'ranges': {'n': '160-220', 'p2o5': '70-110', 'k2o': '160-240'}} (status=verified, src=vegdose)
- **ES / onion / national**
  - Ahmed:    N[120, 160] P[60, 80] K[110, 160]
  - Existing: {'ranges': {'n': '120-160', 'p2o5': '60-90', 'k2o': '110-160'}} (status=verified, src=vegdose)
- **ES / peas / national**
  - Ahmed:    N[25, 40] P[45, 65] K[50, 70]
  - Existing: {'ranges': {'n': '30-45', 'p2o5': '50-75', 'k2o': '50-70'}} (status=verified, src=vegdose)
- **ES / potato / national**
  - Ahmed:    N[160, 220] P[90, 140] K[200, 280]
  - Existing: {'ranges': {'n': '150-200', 'p2o5': '80-110', 'k2o': '170-240'}} (status=verified, src=vegdose)
- **ES / radish / national**
  - Ahmed:    N[50, 75] P[35, 50] K[45, 70]
  - Existing: {'ranges': {'n': '40-60', 'p2o5': '30-50', 'k2o': '40-60'}} (status=verified, src=vegdose)
- **ES / spinach / national**
  - Ahmed:    N[80, 120] P[40, 60] K[80, 120]
  - Existing: {'ranges': {'n': '80-120', 'p2o5': '40-60', 'k2o': '60-90'}} (status=verified, src=vegdose)
- **ES / tomato / national**
  - Ahmed:    N[180, 240] P[80, 120] K[180, 270]
  - Existing: {'ranges': {'n': '180-250', 'p2o5': '80-120', 'k2o': '200-300'}} (status=verified, src=vegdose)
- **FR / brinjal / national**
  - Ahmed:    N[130, 170] P[60, 90] K[140, 200]
  - Existing: {'ranges': {'n': '150-240', 'p2o5': '65-90', 'k2o': '150-220'}} (status=verified, src=vegdose)
- **FR / carrot / national**
  - Ahmed:    N[90, 130] P[55, 80] K[140, 200]
  - Existing: {'ranges': {'n': '100-135', 'p2o5': '50-75', 'k2o': '130-190'}} (status=verified, src=vegdose)
- **FR / cauliflower / national**
  - Ahmed:    N[170, 230] P[65, 95] K[140, 200]
  - Existing: {'ranges': {'n': '180-230', 'p2o5': '60-90', 'k2o': '130-180'}} (status=verified, src=vegdose)
- **FR / chili / national**
  - Ahmed:    N[130, 170] P[60, 90] K[150, 210]
  - Existing: {'ranges': {'n': '140-230', 'p2o5': '65-90', 'k2o': '150-220'}} (status=verified, src=vegdose)
- **FR / onion / national**
  - Ahmed:    N[110, 150] P[55, 80] K[110, 160]
  - Existing: {'ranges': {'n': '110-150', 'p2o5': '50-75', 'k2o': '100-140'}} (status=verified, src=vegdose)
- **FR / peas / national**
  - Ahmed:    N[25, 40] P[45, 65] K[50, 75]
  - Existing: {'ranges': {'n': '20-35', 'p2o5': '50-70', 'k2o': '60-80'}} (status=verified, src=vegdose)
- **FR / potato / national**
  - Ahmed:    N[140, 190] P[70, 110] K[160, 240]
  - Existing: {'ranges': {'n': '130-180', 'p2o5': '80-120', 'k2o': '180-260'}} (status=verified, src=vegdose)
- **FR / radish / national**
  - Ahmed:    N[40, 65] P[30, 45] K[40, 65]
  - Existing: {'ranges': {'n': '40-65', 'p2o5': '30-45', 'k2o': '50-70'}} (status=verified, src=vegdose)
- **FR / spinach / national**
  - Ahmed:    N[90, 130] P[45, 65] K[80, 120]
  - Existing: {'ranges': {'n': '90-120', 'p2o5': '40-60', 'k2o': '70-100'}} (status=verified, src=vegdose)
- **FR / tomato / national**
  - Ahmed:    N[150, 200] P[70, 100] K[160, 240]
  - Existing: {'ranges': {'n': '160-270', 'p2o5': '70-100', 'k2o': '180-260'}} (status=verified, src=vegdose)
- **ID / cauliflower / national**
  - Ahmed:    N[110, 140] P[60, 80] K[60, 85]
  - Existing: {'ranges': {'n': '120-150', 'p2o5': '75-90', 'k2o': '75-100'}} (status=verified, src=vegdose)
- **ID / shallot / national**
  - Ahmed:    N[90, 120] P[50, 70] K[60, 85]
  - Existing: {'ranges': {'n': '90-110', 'p2o5': '50-70', 'k2o': '60-80'}} (status=verified, src=vegdose)
- **IN / brinjal / national**
  - Ahmed:    N[120, 150] P[60, 80] K[60, 80]
  - Existing: {'ranges': {'n': '120-150', 'p2o5': '60-75', 'k2o': '60-80'}} (status=verified, src=vegdose)
- **IN / cabbage / Tamil Nadu**
  - Ahmed:    N[100, 130] P[100, 125] K[40, 60]
  - Existing: {'n': 135, 'p2o5': 135, 'k2o': 135} (status=verified, src=vegdose)
- **IN / cauliflower / Tamil Nadu**
  - Ahmed:    N[100, 130] P[80, 100] K[50, 75]
  - Existing: {'n': 135, 'p2o5': 135, 'k2o': 135} (status=verified, src=vegdose)
- **IN / chili / Punjab**
  - Ahmed:    N[100, 135] P[45, 60] K[40, 60]
  - Existing: {'ranges': {'n': '90-110', 'p2o5': '50-65', 'k2o': '50-65'}} (status=verified, src=vegdose)
- **IN / chili / Tamil Nadu**
  - Ahmed:    N[100, 125] P[60, 80] K[60, 80]
  - Existing: {'n': 60, 'p2o5': 60, 'k2o': 30} (status=verified, src=vegdose)
- **IN / okra / Tamil Nadu**
  - Ahmed:    N[60, 80] P[40, 60] K[30, 45]
  - Existing: {'ranges': {'n': '100-130', 'p2o5': '50-60', 'k2o': '50-60'}} (status=verified, src=vegdose)
- **IN / onion / Tamil Nadu**
  - Ahmed:    N[80, 110] P[100, 140] K[60, 85]
  - Existing: {'n': 150, 'p2o5': 60, 'k2o': 108} (status=verified, src=vegdose)
- **IT / chili / Emilia-Romagna**
  - Ahmed:    N[140, 170] P[65, 85] K[180, 240]
  - Existing: {'ranges': {'n': '140-190', 'p2o5': '60-90', 'k2o': '140-210'}} (status=verified, src=vegdose)
- **JP / cabbage / Chubu**
  - Ahmed:    N[180, 220] P[150, 200] K[180, 220]
  - Existing: {'ranges': {'n': '180-230', 'p2o5': '120-170', 'k2o': '140-190'}} (status=verified, src=vegdose)
- **JP / cabbage / Tohoku**
  - Ahmed:    N[200, 245] P[220, 280] K[170, 210]
  - Existing: {'ranges': {'n': '180-230', 'p2o5': '120-170', 'k2o': '140-190'}} (status=verified, src=vegdose)
- **JP / chili / Tohoku**
  - Ahmed:    N[240, 300] P[250, 320] K[220, 280]
  - Existing: {'ranges': {'n': '220-280', 'p2o5': '130-180', 'k2o': '180-240'}} (status=verified, src=vegdose)
- **MY / okra / Sabah**
  - Ahmed:    N[100, 120] P[60, 80] K[80, 100]
  - Existing: {'ranges': {'n': '80-100', 'p2o5': '50-65', 'k2o': '60-80'}} (status=verified, src=vegdose)
- **PL / brinjal / national**
  - Ahmed:    N[140, 180] P[70, 100] K[140, 200]
  - Existing: {'ranges': {'n': '150-190', 'p2o5': '60-85', 'k2o': '140-200'}} (status=verified, src=vegdose)
- **PL / cabbage / national**
  - Ahmed:    N[180, 240] P[60, 90] K[160, 220]
  - Existing: {'ranges': {'n': '160-220', 'p2o5': '60-85', 'k2o': '120-180'}} (status=verified, src=vegdose)
- **PL / carrot / national**
  - Ahmed:    N[90, 130] P[50, 80] K[140, 200]
  - Existing: {'ranges': {'n': '90-130', 'p2o5': '50-75', 'k2o': '130-190'}} (status=verified, src=vegdose)
- **PL / cauliflower / national**
  - Ahmed:    N[180, 240] P[70, 100] K[160, 220]
  - Existing: {'ranges': {'n': '160-210', 'p2o5': '60-90', 'k2o': '130-180'}} (status=verified, src=vegdose)
- **PL / chili / national**
  - Ahmed:    N[130, 170] P[60, 90] K[140, 200]
  - Existing: {'ranges': {'n': '150-200', 'p2o5': '70-95', 'k2o': '150-220'}} (status=verified, src=vegdose)
- **PL / onion / national**
  - Ahmed:    N[120, 160] P[60, 85] K[120, 180]
  - Existing: {'ranges': {'n': '110-145', 'p2o5': '50-75', 'k2o': '110-150'}} (status=verified, src=vegdose)
- **PL / peas / national**
  - Ahmed:    N[30, 45] P[50, 70] K[60, 80]
  - Existing: {'ranges': {'n': '20-35', 'p2o5': '50-70', 'k2o': '60-85'}} (status=verified, src=vegdose)
- **PL / potato / national**
  - Ahmed:    N[120, 160] P[60, 90] K[140, 200]
  - Existing: {'ranges': {'n': '110-150', 'p2o5': '60-90', 'k2o': '140-220'}} (status=verified, src=vegdose)
- **PL / radish / national**
  - Ahmed:    N[50, 80] P[40, 60] K[60, 90]
  - Existing: {'ranges': {'n': '40-60', 'p2o5': '30-45', 'k2o': '45-65'}} (status=verified, src=vegdose)
- **PL / spinach / national**
  - Ahmed:    N[80, 120] P[45, 65] K[80, 120]
  - Existing: {'ranges': {'n': '80-110', 'p2o5': '40-60', 'k2o': '70-100'}} (status=verified, src=vegdose)
- **PL / tomato / national**
  - Ahmed:    N[140, 180] P[70, 100] K[180, 240]
  - Existing: {'ranges': {'n': '150-260', 'p2o5': '70-95', 'k2o': '160-240'}} (status=verified, src=vegdose)
- **TR / potato / Thrace**
  - Ahmed:    N[160, 200] P[80, 110] K[180, 240]
  - Existing: {'ranges': {'n': '150-200', 'p2o5': '80-110', 'k2o': '160-220'}} (status=verified, src=vegdose)
- **US / brinjal / Southeast**
  - Ahmed:    N[170, 220] P[90, 120] K[130, 180]
  - Existing: {'ranges': {'n': '140-180', 'p2o5': '80-110', 'k2o': '120-170'}} (status=verified, src=vegdose)
- **US / cabbage-chinese / Southeast**
  - Ahmed:    N[140, 180] P[80, 110] K[110, 150]
  - Existing: {'ranges': {'n': '135-170', 'p2o5': '70-90', 'k2o': '110-150'}} (status=verified, src=vegdose)
- **US / carrot / Southeast**
  - Ahmed:    N[120, 160] P[80, 110] K[140, 200]
  - Existing: {'ranges': {'n': '110-160', 'p2o5': '70-90', 'k2o': '140-200'}} (status=verified, src=vegdose)
- **US / cauliflower / Southeast**
  - Ahmed:    N[170, 220] P[90, 120] K[130, 180]
  - Existing: {'ranges': {'n': '170-225', 'p2o5': '90-135', 'k2o': '135-190'}} (status=verified, src=vegdose)
- **US / chili / Southeast**
  - Ahmed:    N[170, 220] P[90, 120] K[130, 180]
  - Existing: {'ranges': {'n': '160-220', 'p2o5': '80-120', 'k2o': '140-200'}} (status=verified, src=vegdose)
- **US / okra / Southeast**
  - Ahmed:    N[110, 140] P[80, 110] K[90, 130]
  - Existing: {'ranges': {'n': '110-140', 'p2o5': '70-90', 'k2o': '90-120'}} (status=verified, src=vegdose)
- **US / onion / Southeast**
  - Ahmed:    N[140, 180] P[80, 120] K[110, 160]
  - Existing: {'ranges': {'n': '140-180', 'p2o5': '90-135', 'k2o': '110-160'}} (status=verified, src=vegdose)
- **US / potato / Pacific Northwest**
  - Ahmed:    N[220, 270] P[120, 180] K[220, 320]
  - Existing: {'ranges': {'n': '200-270', 'p2o5': '135-200', 'k2o': '200-290'}} (status=verified, src=vegdose)
- **US / potato / Southeast**
  - Ahmed:    N[170, 225] P[90, 150] K[150, 220]
  - Existing: {'ranges': {'n': '170-225', 'p2o5': '110-170', 'k2o': '170-250'}} (status=verified, src=vegdose)
- **US / radish / Southeast**
  - Ahmed:    N[50, 75] P[45, 65] K[45, 65]
  - Existing: {'ranges': {'n': '50-70', 'p2o5': '40-60', 'k2o': '50-75'}} (status=verified, src=vegdose)
- **US / spinach / Southeast**
  - Ahmed:    N[90, 130] P[60, 90] K[80, 120]
  - Existing: {'ranges': {'n': '100-135', 'p2o5': '70-90', 'k2o': '90-130'}} (status=verified, src=vegdose)
- **US / tomato / Southeast**
  - Ahmed:    N[190, 240] P[100, 140] K[170, 240]
  - Existing: {'ranges': {'n': '170-240', 'p2o5': '90-135', 'k2o': '180-270'}} (status=verified, src=vegdose)
- **US / tomato / Southern Plains**
  - Ahmed:    N[135, 180] P[90, 135] K[90, 150]
  - Existing: {'ranges': {'n': '135-180', 'p2o5': '90-135', 'k2o': '135-200'}} (status=verified, src=vegdose)

## 5. Ambiguous crops — NEEDS DECISION (do not guess)

| # | Ahmed label | Mapped to | Issue |
|---|---|---|---|
| 1 | Onion / Shallot (Bawang Merah) — ID | `shallot` | 'Bawang Merah' = red shallot in Indonesian, but label says 'Onion / Shallot'. DB has both `onion` and `shallot` as separate crops. |
| 2 | Beans (Feijão) — BR | `beans` | DB has both `bean` and `beans`. Feijão = common bean; mapped to `beans` but confirm. |
| 3 | Peas (Cowpea) — US Southeast | `cowpea` | Mapped to `cowpea` (DB has separate `cowpea`); confirm this is intended vs `peas`. |

## 6. Region notes

- Records with multi-region labels (e.g. 'Thrace & All Regions', 'Aragon & All Regions',
  'Chubu (Niigata) & Tohoku', 'Xinjiang & North China Plain') were treated as **national (null)**
  with a `_note` in import-data.json. If Ahmed wants them split per-region, that needs his call.
- 18 records reference regions with no existing slug (Southeast Anatolia, Andalucía, Bayern,
  Niedersachsen & Bayern, Chungcheong, Gyeongsang, Kanto, Yangtze & Southwest, Georgia,
  Texas, Great Plains, KPK). These need new Region rows or null-mapping before import.

## 7. Files produced

- `prisma/data/import-2026-10-15/import-data.json` — 197 parsed records (with `_note`/`_region_flag` on ambiguous ones)
- `prisma/data/import-2026-10-15/dedup-raw.json` — machine-readable dedup results
- `prisma/data/import-2026-10-15/dedup-analysis.json` — counts
- `prisma/data/import-2026-10-15/parse_part1.py` … `parse_part4.py` — parse scripts (auditable)

## 8. Recommended next steps (for parent agent)

1. **Live-DB check**: query production DB for these 197 (country, crop, region) combos to get
   real verificationStatus — the seed proxy may be stale.
2. **Ahmed decisions needed**: ambiguous crops (§5), multi-region records (§6), and whether to
   overwrite the 91 'different values' verified records.
3. **Region creation**: 18 new-region records need Region rows (or explicit null-mapping).
4. Only then proceed to Phase 2 (import).