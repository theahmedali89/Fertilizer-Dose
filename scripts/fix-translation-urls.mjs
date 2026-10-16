/**
 * Second pass over prisma/data/post-translations.json:
 * re-translates paragraphs that fell back to English because the
 * machine translator mangled URLs/paths or dropped the "## " heading
 * marker — this time with those parts protected.
 *
 * - URLs/paths -> ZZURLnZZ placeholders (restored after translation)
 * - "## " heading markers -> stripped before, re-attached after
 *
 * Paragraphs that still fail QA stay in English (honest fallback).
 * Usage: node scripts/fix-translation-urls.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "prisma/data/blog-posts-source.json");
const FILE = path.join(ROOT, "prisma/data/post-translations.json");
const DELAY_MS = 120;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gt(text, tl, attempt = 1) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const out = (data[0] || []).map((seg) => seg[0] ?? "").join("");
    if (!out.trim()) throw new Error("empty translation");
    return out;
  } catch (e) {
    if (attempt >= 4) throw e;
    await sleep(1500 * attempt);
    return gt(text, tl, attempt + 1);
  }
}

function protect(text) {
  const urls = [];
  // markdown link targets: ](URL)
  let out = text.replace(/\]\((https?:\/\/[^\s)]+|\/[a-z0-9][a-z0-9/_.-]*)\)/gi, (m, u) => {
    urls.push(u);
    return `](ZZURL${urls.length - 1}ZZ)`;
  });
  // bare URLs
  out = out.replace(/(^|[\s(])https?:\/\/[^\s)>\]]+/gi, (m, pre) => {
    const u = m.slice(pre.length);
    urls.push(u);
    return pre + `ZZURL${urls.length - 1}ZZ`;
  });
  // bare internal paths (not already inside a placeholder)
  out = out.replace(/(\s)\/[a-z]{2,}(?:\/[a-z0-9_.-]+)*/gi, (m, pre) => {
    if (/ZZURL/.test(m)) return m;
    urls.push(m.slice(pre.length));
    return pre + `ZZURL${urls.length - 1}ZZ`;
  });
  return { out, urls };
}

function unprotect(text, urls) {
  return text.replace(/ZZURL(\d+)ZZ/g, (m, i) => urls[+i] ?? m);
}

const URL_RE = /(https?:\/\/[^\s)>\]]+|\/[a-z0-9][a-z0-9/_.-]*)/gi;
function qaParagraph(src, tr) {
  const issues = [];
  if (!tr || !tr.trim()) issues.push("empty");
  if (src.startsWith("## ") && !tr.startsWith("## ")) issues.push("heading-marker-lost");
  for (const u of [...new Set([...src.matchAll(URL_RE)].map((m) => m[0]))].filter((x) => x.length > 4)) {
    if (!tr.includes(u)) { issues.push(`url-lost:${u}`); break; }
  }
  return issues;
}

async function main() {
  const posts = JSON.parse(fs.readFileSync(SRC, "utf8"));
  const store = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const bySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));
  let fixed = 0, stillBad = 0;

  for (const [slug, perLocale] of Object.entries(store.translations)) {
    const src = bySlug[slug];
    if (!src) continue;
    for (const [locale, entry] of Object.entries(perLocale)) {
      if (!entry.complete) continue;
      let changed = false;
      for (let i = 0; i < src.body.length; i++) {
        if (entry.body[i] !== src.body[i]) continue; // not a fallback, skip
        const para = src.body[i];
        const isHeading = para.startsWith("## ");
        const core = isHeading ? para.slice(3) : para;
        const { out: prot, urls } = protect(core);
        try {
          let tr = unprotect(await gt(prot, locale), urls);
          if (isHeading) tr = "## " + tr.replace(/^##\s*/, "");
          await sleep(DELAY_MS);
          if (qaParagraph(para, tr).length === 0) {
            entry.body[i] = tr;
            fixed++;
            changed = true;
          } else {
            stillBad++;
          }
        } catch {
          stillBad++;
        }
      }
      if (changed) {
        // drop resolved qaIssues for this slug/locale
        store.meta.qaIssues = store.meta.qaIssues.filter(
          (q) => !(q.slug === slug && q.locale === locale),
        );
      }
    }
  }
  store.meta.fixedByUrlPass = fixed;
  fs.writeFileSync(FILE, JSON.stringify(store));
  console.log(`url-fix pass: fixed=${fixed} still-fallback=${stillBad}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
