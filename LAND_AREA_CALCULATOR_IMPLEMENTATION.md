# Land Area Calculator — Implementation Document

**Status:** Phases A–D + F complete (2026-10-07). Phase E (map) deferred — marked PLANNED, no fake map page.
**Route:** `/land-area-calculator` (top-level, per Ahmed's decision — no `/tools/` folder).
**Commit:** local only, not pushed (Ahmed pushes).

## 1. Architecture

**Reused (Phase A audit):**
- Routing/i18n/SEO: `src/app/[locale]/<tool>/page.tsx` + `localizedMetadata` + `setRequestLocale` (same as soil-test/plant-dose calculators)
- Header Tools dropdown: `TOOL_LINKS` in `src/components/layout/Header.tsx`
- Country state: `FD_COUNTRY` / `FD_REGION` cookies (`src/lib/countryCookies.ts`)
- My Garden persistence: `loadGarden` / `saveGarden` / `GardenPlot` (`src/lib/garden.ts`)
- UI kit: `Card`, `Button`, `Field/Input/Select`, `Badge`, `Accordion`, `Section`
- Sitemap: `src/app/sitemap.ts` (hreflang per existing architecture)

**New:**
- `src/lib/landArea.ts` — pure, dependency-free calculation engine (canonical square meters)
- `src/components/landArea/LandAreaForm.tsx` — client form (4 modes + integrations)
- `src/app/[locale]/land-area-calculator/page.tsx` — SEO page (guide, conversion table, FAQ)
- `src/components/tools/RelatedTools.tsx` — shared 6-tool cross-link card (on all six tool pages)
- `scripts/land-area-tests.ts` — 37 automated formula tests (tsc + node)
- `src/messages/en.json` → `landArea` namespace (52 keys, English; other locales fall back)

## 2. Calculation modes & formulas

| Mode | Method |
|---|---|
| Length × Width | A = l × w (mixed length units allowed; normalized to meters first) |
| 4 Sides + diagonal | **Exact**: split into two triangles, Heron's formula each, summed |
| 4 Sides only | **Approximation** `((a+c)/2)×((b+d)/2)` with explicit warning badge — never presented as exact |
| Irregular | Multiple sections (rectangle/square/triangle/triangle/trapezoid), add/remove/rename, totaled |
| Converter | Value + source unit → equivalents in all applicable units |

Triangle validity is enforced (triangle inequality); impossible geometry returns no result with a human-readable error. Precision: max 2 decimals, trimmed — never implying survey-grade accuracy.

## 3. Country system

18 priority countries + International mode. Country and language are independent (local country state; never changes UI locale).

**Units actually verified at launch:**
- **Universal (all countries):** m², km², ft², yd², acre, hectare — exact SI/imperial definitions
- **Pakistan:** Kanal + Marla, Punjab revenue standard (1 karam = 5.5 ft; 1 marla = 9 sq karam = 272.25 sq ft; 1 kanal = 20 marla = 5,445 sq ft = 605 sq yd). UI discloses that housing schemes sometimes use 250/225 sq ft marla.
- **All other 17 countries:** universal units only — honest gap, no invented conversions (e.g. no universal Bigha; India state variations respected by omission)

No DB model was needed (universal constants + 2 verified regional units live in code, per "don't over-engineer").

## 4. Integrations (all working)

- **Fertilizer Dose Calculator:** "Use This Area" → sets FD_COUNTRY/FD_REGION cookies + `/calculator?area=X&unit=Y` (CalculatorForm accepts validated `initialArea`/`initialUnit` props). Area alone never produces fertilizer — crop + verified recommendation still required there.
- **Profit Calculator:** "Estimate Profit" → `/profit-calculator?area=X&unit=Y` (same validated pre-fill). Yield/price/costs never auto-filled.
- **My Garden:** "Save This Plot" → writes a `GardenPlot` via `loadGarden`/`saveGarden` (unit mapped to garden's acre/kanal/marla/hectare set; original sqm recorded in notes).
- **Kitchen Garden:** no Kitchen Gardening page exists in the app — honest fallback: saves the plot and navigates to `/my-garden`.

## 5. Tool interlinking (Ahmed's explicit order)

`RelatedTools` card on all six tool pages, current page marked `aria-current` (not self-linked):
`/calculator`, `/soil-test-calculator`, `/plant-dose-calculator`, `/land-area-calculator` (new), `/profit-calculator`, `/compare`. Also added to the header Tools dropdown.

## 6. SEO + i18n

- Single canonical page; title "Land Area Calculator – Agricultural Land & Field Measurement"; natural keyword coverage (land area calculator, agricultural land, plot area, converter, 4-side, irregular) — no stuffing, no doorway/city pages, no map claims
- 10 genuine FAQs, conversion table, formulas, methodology/sources section
- Sitemap entry with hreflang (all 18 locales); non-English pages follow existing noindex architecture
- Arabic RTL: inherits app-wide handling; English-only strings fall back per architecture

## 7. Tests

- `scripts/land-area-tests.ts`: **37 passed, 0 failed** (rectangle/square/triangle/trapezoid, Heron, quad+diagonal, impossible geometry, conversions incl. kanal↔marla, country unit scoping, section math, validation)
- `npx tsc --noEmit`: clean · `npm run lint`: 0 errors on touched files · `npm run build`: clean
- Smoke (prod server): `/land-area-calculator` 200, `/hi/` 200, `/calculator?area=&unit=` 200, `/profit-calculator?area=&unit=` 200, sitemap contains route, header link present

## 8. Remaining issues / honest limitations

1. **Map (Phase E): not implemented** — by decision. No `/tools/map-area-calculator` page; map keywords unaddressed until Phase 2 (recommend Leaflet + OSM, free).
2. **Regional units thin**: only PK Kanal/Marla verified; 17 other countries universal-only until verified research lands.
3. **Kitchen Gardening page doesn't exist** — "Plan a Kitchen Garden" falls back to My Garden (documented in code + here).
4. **No separate `/land-area-converter` page** — converter is a mode on the main page (avoids thin duplicate per the anti-cannibalization rule).
5. **Translations**: `landArea` namespace is English-only; 17 locales fall back to English until professional review.
6. **No DB migration** — nothing to apply on deploy; purely additive code.
