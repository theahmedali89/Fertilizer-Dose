# SEO Keyword Audit — Fertilizer Dose

**Date:** 2026-10-04
**Scope:** Phase 6 of the Fertilizer Dose expansion. Audits every useful keyword from the original topical map (KHAADGUIDE_V2_PLAN.md §11) plus new intents created by Phases 2–5, against the live site at `~/workspace/khaadguide/khaadguide-v2/`.

**Standing rule applied throughout:** no invented agronomic figures, prices, yields, or dates. Any keyword whose intent *requires* fabricated data (e.g. static fertilizer prices) is deliberately left unserved or served by a user-input tool instead.

---

## 1. Keyword → page mapping

| # | Cluster | Primary keyword | Secondary keywords | Intent | Target page | Status | Cannibalization risk | Action |
|---|---------|----------------|-------------------|--------|-------------|--------|---------------------|--------|
| 1 | Core tools | fertilizer dose calculator | khad calculator, fertilizer calculator per acre, fertilizer rate calculator, fertilizer requirement calculator, how much fertilizer do i need, fertilizer quantity calculator, npk fertilizer calculator, fertilizer dose per hectare | Transactional | `/calculator` | ✅ Live | None — single canonical tool page | Keep. Monitor rankings; no duplicate calculator pages |
| 2 | NPK method | npk fertilizer calculation formula | how to calculate npk fertilizer, fertilizer formula, npk ratio calculator, how to mix fertilizers for npk, fertilizer blending calculation | Informational | `/guides/npk-fertilizer-calculation-formula` | ❌ Missing | None yet | **Content backlog:** publish as blog post first; promote to `/guides/*` when CMS lands |
| 3 | How-to | how to calculate fertilizer dose per acre | fertilizer dose per acre formula | Informational | `/guides/how-to-calculate-fertilizer-dose-per-acre` | ❌ Missing | Low — calculator page targets transactional intent, guide targets informational | **Content backlog:** same as #2. Do NOT merge into `/calculator` (intent differs) |
| 4 | Charts | fertilizer dose chart | npk chart for crops | Informational | `/fertilizer-dose-chart` | ✅ Live | None | Keep |
| 5 | Crop: wheat | fertilizer dose for wheat per acre | wheat npk dose, urea dap for wheat | Transactional/Informational | `/crops/wheat` | ✅ Live | **Avoided:** planned `/fertilizer-dose/wheat` NOT built — dose content lives on the crop page | Keep single page; add dose-focused H2 + FAQ to strengthen intent match |
| 6 | Crop: rice | recommended fertilizer dose for rice per acre | paddy fertilizer dose | Transactional/Informational | `/crops/rice` | ✅ Live | Same as #5 — no `/fertilizer-dose/rice` duplicate | Same as #5 |
| 7 | Crop: cotton | fertilizer dose for cotton per acre in pakistan | cotton npk requirement | Transactional/Informational | `/crops/cotton` | ✅ Live (dose in review) | Same as #5 | Keep; dose section appears only when verified — honest gap, not a block |
| 8 | Crop: maize | maize fertilizer dose per acre | makki khad dose | Transactional/Informational | `/crops/maize` | ✅ Live | Same as #5 | Same as #5 |
| 9 | Crop: sugarcane | sugarcane fertilizer dose per acre | kamad khad | Transactional/Informational | `/crops/sugarcane` | ✅ Live (dose in review) | Same as #5 | Same as #7 |
| 10 | Crop: potato | fertilizer dose of potato per acre | aloo khad dose | Transactional/Informational | `/crops/potato` | ✅ Live (dose in review) | Same as #5 | Same as #7 |
| 11 | Crop: soybean/groundnut | fertilizer dose for soybean per acre | groundnut fertilizer dose | Informational | `/crops/soybean`, `/crops/groundnut` | ⚠️ Live but noindex (identity-only, no verified dose) | None | Keep noindex until verified dose data lands; then flip `indexable` |
| 12 | Products | dap dose per acre, urea dose per acre | dap vs urea, mop dose per acre, how much urea per acre, how much dap per acre, potash fertilizer dose, urea fertilizer for wheat, dap fertilizer for rice | Transactional/Informational | `/fertilizers/dap`, `/fertilizers/urea`, `/fertilizers/mop` … | ✅ Live | None — one page per fertilizer | Keep. Dose-per-acre intent also served contextually by `/calculator` |
| 13 | Micronutrients | boron fertilizer dose per acre | zinc sulphate dose, micronutrient deficiency | Informational | `/guides/boron-fertilizer-dose` | ❌ Missing | None yet | **Content backlog:** blog-first, then guides |
| 14 | Organic | organic fertilizer for plants | organic khad, compost vs chemical fertilizer | Informational | `/fertilizers/organic` (hub) + `/blog/organic-fertilizers-for-plants` | ✅ Live (2026-10-06/07) | None — hub = directory, blog = guide; distinct titles | Keep. Hub targets material/directory intent; blog targets guide intent |
| 23 | Organic hub | organic fertilizer | organic fertilizers, natural fertilizer, jaivik khad | Informational | `/fertilizers/organic` | ✅ Live | **Avoided:** no separate `/organic-fertilizer` singular page — one canonical hub | Keep single hub |
| 24 | Organic material | farmyard manure npk | fym npk content, gobar khad npk, farmyard manure composition | Informational | `/fertilizers/farmyard-manure` | ✅ Live | None — one page per material | Keep. Page shows TNAU/FAO typical ranges, never fixed values |
| 25 | Organic compare | vermicompost vs chemical fertilizer | organic vs chemical fertilizer, compost vs urea | Commercial investigation | `/compare` (Organic vs mineral tab) + `/blog/organic-vs-chemical-fertilizer-pros-cons` | ✅ Live | None — tool = interactive comparison; blog = prose | Keep distinct |
| 26 | Organic per-crop | organic fertilizer for wheat | organic fertilizer for rice, organic manure for crops | Informational | Crop pages (`/crops/*` "Organic fertilizer options" card) | ✅ Live (generic guidance only) | None — no per-crop organic dose pages (no verified data) | Keep generic; do NOT build per-crop organic dose pages until verified data exists |
| 27 | Organic calculator | organic fertilizer calculator | manure calculator, how much manure per acre | Transactional | `/calculator` (Mode A organic section: user-entered analysis + lab record + top-up offset) | ✅ Live | None — single canonical tool | Keep. Mode B (auto DB dosing) deliberately NOT built — zero verified organic nutrient data |
| 15 | Prices | npk fertilizer price in pakistan | urea price today, dap rate | Transactional (price check) | — | ❌ Deliberately unserved | N/A | **Do NOT build** a static price page (would require fabricated or stale prices). Intent served honestly by `/compare` with user-entered prices |
| 16 | Regional | khad dose per acre, fertilizer dose in punjab | — | Local informational | `/planting-calendar/pakistan`, `/planting-calendar/india` | ⚠️ Partial | None | Calendar pages cover sowing intent; dose-by-region guides are a content backlog item |
| 17 | FAQ/homepage | what is fertilizer, fertilizer dose per acre | npk meaning, what is dap, how much fertilizer does wheat need, when should i apply fertilizer, what fertilizer is best for my crop, how much npk does my crop need | Informational | `/` + `/faq` | ✅ Live | Low — homepage targets brand + core tool; `/faq` targets question intents | Keep distinct: homepage = tool/brand, FAQ = questions |
| 18 | Planting calendar (new) | what to plant in october pakistan | sowing calendar punjab, planting calendar india, fertilizer application timing, when to apply urea to wheat, fertilizer schedule for crops | Local informational | `/planting-calendar` + country pages | ✅ Live | None — month/region selection is client state, no URL spam | Keep. Add regions only with verified windows |
| 19 | Garden (new) | farm management app, my farm records | crop diary app | Navigational/Transactional | `/my-garden` | ✅ Live | None | Keep |
| 20 | Profit (new) | crop profit calculator | farming profit per acre, break even yield formula | Transactional | `/profit-calculator` | ✅ Live | None | Keep |
| 21 | Compare (new) | cheapest nitrogen fertilizer | dap vs urea which is better, fertilizer price comparison, cheapest phosphorus fertilizer, cheapest potash fertilizer, fertilizer cost per acre comparison | Commercial investigation | `/compare` | ✅ Live | None | Keep |
| 22 | Plants/vegetables (new) | rose fertilizer, tomato fertilizer dose | money plant care, onion fertilizer | Informational | `/plants/*`, `/vegetables/*` | ⚠️ Live but noindex (identity-only) | None | Keep noindex until verified growing data lands |

### Duplicate-intent decisions (explicit)

- **`/fertilizer-dose/[crop]` route family NOT built.** The topical map proposed it, but `/crops/[slug]` already serves "fertilizer dose for X per acre" intent with the dose table, calculator CTA, and related fertilizers. A parallel route family would split authority and create near-duplicate pages. **Rule: one intent → one canonical page.**
- **No static `/fertilizer-prices` page.** Price intent is served by `/compare` (user-entered prices). A static page would either fabricate prices or go stale within days.
- **No month×region×locale calendar URLs.** One hub + two country landings; all filtering is client state.

---

## 2. Keyword stuffing check

- Titles: one primary keyword per page, no repetition (homepage redundancy fixed — see §4).
- Body copy: keywords appear naturally in headings and first paragraphs; no comma-stuffed keyword lists found in any template.
- Urdu accents on homepage cards are single-word labels, not keyword dumps.
- **Verdict:** pass.

---

## 3. Metadata, headings, structured data, sitemap, international SEO

### Fixed in this phase

| Area | Fix |
|------|-----|
| Homepage title | Was `Fertilizer Dose — Exact Fertilizer Dose Calculator for Wheat, Rice & More · Fertilizer Dose` (brand ×3, "dose" ×2). Now `NPK Fertilizer Dose Calculator — Per Acre, Kanal, Marla & Hectare · Fertilizer Dose` |
| Incomplete-locale indexing | `localizedMetadata()` now emits `noindex, follow` for all non-English locales (17 dictionaries are English-fallback scaffolds). Revisit per-locale when real translations ship. English pages unaffected |
| Canonical + hreflang coverage | Migrated 7 pages that used bare metadata: `/blog`, `/blog/[slug]`, `/faq`, `/fertilizers`, `/fertilizers/[slug]`, `/fertilizer-dose-chart`, `/plant-doctor`. All indexable pages now go through `localizedMetadata()` |
| FAQ schema | `FAQPage` JSON-LD on `/faq` (from dictionary items) and homepage FAQ section |
| Article schema | `Article` JSON-LD on blog posts (headline, description, author/publisher org, date) |
| Breadcrumb schema | `BreadcrumbList` JSON-LD on growing detail, fertilizer detail, blog posts, calendar country pages (all have matching visible breadcrumbs) |
| Existing schema | Organization + WebSite (+SearchAction) retained in locale layout |

### Verified (no change needed)

- **Sitemap:** all indexable routes present with hreflang alternates; thin/in-review growing pages (`indexable: false`) excluded; user-private `/my-garden/plots/[id]` excluded and noindex.
- **Headings:** spot-checked `/`, `/calculator`, `/crops/wheat`, `/planting-calendar`, `/profit-calculator`, `/compare` — exactly one H1 each; H2/H3 hierarchy intact.
- **Internal links:** every new route reachable within ≤2 clicks (header dropdowns, footer, homepage sections); related-item sidebars link growing ↔ fertilizer ↔ calculator ↔ calendar.
- **International:** 18-locale routing, `lang` attributes, Arabic `dir="rtl"`, hreflang incl. `x-default`, locale-aware internal links — all retained.

### Known limitations (not fixed — require translations or backend)

- Non-English metadata falls back to English strings (architecture-level; acceptable with the noindex gate).
- `/guides/*` route family does not exist yet — informational keywords (#2, #3, #13, #14, #16-dose) are a content backlog for the blog/CMS, not a technical gap.

---

## 4. Cannibalization watchlist

| Risk | Status |
|------|--------|
| `/calculator` vs crop pages for "dose per acre" queries | Intended split: tool (transactional) vs crop guide (informational). Distinct titles/descriptions. ✅ |
| `/compare` vs `/fertilizers/*` for "dap vs urea" | `/compare` = price-per-nutrient tool; fertilizer pages = product guides. Distinct. ✅ |
| `/planting-calendar` vs `/crops/*` for "when to sow wheat" | Calendar = month×region lookup; crop page = full growing guide. Cross-linked, not duplicated. ✅ |
| Homepage vs `/calculator` for "fertilizer dose calculator" | Homepage title no longer targets the exact calculator phrase verbatim. ✅ |
| `/fertilizers/organic` vs `/blog/organic-fertilizers-for-plants` for "organic fertilizer" queries | Hub = material directory (transactional/directory intent); blog = guide (informational). Distinct titles/descriptions. ✅ |
| `/compare` organic tab vs `/fertilizers/organic` | Compare = interactive cost/nutrient tool; hub = educational directory. Cross-linked, not duplicated. ✅ |
| Per-crop "organic fertilizer for X" | Served by the generic "Organic fertilizer options" card on crop pages — NO per-crop organic dose pages built (would be thin/fabricated without verified data). ✅ |

---

## 5. Content backlog (keyword-driven, needs real sources — never fabricated)

1. `npk fertilizer calculation formula` — guide
2. `how to calculate fertilizer dose per acre` — guide
3. `boron fertilizer dose per acre` (+ zinc) — guide
4. `organic fertilizer for plants` — guide ✅ DONE (blog live 2026-10-06; hub `/fertilizers/organic` live)
5. Region-specific dose guides (Punjab/Sindh) — guides, only with provincial sources
6. Flip `indexable` on soybean/groundnut/vegetables/plants pages as verified data lands
7. Per-locale translation → lift the noindex gate locale by locale
8. `soil test based fertilizer recommendation` — guide (pending blog; no new tool section)
9. `fertilizer dose by growth stage` (tillering, flowering, grain filling) — crop page FAQ expansions, not new pages
10. `fertilizer deficiency symptoms` (nitrogen deficiency, phosphorus deficiency) — guide (pending blog)
11. `how much fertilizer per hectare` — already covered by calculator; add hectare examples to FAQ
12. `fertilizer application methods` (broadcasting vs banding vs fertigation) — guide (pending blog)

---

*Audit prepared from the live codebase on 2026-10-04. Re-run after the guides CMS and translation work land.*
