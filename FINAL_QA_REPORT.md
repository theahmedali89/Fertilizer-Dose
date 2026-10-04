# Final QA Report — Fertilizer Dose V2 Expansion

**Date:** 2026-10-04
**Scope:** Phases 1–7 of the Fertilizer Dose frontend expansion
**Code:** `~/workspace/khaadguide/khaadguide-v2/`
**Package:** `~/workspace/khaadguide/fertilizer-dose-v2.zip`

This report is honest about what was verified, what was checked statically, and what could not be verified in this environment.

---

## 1. Brand & identity — ✅ PASS

- All user-facing content uses **Fertilizer Dose**. No KhaadGuide/Khad Guide branding remains in the UI.
- Brand centralized in `src/config/site.ts`.
- Internal folder/package name `khaadguide-v2` unchanged (not user-facing) — intentional.
- **Open item:** production domain currently assumed as `fertilizerdose.com` and contact `hello@fertilizerdose.com`. Confirm before deployment.

## 2. Internationalization — ✅ ARCHITECTURE PASS, TRANSLATIONS INCOMPLETE

- 18 locale codes, English unprefixed, others prefixed (`/hi/…`, `/ar/…`).
- Desktop dropdown + mobile language list, equivalent-page switching, `NEXT_LOCALE` cookie, correct `<html lang>`, Arabic `dir="rtl"`, localized canonicals + hreflang incl. `x-default`, locale-aware internal links.
- **Only the English dictionary is substantially translated** — the other 17 are scaffolds falling back to English. This was true from Phase 1 and is unchanged.
- **Fixed in Phase 6:** non-English locales now serve `noindex, follow` until real translations land (verified: `/hi` → noindex, `/` → index). This prevents mass duplicate content at launch.
- Full professional translations remain required before lifting the gate.

## 3. Crops / Plants / Vegetables libraries — ✅ PASS

- Unified `GrowingItem` architecture; shared card/index/detail templates.
- Routes: `/crops`, `/plants`, `/vegetables` + `[slug]` details, all rendering 200.
- Search (name/scientific/Urdu), verified/in-review filters, plant-subcategory filters, related items, calculator/Plant Doctor CTAs.
- Seed content: 6 full crops + 2 identity-only crops + 10 vegetables + 5 plants, all identity-only entries honestly marked.
- Thin pages (`indexable: false`) render `noindex, follow` and are excluded from the sitemap — verified for `/crops/soybean` and `/vegetables/tomato`.

## 4. Planting Calendar — ✅ PASS

- `/planting-calendar` hub + `/planting-calendar/pakistan` + `/planting-calendar/india`, all 200 with correct titles/canonicals.
- Country → region → month → category controls; prev/current/next month + 12 localized month pills; result cards with sowing window, harvest window, season, region, source, last-reviewed, verification badge.
- 17 sowing windows seeded **only** from the crop library's published season lines; every window carries source + in-review status. Regions/months without data show an honest empty state — no guessed calendars.
- No month×region×locale URL spam: filtering is client state.

## 5. My Garden — ✅ PASS (frontend phase)

- `/my-garden` dashboard (200, canonical) + `/my-garden/plots/[id]` (200, `noindex, nofollow`, excluded from sitemap).
- Plots (name/location/region/area+unit/soil/notes), plantings (item/date/stage/notes), user reminders with overdue flags, saved dose calculations, seasonal sowing suggestions from verified windows only.
- Persistence is **localStorage**, honestly labeled "Saved privately in this browser". Types map 1:1 to future Prisma models.
- "Save to My Garden" wired into the dose calculator results.
- No invented stage timing or predicted harvest dates — only days-since-planting and verified windows.

## 6. Profit Calculator — ✅ PASS

- `/profit-calculator` (200). All inputs user-entered; the module ships zero market prices/yields/costs.
- Outputs: net profit, per-acre/per-hectare profit, cost per yield unit, break-even yield, break-even price, ROI, transparent formula panel.
- Save-scenario / print (dedicated print stylesheet) / reset architecture.
- **Math verified:** engine unit-tested against a hand calculation (5 ac × 40 md × Rs 3,000 − Rs 100,000 → profit Rs 500,000, break-even 33.3 md / Rs 500, ROI 500%) — exact match.

## 7. Compare tool — ✅ PASS

- `/compare` (200). Fertilizer tab: 2–6 fertilizers, user-entered price per bag + bag size → price per kg of N / P₂O₅ / K₂O from label-accurate NPK, cheapest-per-nutrient highlighted.
- Crop tab: up to 3 crops side by side — verified NPK dose or honest "under review", season, water, soil, verification badges, guide links.
- No market prices are assumed anywhere.

## 8. Navigation & IA — ✅ PASS

- Desktop: Home | Grow ▾ (Crops, Plants, Vegetables, Planting Calendar, My Garden) | Tools ▾ (Dose Calculator, Profit Calculator, Compare) | Plant Doctor | Fertilizers | Blog | FAQ — active-state aware, hover + click + Escape.
- Mobile drawer: Home, Tools group, Grow group, remaining links, language list, CTA.
- Footer: Tools/Library/Company columns updated; every new route reachable within ≤2 clicks.

## 9. Homepage — ✅ PASS

- New sections: "What to grow this month" teaser, 6-card tools grid (Profit + Compare added), Grow library section.
- Title redundancy fixed: was `Fertilizer Dose — Exact Fertilizer Dose Calculator for Wheat, Rice & More · Fertilizer Dose`; now `NPK Fertilizer Dose Calculator — Per Acre, Kanal, Marla & Hectare · Fertilizer Dose`.
- FAQPage JSON-LD on the homepage FAQ section.

## 10. Dose Calculator (existing) — ✅ PASS, UNCHANGED BEHAVIOR

- Reference test re-run: wheat, 5 acres → DAP 263.9 kg, Urea 424.6 kg, MOP 134.9 kg — **exact match** with the pre-expansion baseline.
- Only change: "Save to My Garden" button added to results; calculation engine untouched.

## 11. Plant Doctor (existing) — ✅ PASS, UNCHANGED

- Upload/validation UI intact; AI still stubbed pending `GEMINI_API_KEY` (backend phase).

## 12. SEO — ✅ PASS

- `SEO_KEYWORD_AUDIT.md` delivered: 22 clusters mapped with intent, target page, status, cannibalization risk, action. Explicit no-duplicate decisions documented.
- 7 pages migrated to full localized canonical + hreflang; missing meta keys added.
- Structured data: Organization + WebSite (layout), FAQPage (`/faq`, homepage), Article (blog posts), BreadcrumbList (detail pages) — all verified in rendered HTML.
- Sitemap: all indexable routes with hreflang alternates; thin and private pages excluded. `robots.txt` serves correctly.
- One H1 per page (spot-checked); no keyword stuffing found.

## 13. Data integrity — ✅ PASS (with standing caveats)

- No fabricated fertilizer recommendations, planting dates, yields, prices, or statistics anywhere in the new work.
- Wheat/rice/maize dose figures still carry broad source labels — **must be verified against named primary publications before production seeding** (standing caveat from Phase 2).
- New growing entries: identity-only, noindex, honest unavailable-data states.
- Agricultural datasets remain separate from UI translation dictionaries.

## 14. Responsive — ✅ STATIC PASS, VISUAL UNVERIFIED

- Breakpoints required: 360 / 390 / 768 / 1024 / 1366 / 1920.
- Static audit: all tables wrapped in `overflow-x-auto`; no fixed pixel widths ≥360px except inside scroll containers; grids collapse to single column on mobile (`sm:`/`lg:`/`md:` prefixes verified in all new components); month pills and filter chips use `flex-wrap`.
- **Limitation:** local Chromium cannot render in this container (GPU/sandbox failure) and the Cloudflare quick tunnel fails TLS through the egress proxy, so pixel-level screenshots at each breakpoint were not possible. No horizontal-overflow risk was found by static analysis, but a real-device pass is recommended before launch.

## 15. RTL & Arabic — ✅ STATIC PASS, PIXEL QA UNVERIFIED

- `/ar/*` renders `dir="rtl"` and `lang="ar"` (verified in HTML).
- New components use logical properties (`start-`/`end-`, `ms-`/`me-`, `ps-`/`pe-`) and `rtl:rotate-180` on directional icons.
- **Fixed in Phase 7:** `Accordion` `text-left` → `text-start`; custom `Select` chevron now flips to the inline-end side under `[dir="rtl"]` (`pr-10` → `pe-10` + CSS override).
- Remaining `text-left`/`text-right` instances are numeric table cells (intentional alignment, harmless in RTL).
- Full pixel-level RTL QA across every page was not possible (same environment limitation as §14).

## 16. Dark mode — ✅ PASS (static)

- `dark:` variants present in every new component (garden, planting, tools, nav dropdown).
- Theme toggle renders and functions (existing next-themes integration, untouched).
- Visual verification not possible (§14 limitation); class-level coverage verified.

## 17. Build / lint / typecheck / routes — ✅ PASS

- `npm run lint`: **0 errors** (1 pre-existing warning — Plant Doctor blob-preview `<img>`).
- `npm run typecheck`: clean.
- `npm run build`: **942 static pages**, no failures.
- Route crawl: 30 URLs checked — all 200 (one 308 is trailing-slash normalization on `/ar/`).

## 18. Backend & Admin — ⏳ NOT BUILT (out of scope, as planned)

- PostgreSQL/Prisma, Auth.js, roles, admin dashboard, Gemini wiring, upload storage: **none built**. This was the agreed phasing — backend follows the frontend expansion.
- My Garden and profit scenarios use localStorage as the honest interim store; types are shaped for direct Prisma mapping.

## 19. Known limitations & recommended next steps — ⚠️ DISCLOSED

1. **Translations:** 17 of 18 locales are English-fallback scaffolds; noindex gate is active — lift per-locale as translations ship.
2. **Source debt:** wheat/rice/maize doses and growing-content seasons need named primary citations before production.
3. **Visual QA:** responsive screenshots, pixel-level RTL, and dark-mode visuals need a real browser/device pass (environment limitation, not a code limitation).
4. **Backend:** Auth.js + Prisma + Admin + Gemini wiring is the next major phase.
5. **Content backlog:** 4 guide intents from the keyword audit (NPK formula, per-acre how-to, boron, organic) → blog-first, then `/guides/*`.
6. **Domain/email:** confirm `fertilizerdose.com` / `hello@fertilizerdose.com` before deployment.
7. **Old app:** no prior KhaadGuide repository or Firebase data was ever found — nothing to merge; if it surfaces, audit before use.

---

**Verdict:** All 7 frontend phases are implemented, tested to the extent this environment allows, and packaged. The two hard limits are visual QA (needs a real browser) and the backend (next phase). Nothing was fabricated; every gap is labeled.
