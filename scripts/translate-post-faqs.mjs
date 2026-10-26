/**
 * Machine-translate FertDose blog post FAQs + the translation-notice
 * strings into all non-English blog locales.
 *
 * Why: the blog body/title/excerpt translations (scripts/translate-posts.mjs)
 * never covered POST_FAQS in src/lib/blog.ts, and the TranslationNotice
 * banner hardcodes English — so non-English guide pages showed an English
 * FAQ block and an English notice. This script closes that gap.
 *
 * Source of truth for English FAQs: POST_FAQS in src/lib/blog.ts
 * (exactly the 5 best-fertilizer guides, 5 Q&As each).
 *
 * Output 1 (resume-safe store): prisma/data/post-faq-translations.json
 * Output 2 (runtime modules, emitted from the store):
 *   src/lib/post-faq-translations.ts
 *   src/lib/translation-notice-text.ts
 * Every row is an AI draft — Ahmed reviews before anything is treated
 * as final. Failed strings fall back to English and are logged in
 * meta.qaIssues (honest, never silent).
 *
 * Usage: node scripts/translate-post-faqs.mjs [--locales ur,hi]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BLOG_SRC = path.join(ROOT, "src/lib/blog.ts");
const STORE = path.join(ROOT, "prisma/data/post-faq-translations.json");
const OUT_FAQ_TS = path.join(ROOT, "src/lib/post-faq-translations.ts");
const OUT_NOTICE_TS = path.join(ROOT, "src/lib/translation-notice-text.ts");

const LOCALES = ["ur","hi","es","ru","fr","de","it","pt","bn","ja","ko","ms","pl","id","ar","bg","tr","sv"];
const DELAY_MS = parseInt(process.env.TR_DELAY_MS || "600", 10);
const WORKERS = parseInt(process.env.TR_WORKERS || "2", 10);

const args = process.argv.slice(2);
function flag(name) {
  const i = args.findIndex((a) => a === name || a.startsWith(name + "="));
  if (i === -1) return undefined;
  if (args[i].includes("=")) return args[i].split("=").slice(1).join("=");
  return args[i + 1];
}
const TARGETS = flag("--locales") ? flag("--locales").split(",") : LOCALES;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Extract the POST_FAQS object literal from src/lib/blog.ts (brace-matched,
// string-aware) and evaluate it. blog.ts is our own repo source.
function extractPostFaqs() {
  const src = fs.readFileSync(BLOG_SRC, "utf8");
  const start = src.indexOf("export const POST_FAQS");
  if (start === -1) throw new Error("POST_FAQS not found in src/lib/blog.ts");
  // The declaration carries a type annotation (Record<string, { q; a }[]>),
  // so the object literal starts at the "{" AFTER the assignment "=".
  const eq = src.indexOf("=", start);
  const open = src.indexOf("{", eq);
  let depth = 0, quote = null, escaped = false, i = open;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
    } else {
      if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) break; }
    }
  }
  if (depth !== 0) throw new Error("POST_FAQS literal did not balance");
  const literal = src.slice(open, i + 1);
  return new Function(`return (${literal});`)();
}

const NOTICE_EN = {
  notice: "This page is automatically translated and under review — the English version is the most accurate.",
  readEnglish: "Read in English",
  dismiss: "Dismiss translation notice",
};

async function gt(text, tl, attempt = 1) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.status === 429) {
      if (attempt >= 6) throw new Error("HTTP 429 (persistent)");
      console.error(`429 for ${tl}, backing off ${15 * attempt}s (attempt ${attempt})`);
      await sleep(15000 * attempt);
      return gt(text, tl, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const out = (data[0] || []).map((seg) => seg[0] ?? "").join("");
    if (!out.trim()) throw new Error("empty translation");
    return out;
  } catch (e) {
    if (/HTTP 429/.test(e.message)) throw e;
    if (attempt >= 4) throw e;
    await sleep(1500 * attempt);
    return gt(text, tl, attempt + 1);
  }
}

async function translateText(text, tl) {
  const out = await gt(text, tl);
  await sleep(DELAY_MS);
  return out;
}

function emitTs(store) {
  const faqs = {};
  for (const [tl, bySlug] of Object.entries(store.faqs || {})) {
    for (const [slug, items] of Object.entries(bySlug)) {
      if (!items.complete) continue;
      faqs[tl] = faqs[tl] || {};
      faqs[tl][slug] = items.entries;
    }
  }
  const notice = {};
  for (const [tl, entry] of Object.entries(store.notice || {})) {
    if (entry.complete) notice[tl] = { notice: entry.notice, readEnglish: entry.readEnglish, dismiss: entry.dismiss };
  }
  const header = `/**\n * AUTO-GENERATED by scripts/translate-post-faqs.mjs (machine translation).\n * AI drafts — Ahmed reviews before anything is treated as final.\n * Missing locales/slugs fall back to English at runtime.\n */\n`;
  fs.writeFileSync(
    OUT_FAQ_TS,
    `${header}export const POST_FAQ_TRANSLATIONS: Record<string, Record<string, { q: string; a: string }[]>> = ${JSON.stringify(faqs, null, 2)};\n`
  );
  fs.writeFileSync(
    OUT_NOTICE_TS,
    `${header}export const TRANSLATION_NOTICE_TEXT: Record<string, { notice: string; readEnglish: string; dismiss: string }> = ${JSON.stringify(notice, null, 2)};\n`
  );
}

async function main() {
  const faqsEn = extractPostFaqs();
  const slugs = Object.keys(faqsEn);
  console.log(`source FAQs: ${slugs.length} slugs, ${slugs.reduce((n, s) => n + faqsEn[s].length, 0)} entries`);

  let store = { meta: {}, faqs: {}, notice: {} };
  if (fs.existsSync(STORE)) {
    try { store = JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { /* start fresh */ }
  }
  store.meta = {
    generatedAt: new Date().toISOString(),
    engine: "google-translate-gtx (machine translation)",
    downstreamStatus: "ai_draft",
    note: "Machine-translated drafts. Require Ahmed's review before being treated as final.",
    qaIssues: store.meta.qaIssues || [],
  };
  store.faqs = store.faqs || {};
  store.notice = store.notice || {};

  let done = 0, skipped = 0, fallbacks = 0;
  // One job per (locale, slug): a job translates ALL of that slug's Q&As
  // sequentially. This keeps two workers from ever writing the same
  // slug-locale entry concurrently (the previous per-index jobs raced and
  // lost updates, leaving entries incomplete).
  const jobs = [];
  for (const tl of TARGETS) {
    for (const slug of slugs) jobs.push({ kind: "faq", tl, slug });
    jobs.push({ kind: "notice", tl });
  }
  const total = jobs.length;
  let cursor = 0;
  const checkpoint = () => {
    fs.writeFileSync(STORE, JSON.stringify(store));
    emitTs(store);
    console.log(`progress: ${done + skipped}/${total} (done=${done} skipped=${skipped} fallbacks=${fallbacks})`);
  };

  async function translateOne(job) {
    if (job.kind === "faq") {
      const { tl, slug } = job;
      const cur = store.faqs[tl]?.[slug];
      if (cur?.complete) return "skipped";
      const entries = (cur?.entries || []).slice();
      while (entries.length < faqsEn[slug].length) entries.push(null);
      for (let idx = 0; idx < faqsEn[slug].length; idx++) {
        if (entries[idx]?.q && entries[idx]?.a) continue; // already translated (resume)
        const srcEntry = faqsEn[slug][idx];
        const entry = { q: "", a: "" };
        for (const field of ["q", "a"]) {
          try {
            const tr = await translateText(srcEntry[field], tl);
            if (!tr.trim()) throw new Error("empty translation");
            entry[field] = tr;
          } catch {
            store.meta.qaIssues.push({ slug, locale: tl, issues: ["translate-failed"], field, text: srcEntry[field].slice(0, 80) });
            entry[field] = srcEntry[field];
            fallbacks++;
          }
        }
        entries[idx] = entry;
      }
      const complete = entries.every((e) => e && e.q && e.a);
      store.faqs[tl] = store.faqs[tl] || {};
      store.faqs[tl][slug] = { complete, entries };
      return complete ? "done" : "partial";
    }
    // notice
    const { tl } = job;
    if (store.notice[tl]?.complete) return "skipped";
    const entry = {};
    for (const field of ["notice", "readEnglish", "dismiss"]) {
      try {
        const tr = await translateText(NOTICE_EN[field], tl);
        if (!tr.trim()) throw new Error("empty translation");
        entry[field] = tr;
      } catch {
        store.meta.qaIssues.push({ slug: "__notice__", locale: tl, issues: ["translate-failed"], field, text: NOTICE_EN[field].slice(0, 80) });
        entry[field] = NOTICE_EN[field];
        fallbacks++;
      }
    }
    entry.complete = true;
    store.notice[tl] = entry;
    return "done";
  }

  async function worker() {
    while (cursor < jobs.length) {
      const i = cursor++;
      const job = jobs[i];
      try {
        const r = await translateOne(job);
        if (r === "skipped") skipped++;
        else done++;
      } catch (e) {
        console.error(`FAILED ${job.kind}/${job.tl}/${job.slug || ""}: ${e.message}`);
      }
      if ((done + skipped) % 20 === 0) checkpoint();
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, worker));
  checkpoint();
  console.log(`COMPLETE: done=${done} skipped=${skipped} fallbacks=${fallbacks} qaIssues=${store.meta.qaIssues.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
