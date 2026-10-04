# FEATURE EXPANSION — Audit & Implementation Tracker

**Project:** Fertilizer Dose (rebranded from KhaadGuide)
**Date:** 2026-10-04
**Scope rule:** Do NOT rebuild from scratch. Extend the existing frontend.

---

## 0. PRE-IMPLEMENTATION AUDIT (required before modifying)

### What already exists ✅
- Light/dark theme (next-themes, system-aware, persisted) with botanical design tokens
- Responsive header (desktop nav + mobile drawer), footer, logo
- Homepage: hero, crop cards, tools grid, Plant Doctor teaser, fertilizer NPK table, blog preview, why-section, regional section, FAQ accordion, final CTA
- Interactive fertilizer dose calculator (DAP-first NPK math, acre/kanal/marla/hectare, 50 kg bags, step-by-step explanation, stage-wise schedule, soil notes)
- Plant Doctor UI (drag/drop image, validation, server-side stub refusing to fabricate)
- Fertilizer library: 6 fertilizers with label-accurate NPK (`/fertilizers`, `/fertilizers/[slug]`)
- Crop library: 6 crops, wheat/rice/maize verified, others honestly "in review" (`/crops`, `/crops/[slug]`)
- Blog: 3 seed posts (`/blog`, `/blog/[slug]`)
- Dose chart (`/fertilizer-dose-chart`), FAQ, About, Contact, Privacy, Terms, 404
- `robots.ts`, `sitemap.ts`, JSON-LD Organization + WebSite
- `.env.example`, `npm run build` green (33 pages)

### Partially implemented ⚠️
- i18n: **was English-only** (Urdu accents only) → Phase 1 implements 18-locale architecture
- SEO metadata: existed per-page but no hreflang, no localized canonicals → Phase 1 adds
- RTL: no support → Phase 1 adds `dir="rtl"` + logical properties

### Missing ❌ (to be built in Phases 2–6)
- My Garden (`/my-garden`) — plots, plantings, saved calculations, reminders architecture
- Plants & Vegetables libraries (`/plants`, `/vegetables`, `/plants/[slug]`, `/vegetables/[slug]`)
- Planting Calendar (`/planting-calendar`, region/month aware) + SEO landing architecture
- Profit Calculator (`/profit-calculator`) — real math, user inputs only
- Comparison (`/compare`) — fertilizer vs fertilizer, crop vs crop, shareable URLs
- Auth (Auth.js), database (Prisma/PostgreSQL), admin dashboard, CMS
- Global search across calculators/crops/plants/vegetables/fertilizers/guides/blog
- Land unit converter tool, NPK/per-acre/per-hectare/dry/liquid/PPM calculator variants

### Needs renaming ✏️
- Brand **KhaadGuide → Fertilizer Dose** — DONE in Phase 1 via centralized `src/config/site.ts`
  (internal npm package name `khaadguide-v2` intentionally unchanged — technical identifier, not user-facing)

### Needs localization 🌍
- All reusable UI strings → Phase 1 dictionary (`src/messages/en.json` master; 17 scaffolded locales with English fallback)
- Page bodies beyond home/calculator/faq-method → Phase 1 boundary (documented in I18N_IMPLEMENTATION.md)

### Needs SEO improvement 🔍
- Full original-keyword audit → Phase 6 (`SEO_KEYWORD_AUDIT.md`)
- Multilingual SEO (hreflang, localized sitemap/canonicals) → Phase 1 foundation DONE
- Internal linking mesh, structured data per page, route-intent coverage → Phases 2–6

### Missing old-app features 🔎
- No old application was ever supplied (checked 2026-10-04: workspace, memory, web — nothing found).
- The spec references a comparison feature and "My Garden" concept from a previous app.
  If a repo/ZIP/URL is supplied later, audit it before backend expansion and merge only useful concepts.

---

## Feature matrix

| Existing feature | Missing feature | Implementation | Route | Backend dependency | Data dependency | Status |
|---|---|---|---|---|---|---|
| Dose calculator (verified crops) | — | Extend w/ more crops, save-to-garden | `/calculator` | Saved calculations need Auth+DB | Verified NPK per crop | ✅ Live |
| — | NPK / per-acre / per-hectare / dry / liquid / PPM variants | New calculator pages | `/calculator/npk` etc. | None (client math) | None | ❌ Phase 5 |
| Plant Doctor UI | Gemini wiring | Server action + `GEMINI_API_KEY` | `/plant-doctor` | API key, upload storage | None (AI) | ⚠️ UI live, AI stubbed |
| Fertilizer library (6) | More products, comparison attrs | Extend dataset + admin CRUD | `/fertilizers/[slug]` | Admin CMS | Label NPK data | ✅ Live / ❌ admin Phase |
| Crop library (6) | Soybean, groundnut + full profiles | Extend dataset + admin CRUD | `/crops/[slug]` | Admin CMS | Verified NPK + sources | ⚠️ 3 verified, rest in review |
| — | Plants library | New GrowingItem architecture | `/plants`, `/plants/[slug]` | Admin CMS | Verified plant data | ❌ Phase 2 |
| — | Vegetables library | New GrowingItem architecture | `/vegetables`, `/vegetables/[slug]` | Admin CMS | Verified vegetable data | ❌ Phase 2 |
| — | Planting calendar (region+month) | New feature, verified windows only | `/planting-calendar` | Admin CMS, regions | Verified sowing windows + sources | ❌ Phase 3 |
| — | My Garden | Account feature: plots, plantings, saved calcs | `/my-garden` | **Auth + DB required** | User data | ❌ Phase 4 |
| — | Profit calculator | Real math, user inputs, transparent formulas | `/profit-calculator` | Save needs Auth+DB | User inputs only (no fake prices) | ❌ Phase 5 |
| — | Comparison | Fertilizer vs fertilizer, crop vs crop | `/compare` | None (client) | Verified attribute data | ❌ Phase 5 |
| Blog (3 seed posts) | CMS-driven blog | DB + admin | `/blog/[slug]` | Admin CMS | Editorial | ⚠️ Seed content live |
| FAQ / About / Contact / legal | CMS-driven FAQs | DB + admin | `/faq` etc. | Admin CMS | Editorial | ✅ Live |
| Theme, nav, footer, search stub | Global search | Search index/API | site-wide | Search backend or client index | Content index | ❌ Phase 5/6 |
| — | Auth (Auth.js) | Credentials/OAuth, roles | `/login`, `/account`, `/admin` | **DB required** | — | ❌ Backend phase |
| — | Admin dashboard | CRUD: crops, fertilizers, plants, vegetables, calendar, blog, FAQ, SEO, users, settings | `/admin` | **Auth + DB required** | — | ❌ Backend phase |
| SEO basics | Full keyword audit + topical map | Audit doc + implementation | site-wide | CMS for content | Original keyword list | ❌ Phase 6 |

**No-fake-data policy (binding):** unverified fertilizer doses, planting months, durations,
yields, prices, or statistics are NEVER invented. UI shows "No verified data available yet"
or asks the user for their own assumptions.

---

## Phase 1 completion (2026-10-04)

- [x] Centralized brand config (`src/config/site.ts`); all user-facing KhaadGuide → Fertilizer Dose
- [x] 18-locale next-intl architecture (`en` unprefixed, others `/hi/…`, `/ar/…` etc.)
- [x] English master dictionary; 17 scaffolded locales with deep-merge English fallback
- [x] Language switcher: desktop dropdown + mobile drawer list; persists via `NEXT_LOCALE` cookie; preserves current page
- [x] `<html lang dir>` per locale; Arabic `dir="rtl"`; RTL-safe logical properties in touched components
- [x] hreflang + x-default, localized canonicals, localized sitemap with language alternates
- [x] Locale-aware `Link`/navigation (`src/i18n/navigation.ts`); all internal links migrated
- [x] Homepage + calculator + FAQ-method fully translated via dictionaries; header/footer/nav translated
- [x] `I18N_IMPLEMENTATION.md` written
- [x] `npm run lint` — 0 errors (1 pre-existing benign `<img>` warning for blob preview)
- [x] `npm run typecheck` — clean
- [x] `npm run build` — green, 492 static pages (18 locales × routes)
- [ ] Full professional translation of 17 locales (INCOMPLETE — English fallback active)
- [ ] RTL pixel-QA across all pages (structural support verified via HTML; visual screenshots unavailable in this environment)

## Phase 2 completion (2026-10-04) — Growing content

- [x] Unified `GrowingItem` architecture (`src/lib/growing.ts`): crops + plants + vegetables,
      with `SourceRef` (organization/title/url/country/region/dates), `PlantSubcategory`
      (garden/flowering/indoor/outdoor/fruit), `VerificationStatus`, `indexable` flag
- [x] Existing 6 crops migrated (all fields preserved; scientific names added where unambiguous)
- [x] New seeds with identity only (NO invented agronomics): soybean, groundnut (crops);
      tomato, onion, garlic, chili, okra, peas, carrot, spinach, brinjal, cucumber (vegetables);
      rose, marigold, money plant, mango, neem (plants, subcategorized)
- [x] Routes: `/plants`, `/vegetables`, `/plants/[slug]`, `/vegetables/[slug]` (+ `/crops*` migrated to shared template)
- [x] Shared components: `GrowingCard`, `GrowingIndex` (search + verified/in-review + subcategory filters),
      `GrowingDetail` (all spec §6 fields, "No verified data available yet" states, references, last reviewed),
      `GrowingIndexPage` shell
- [x] Thin/in-review pages: `noindex, follow` + excluded from sitemap (verified live)
- [x] Header nav + mobile drawer: Plants, Vegetables added; footer Library extended
- [x] Homepage "Grow" section (Crops/Plants/Vegetables cards with counts)
- [x] Dictionary extended (`nav`, `footer.links`, `growing`, `home.grow` namespaces, English)
- [x] Sitemap: `/plants`, `/vegetables` + indexable detail pages only, with hreflang alternates
- [x] `npm run lint` — 0 errors · `npm run typecheck` — clean · `npm run build` — green, 834 static pages
- [x] Smoke-tested: all new routes 200 (incl. `/hi/vegetables`), noindex verified, sitemap exclusion verified
- [ ] Planting-calendar windows (`sowingMonths`/`harvestPeriod`) — Phase 3, verified data only
- [ ] Admin CRUD for plants/vegetables/seasons — backend phase

---

## Phase 3 — Planting Calendar (2026-10-04)

- Data layer `src/lib/planting.ts`: Region (7 regions across Pakistan/India), PlantingWindow
  (itemSlug, regionId, startMonth/endMonth with year-crossing support, harvestText, notes,
  SourceRef, verificationStatus, lastReviewed). Seeded ONLY from the crop library's published
  seasonDetail lines (wheat, rice, maize, cotton, sugarcane, potato) — nothing invented.
  All seeds marked in_review with editorial source; empty regions render honest empty states.
- Interactive client component `src/components/planting/PlantingCalendar.tsx`: country,
  dependent region, category filters; prev/current/next month navigation + 12 localized month
  pills (Intl.DateTimeFormat month names — no dictionary needed); result cards with sowing
  window, harvest window, season, region, source, last-reviewed, verification badge, and links
  to growing detail pages.
- Routes: `/planting-calendar` hub (indexable) and `/planting-calendar/[country]` landing pages
  for pakistan/india (indexable; region cards with data-availability badges). No month×region×
  locale static spam — month/region selection is client state.
- Navigation restructured per spec §15: desktop "Grow" dropdown (Crops/Plants/Vegetables/
  Planting Calendar, active-state aware, hover+click+Escape), mobile drawer "Grow" group.
- Homepage "What to grow this month" teaser (month strip + CTA). Footer Tools column and
  sitemap extended with the 3 new pages.
- i18n: `calendar` namespace + `home.planting` + nav.grow/plantingCalendar in en master
  (other locales fall back per architecture).
- QA: typecheck clean; lint 0 errors (1 pre-existing warning); build OK (888 static pages);
  smoke: hub/pakistan/india 200, correct titles/canonicals, region badges correct,
  `/ar/planting-calendar` renders dir=rtl, new pages present in sitemap.xml.

---

## Phase 4 — My Garden (2026-10-04)

- Data layer `src/lib/garden.ts`: GardenPlot, Planting, SavedCalculation, GardenReminder types
  shaped 1:1 for future Prisma models; localStorage persistence (versioned key,
  honestly labeled "Saved privately in this browser"); derived helpers —
  daysSince (no invented stage timing), harvestWindowFor (verified windows only),
  seasonalSuggestions (from planting-calendar windows, current month, excluding
  already-planted), upcomingTasks (user reminders, overdue-aware).
- Store `src/hooks/useGarden.ts`: useSyncExternalStore module store, SSR-safe
  (lint-clean, no setState-in-effect), full CRUD for plots/plantings/calculations/
  reminders, cross-tab sync via storage events.
- UI: `GardenForms.tsx` (Modal shell + PlotForm/PlantingForm/ReminderForm),
  `GardenDashboard.tsx` (overview stats, upcoming tasks, seasonal suggestions, plots
  grid, saved calculations), `PlotDetail.tsx` (plot header edit/delete, plantings with
  stage badge/days-since/harvest window, per-planting reminders), `SaveCalcButton.tsx`
  wired into the dose calculator results (saves crop/area/unit/product kg, caps at 50).
- Routes: `/my-garden` (indexable dashboard) and `/my-garden/plots/[id]` (noindex,
  dynamic, user-private — excluded from sitemap).
- Nav: My Garden added to the Grow dropdown + mobile Grow group + footer Tools;
  sitemap includes /my-garden only.
- i18n: `garden` namespace (37 keys) + nav.myGarden + footer link in en master.
- QA: typecheck clean; lint 0 errors (1 pre-existing warning); build OK (906 pages);
  smoke: /my-garden 200 + canonical, plot page 200 + noindex, sitemap entry present,
  calculator 200 after SaveCalcButton wiring.

---

## Phase 5 — Tools (2026-10-04)

- `src/lib/profit.ts`: pure profit engine on USER-ENTERED assumptions only (no market
  prices/yields/costs in code) — revenue, total cost, net profit, per-acre + per-hectare
  profit, cost per yield unit, break-even yield, break-even price, ROI; saved scenarios
  in localStorage (30 max).
- `/profit-calculator`: crop (optional, links to crop guide), area + unit, yield per acre
  + free yield-unit label, price per yield unit + currency label, 7 cost fields; transparent
  formula panel; save-scenario / print (print CSS hides chrome) / reset architecture;
  link to dose calculator for fertilizer costing.
- `/compare`: two tabs. Fertilizers — select 2–6, enter your own price per bag + bag size;
  computed price per kg of N / P2O5 / K2O from label-accurate NPK with cheapest-per-nutrient
  highlight. Crops — up to 3 side by side: NPK dose/ha (or honest "under review"), season,
  water, soil, verification badges, links to guides.
- Nav: desktop Tools dropdown (Dose Calculator / Profit Calculator / Compare, active-state
  aware) + mobile drawer Tools group; Dose Calculator moved out of top-level per spec §15.
- Homepage tools grid extended to 6 cards (Profit Calculator, Compare) with icons +
  Urdu accents; footer Tools column + sitemap extended.
- i18n: `tools.profit` + `tools.compare` namespaces, nav.tools/profitCalculator/compare.
- QA: typecheck clean; lint 0 errors (1 pre-existing warning); build OK (942 pages);
  profit engine unit-verified by hand calc (5ac × 40md × Rs3000 − Rs100k → profit 500k,
  BE 33.3md / Rs500, ROI 500%); smoke: both routes 200 with correct titles, Tools
  dropdown renders, sitemap entries present.

---

## Phase 6 — SEO (2026-10-04)

- Deliverable: `SEO_KEYWORD_AUDIT.md` — 22 keyword clusters audited (17 from the original
  topical map + 5 new from Phases 2–5) with intent, primary/secondary keywords, target page,
  status, cannibalization risk, action. Explicit duplicate-intent decisions: `/fertilizer-dose/[crop]`
  family NOT built (intent served by `/crops/[slug]`), no static price page (intent served
  honestly by `/compare`), no month×region×locale calendar URL spam. Content backlog listed
  (4 guide intents → blog-first, then `/guides/*` with CMS).
- Homepage title fixed: was `Fertilizer Dose — Exact Fertilizer Dose Calculator for Wheat,
  Rice & More · Fertilizer Dose` (brand ×3); now `NPK Fertilizer Dose Calculator — Per Acre,
  Kanal, Marla & Hectare · Fertilizer Dose`.
- Incomplete-locale indexing gate: `localizedMetadata()` now emits `noindex, follow` for all
  non-English locales (17 dictionaries are English-fallback scaffolds); revisit per-locale
  when real translations ship. Verified: `/hi` → noindex, `/` → index.
- Canonical + hreflang coverage: migrated 7 pages from bare metadata (`/blog`, `/blog/[slug]`,
  `/faq`, `/fertilizers`, `/fertilizers/[slug]`, `/fertilizer-dose-chart`, `/plant-doctor`);
  all indexable pages now use `localizedMetadata()`. Added missing meta keys
  (blog/fertilizers/chart/faq/plantDoctor).
- Structured data: new `src/components/seo/JsonLd.tsx` (Faq/Article/Breadcrumb helpers);
  FAQPage on `/faq` + homepage FAQ, Article on blog posts, BreadcrumbList on growing detail,
  fertilizer detail, blog posts, calendar country pages. Organization + WebSite retained.
- FAQ page converted from hardcoded content to dictionary-driven + localized metadata.
- Verified: one H1 per page (spot-checked), sitemap complete with hreflang alternates and
  thin-page exclusions, internal linking ≤2 clicks everywhere, no keyword stuffing.
- QA: typecheck clean; lint 0 errors (1 pre-existing warning); build OK (942 pages);
  smoke: titles, canonicals, robots gates, JSON-LD all verified in rendered HTML.

---

## Phase 7 — Final QA (2026-10-04)

- Deliverable: `FINAL_QA_REPORT.md` — honest 19-part report (brand, i18n, libraries,
  calendar, garden, profit, compare, nav, homepage, calculator, plant doctor, SEO, data
  integrity, responsive, RTL, dark mode, build, backend status, limitations).
- Reference test re-run: wheat 5 acres → DAP 263.9 / Urea 424.6 / MOP 134.9 kg — exact.
- Static audits: all tables in overflow-x-auto scroll containers; no fixed widths ≥360px
  outside scroll containers; responsive grid prefixes verified; no physical RTL properties
  in new code.
- RTL fixes: Accordion text-left → text-start; Select chevron flips under [dir="rtl"]
  (pe-10 + CSS override). CompareTool crop grid made responsive (1/2/3 cols).
- Route crawl: 30 URLs, all 200 (one 308 = trailing-slash normalization).
- Final: lint 0 errors, typecheck clean, build 942 pages.
- Disclosed limits: no pixel screenshots (Chromium won't render in container, tunnel TLS
  blocked) — static QA only for responsive/RTL/dark visuals; backend not built (next phase).
