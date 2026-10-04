# I18N IMPLEMENTATION

**Stack:** `next-intl` v4 (App Router), `localePrefix: "as-needed"`
**Default locale:** `en` — URLs stay unprefixed (`/calculator`)
**Localized URLs:** `/hi/calculator`, `/es/calculator`, `/fr/calculator`, `/bn/calculator`, `/ar/calculator`, … (18 locales)

## Locales

| Code | Language | Native name | Dir | Dictionary status |
|---|---|---|---|---|
| en | English | English | ltr | ✅ Complete (master) |
| hi | Hindi | हिन्दी | ltr | ⚠️ Scaffold — English fallback |
| es | Spanish | Español | ltr | ⚠️ Scaffold — English fallback |
| ru | Russian | Русский | ltr | ⚠️ Scaffold — English fallback |
| fr | French | Français | ltr | ⚠️ Scaffold — English fallback |
| de | German | Deutsch | ltr | ⚠️ Scaffold — English fallback |
| it | Italian | Italiano | ltr | ⚠️ Scaffold — English fallback |
| pt | Portuguese | Português | ltr | ⚠️ Scaffold — English fallback |
| bn | Bengali | বাংলা | ltr | ⚠️ Scaffold — English fallback |
| ja | Japanese | 日本語 | ltr | ⚠️ Scaffold — English fallback |
| ko | Korean | 한국어 | ltr | ⚠️ Scaffold — English fallback |
| ms | Malay | Bahasa Melayu | ltr | ⚠️ Scaffold — English fallback |
| pl | Polish | Polski | ltr | ⚠️ Scaffold — English fallback |
| id | Indonesian | Bahasa Indonesia | ltr | ⚠️ Scaffold — English fallback |
| ar | Arabic | العربية | **rtl** | ⚠️ Scaffold — English fallback |
| bg | Bulgarian | Български | ltr | ⚠️ Scaffold — English fallback |
| tr | Turkish | Türkçe | ltr | ⚠️ Scaffold — English fallback |
| sv | Swedish | Svenska | ltr | ⚠️ Scaffold — English fallback |

## Architecture

```
src/
  i18n/
    routing.ts      — LOCALES (code/name/nativeName/dir), next-intl routing config
    request.ts      — getRequestConfig: locale dict deep-merged OVER English (fallback)
    navigation.ts   — locale-aware Link, usePathname, useRouter, redirect
  messages/
    en.json         — master dictionary (namespaces: nav, common, footer, language,
                      home, calculator, faq, plantDoctor)
    hi.json …       — scaffold files: { _meta } only → full English fallback
  lib/
    i18n-utils.ts   — deepMerge, stripLocalePrefix, localizePath, hreflangAlternates
    seo.ts          — localizedMetadata({ locale, path, title, description })
  middleware.ts     — next-intl locale handling + x-pathname header (for future use)
  app/
    layout.tsx      — minimal root (next-intl pattern: html lives in [locale])
    [locale]/
      layout.tsx    — <html lang dir>, providers, header/footer, site-wide metadata,
                      JSON-LD Organization + WebSite, generateStaticParams (18 locales)
```

## Key behaviors

- **English fallback:** `request.ts` deep-merges each locale's dictionary over `en.json`,
  so missing keys render in English instead of crashing. Safe to translate incrementally.
- **URL preservation on switch:** the switcher rewrites only the locale segment
  (`localizePath`), keeping the user on the equivalent page.
- **Persistence:** `NEXT_LOCALE` cookie (1 year, SameSite=Lax); middleware also
  respects `Accept-Language` for first visits.
- **RTL:** `<html dir="rtl">` for `ar`. Components use logical properties
  (`text-start/end`, `border-s/e`, `ps/pe`, `start/end`, `rtl:` variants).
  Flexbox/grid flip automatically. Full pixel-QA per page is still pending.
- **SEO:** every indexable page should use `localizedMetadata()` → canonical +
  `hreflang` for all 18 locales + `x-default`. Sitemap emits language alternates
  per URL. Translated-only-when-real rule: do NOT index empty locale variants
  (currently all locales serve the English-fallback content; a `noindex` gate for
  incomplete locales can be added when professional translations land).
- **Fonts:** Inter/Fraunces cover Latin; non-Latin scripts (Devanagari, Arabic, CJK…)
  fall back to system fonts via the browser's font fallback chain. If full
  translations ship, consider adding Noto subsets per script.

## What is translated (Phase 1)

Header/nav, footer, language UI, homepage (all sections incl. FAQ), dose calculator
(form, validation, results, method FAQ), theme toggle labels.

## Build note (2026-10-04)

`next-intl/plugin` is intentionally NOT used. It top-level-requires `@swc/core`
(for its message-extractor, which this project doesn't use), and the nested
`@swc/core@1.16` native binding refuses to load in the build container
(`SWC_NATIVE_BINDING_CACHE` validation fails when running as root).
`next.config.mjs` instead applies the one thing the plugin does for a standard
setup — aliasing `next-intl/config` → `./src/i18n/request.ts` — directly for
both webpack and Turbopack. Equivalent behavior, zero native dependencies.

## NOT yet translated (Phase 1 boundary)

Page bodies: Plant Doctor, fertilizer/crop detail pages, blog posts, chart page,
FAQ page shell, About/Contact/Privacy/Terms bodies, auth/admin (don't exist yet).
Their chrome (header/footer/metadata) is localized; bodies remain English by design
until professional translation — **UI strings and agronomic datasets stay separate**
per the data-integrity rule: dictionaries hold UI text only; crop/fertilizer facts
live in `src/lib/agronomy.ts` (later: database with source citations).

## Adding a translation

1. Copy the English block from `src/messages/en.json` into `src/messages/<code>.json`.
2. Translate values only — never rename keys.
3. Rich-text keys (e.g. `home.hero.title` with `<em>`) keep the same tags.
4. ICU placeholders (`{n}`, `{soil}`) must be preserved verbatim.
5. Rebuild; the deep-merge picks up new keys automatically.
