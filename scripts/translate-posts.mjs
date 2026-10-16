/**
 * Machine-translate FertDose blog posts (title/excerpt/body) into all
 * non-English locales.
 *
 * Output: prisma/data/post-translations.json (resume-safe: skips entries
 * already present). Every row is marked status "ai_draft" downstream —
 * Ahmed reviews before anything is treated as final.
 *
 * QA per paragraph: paragraph count preserved, "## " headings intact,
 * URLs/paths from the source still present. Failed paragraphs fall back
 * to English and are logged in meta.qaIssues (honest, never silent).
 *
 * Usage: node scripts/translate-posts.mjs [--limit N] [--locales ur,hi]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "prisma/data/blog-posts-source.json");
const OUT = path.join(ROOT, "prisma/data/post-translations.json");

const LOCALES = ["ur","hi","es","ru","fr","de","it","pt","bn","ja","ko","ms","pl","id","ar","bg","tr","sv"];
const CHUNK = 4000; // max chars per GT request
const DELAY_MS = parseInt(process.env.TR_DELAY_MS || "600", 10);
const WORKERS = parseInt(process.env.TR_WORKERS || "2", 10);

const args = process.argv.slice(2);
function flag(name) {
  const i = args.findIndex((a) => a === name || a.startsWith(name + "="));
  if (i === -1) return undefined;
  if (args[i].includes("=")) return args[i].split("=").slice(1).join("=");
  return args[i + 1];
}
const LIMIT = flag("--limit") ? parseInt(flag("--limit"), 10) : Infinity;
const TARGETS = flag("--locales") ? flag("--locales").split(",") : LOCALES;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function splitChunks(text) {
  if (text.length <= CHUNK) return [text];
  // split on sentence boundaries, never mid-word
  const parts = [];
  let cur = "";
  for (const sent of text.split(/(?<=[.!?])\s+/)) {
    if ((cur + " " + sent).length > CHUNK && cur) { parts.push(cur); cur = sent; }
    else cur = cur ? cur + " " + sent : sent;
  }
  if (cur) parts.push(cur);
  return parts;
}

async function gt(text, tl, attempt = 1) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.status === 429) {
      // rate-limited: back off hard, then retry (up to 6 attempts)
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
    if (/HTTP 429/.test(e.message)) throw e; // already backed off above
    if (attempt >= 4) throw e;
    await sleep(1500 * attempt);
    return gt(text, tl, attempt + 1);
  }
}

async function translateText(text, tl) {
  const chunks = splitChunks(text);
  const out = [];
  for (const c of chunks) {
    out.push(await gt(c, tl));
    await sleep(DELAY_MS);
  }
  return out.join(" ");
}

const URL_RE = /(https?:\/\/[^\s)>\]]+|\/[a-z0-9][a-z0-9/_.-]*)/gi;
function urlsOf(s) {
  return [...new Set([...s.matchAll(URL_RE)].map((m) => m[0]))].filter((u) => u.length > 4);
}

function qaParagraph(src, tr) {
  const issues = [];
  if (!tr || !tr.trim()) issues.push("empty");
  if (src.startsWith("## ") && !tr.startsWith("## ")) issues.push("heading-marker-lost");
  for (const u of urlsOf(src)) {
    if (!tr.includes(u)) { issues.push(`url-lost:${u}`); break; }
  }
  return issues;
}

async function main() {
  const posts = JSON.parse(fs.readFileSync(SRC, "utf8")).slice(0, LIMIT);
  let store = { meta: {}, translations: {} };
  if (fs.existsSync(OUT)) {
    try { store = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch { /* start fresh */ }
  }
  store.meta = {
    generatedAt: new Date().toISOString(),
    engine: "google-translate-gtx (machine translation)",
    downstreamStatus: "ai_draft",
    note: "Machine-translated drafts. Require Ahmed's review before being treated as final.",
    qaIssues: store.meta.qaIssues || [],
  };
  store.translations = store.translations || {};

  async function translateEntry(post, tl) {
    const entry = { title: "", excerpt: "", body: [] };
    entry.title = await translateText(post.title, tl);
    entry.excerpt = await translateText(post.excerpt, tl);
    for (const para of post.body) {
      let tr;
      try {
        tr = await translateText(para, tl);
        const issues = qaParagraph(para, tr);
        if (issues.length) {
          // one retry, then honest English fallback
          tr = await translateText(para, tl);
          const issues2 = qaParagraph(para, tr);
          if (issues2.length) {
            store.meta.qaIssues.push({ slug: post.slug, locale: tl, issues: issues2, paragraph: para.slice(0, 80) });
            tr = para; // keep English rather than ship broken markup
            fallbacks++;
          }
        }
      } catch {
        store.meta.qaIssues.push({ slug: post.slug, locale: tl, issues: ["translate-failed"], paragraph: para.slice(0, 80) });
        tr = para;
        fallbacks++;
      }
      entry.body.push(tr);
    }
    entry.complete = true;
    return entry;
  }

  const jobs = [];
  for (const post of posts) {
    store.translations[post.slug] = store.translations[post.slug] || {};
    for (const tl of TARGETS) jobs.push([post, tl]);
  }

  let done = 0, skipped = 0, fallbacks = 0, cursor = 0;
  const total = jobs.length;
  const checkpoint = () => {
    fs.writeFileSync(OUT, JSON.stringify(store));
    console.log(`progress: ${done + skipped}/${total} (done=${done} skipped=${skipped} fallbacks=${fallbacks})`);
  };

  async function worker() {
    while (cursor < jobs.length) {
      const i = cursor++;
      const [post, tl] = jobs[i];
      if (store.translations[post.slug][tl]?.complete) { skipped++; }
      else {
        try {
          store.translations[post.slug][tl] = await translateEntry(post, tl);
          done++;
        } catch (e) {
          console.error(`FAILED ${post.slug}/${tl}: ${e.message}`);
        }
      }
      if ((done + skipped) % 10 === 0) checkpoint();
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, worker));
  checkpoint();
  console.log(`COMPLETE: done=${done} skipped=${skipped} fallbacks=${fallbacks} qaIssues=${store.meta.qaIssues.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
