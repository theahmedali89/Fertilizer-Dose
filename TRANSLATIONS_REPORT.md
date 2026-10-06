# Translations Report — AI-generated draft translations (2026-10-06)

**Status:** All strings are AI-authored drafts, marked `draft` everywhere. **None are native-reviewed.**
Ahmed will add the user-facing disclaimer; this report documents what was produced and its limits.

## What was done

### Task 2a — Crop/vegetable/plant names (45 items × 18 locales = 810 rows)
Output: [`prisma/data/translations.json`](prisma/data/translations.json) — array of
`{itemSlug, locale, name, localName?}`.

| Locale | Code | Items | localName rows |
|---|---|---|---|
| Urdu | ur | 45/45 | 2 |
| Hindi | hi | 45/45 | 6 |
| Punjabi | pa | 45/45 | 2 |
| Bengali | bn | 45/45 | 6 |
| Arabic | ar | 45/45 | 9 |
| Turkish | tr | 45/45 | 5 |
| French | fr | 45/45 | 6 |
| German | de | 45/45 | 5 |
| Spanish | es | 45/45 | 15 |
| Italian | it | 45/45 | 8 |
| Polish | pl | 45/45 | 6 |
| Russian | ru | 45/45 | 8 |
| Portuguese | pt | 45/45 | 10 |
| Indonesian | id | 45/45 | 7 |
| Malay | ms | 45/45 | 10 |
| Chinese (Simplified) | zh | 45/45 | 7 |
| Japanese | ja | 45/45 | 8 |
| Korean | ko | 45/45 | 7 |

- Urdu names for existing items were taken verbatim from `src/lib/growing.ts` /
  `src/lib/agronomy.ts` (e.g. wheat→گندم, rice→چاول / دھان, tomato→ٹماٹر,
  soybean→سویابین, rose→گلاب) — not re-translated.
- Urdu names that did not exist in code (jute→پٹسن, mustard→سرسوں, lentil→مسور,
  cauliflower→پھول گوبھی, cabbage→بند گوبھی, napa-cabbage→چینی گوبھی,
  radish→مولی, daikon→جاپانی مولی, etc.) were translated fresh and are AI drafts.
- `localName` is present only where a common local name differs from the formal
  name (127 of 810 rows); otherwise omitted.
- All 45 slugs verified to exist in the app's item data (GROWING_ITEMS + batch seeds).

### Task 2b — Phase-B UI strings (23 keys × 18 locales = 414 strings)
- **Merged (add-missing-only, nothing overwritten):** `src/messages/` for
  hi, bn, ar, tr, fr, de, es, it, pl, ru, pt, id, ms, ja, ko — each gained exactly
  23 keys: `country.{selectCountry,selectRegion,selectedCountry}`,
  `calendar.{catFruit,catHerb,catFlower,catOther,activitySOW,activityTRANSPLANT,activityPLANT,activityHARVEST,activityLAND_PREPARATION,viewGuide,plantingWindow,appliesTo,emptyRegionTitle}`,
  `home.planting.{noCountryTitle,noCountryDesc,showingFor,changeCountry,viewCalendar,noItemsTitle,noItemsHint}`.
- **Created:** `src/messages/ur.json`, `src/messages/pa.json`, `src/messages/zh.json`
  with the en.json top-level structure; only the three Phase-B sections are filled —
  all other keys fall back to English via the existing deep-merge in `src/i18n/request.ts`.
  Each new file carries `_meta: {status: "machine_translated", note: "AI-translated draft (2026-10-06) — NOT native-reviewed"}`.
- Note: `ur`/`pa`/`zh` are not yet registered in `src/i18n/routing.ts` LOCALES —
  adding them there is a behavior change left for Ahmed's decision.
- Note: `viewGuide` uses the actual en.json text "View growing guide".

### Task 2c — Seed
- **Created** `prisma/seed-translations.ts` — reads `prisma/data/translations.json`,
  resolves `growingItemId` by slug, and upserts `GrowingItemTranslation` with
  `status: "draft"` using the `@@unique([growingItemId, locale])` key.
  Insert-if-missing semantics: existing records are never overwritten (admin edits survive).
- **Wired** into `prisma/seed.ts` (`await seedTranslations(db)` before "seed complete").

## Verification
- `npm run typecheck` — **passes** (clean).
- `translations.json` validated: 810 rows, 0 duplicate (slug, locale) pairs,
  45 slugs × 18 locales, all slugs resolve to real GrowingItems.
- Message-file diffs reviewed: only additions + the two trailing-comma line
  changes needed to append keys; no existing string was modified.

## Honest caveats (read before shipping)
1. **Not native-reviewed.** These are my best-effort translations of agricultural
   vocabulary across 18 languages. Crop names are usually stable, but several are
   judgment calls: e.g. es "Papa" vs "Patata" for potato, pt "Palmeira de dendê"
   for oil palm, id "Sawi" for mustard, ms "Bawang besar" for onion, the various
   Tagetes marigold names (fr Œillet d'Inde / es Tagete / it Tagete / pt Tagetes /
   pl Aksamitka / ru Бархатцы). Regional usage varies — a native speaker should
   review before these are shown as verified.
2. **Everything is `draft`.** DB records seed with `status: "draft"`; message-file
   additions have no reviewed marker. Do not display them as verified translations.
3. **Scope kept tight:** no agronomic data was translated — only item names and
   the 23 Phase-B UI strings. Urdu names already in code were reused, not invented.
4. **Not committed** — parent review first.

## Files changed/created (by this task)
- `prisma/data/translations.json` (new, 810 rows)
- `prisma/seed-translations.ts` (new)
- `prisma/seed.ts` (wired `seedTranslations`)
- `src/messages/{hi,bn,ar,tr,fr,de,es,it,pl,ru,pt,id,ms,ja,ko}.json` (+23 keys each)
- `src/messages/{ur,pa,zh}.json` (new)
- `scripts/gen-translations.py` (reproducible generator for all of the above)
- `TRANSLATIONS_REPORT.md` (this file)

Note: `prisma/data/batch{1..4}/*.json` and `tsconfig.tsbuildinfo` also show as
modified in the working tree — those changes came from another concurrent
process/session, not from this task.
