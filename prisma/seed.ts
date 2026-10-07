/**
 * Seed the database from the app's existing static datasets.
 * Run: npx prisma db seed
 *
 * INSERT-IF-MISSING semantics: existing records are NEVER overwritten,
 * so admin CMS edits always survive re-seeding. Safe to run on every deploy.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { FERTILIZERS, ORGANIC_FERTILIZERS } from "../src/lib/agronomy";
import { GROWING_ITEMS } from "../src/lib/growing";
import { REGIONS, PLANTING_WINDOWS } from "../src/lib/planting";
import { POSTS } from "../src/lib/blog";
import { seedBatch1 } from "./seed-batch1";
import { seedBatch2 } from "./seed-batch2";
import { seedBatch3 } from "./seed-batch3";
import { seedBatch4 } from "./seed-batch4";
import { seedBatch5 } from "./seed-batch5";
import { seedBatch6 } from "./seed-batch6";
import { seedBatch7 } from "./seed-batch7";
import { seedBatch8 } from "./seed-batch8";
import { seedVegplant } from "./seed-vegplant";
import { seedTranslations } from "./seed-translations";

const connectionString = process.env.DATABASE_URL ?? process.env.DATABASE_POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL (or DATABASE_POSTGRES_URL) is not set.");
}
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // ── Fertilizers (insert-if-missing by slug) ──
  // Minerals (6, fixed label values) + organics (4, typical ranges, n/p/k NULL).
  let fCount = 0;
  for (const f of [...FERTILIZERS, ...ORGANIC_FERTILIZERS]) {
    const exists = await db.fertilizer.findUnique({ where: { slug: f.slug }, select: { id: true } });
    if (!exists) {
      await db.fertilizer.create({
        data: {
          slug: f.slug, name: f.name, urdu: f.urdu, n: f.n, p: f.p, k: f.k,
          tagline: f.tagline, description: f.description,
          benefits: f.benefits, precautions: f.precautions,
          application: f.application, published: true,
          fertilizerType: f.fertilizerType, organicCategory: f.organicCategory,
          nutrientValueType: f.nutrientValueType, nutrientNote: f.nutrientNote,
          nMin: f.nMin, nMax: f.nMax, pMin: f.pMin, pMax: f.pMax,
          kMin: f.kMin, kMax: f.kMax, sourceUrl: f.sourceUrl,
        },
      });
      fCount++;
    }
  }
  console.log(`fertilizers inserted: ${fCount}`);

  // ── Growing items (insert-if-missing by slug) ──
  let gCount = 0;
  for (const g of GROWING_ITEMS) {
    const exists = await db.growingItem.findUnique({ where: { slug: g.slug }, select: { id: true } });
    if (exists) continue;
    const item = await db.growingItem.create({
      data: {
        slug: g.slug, name: g.name, urdu: g.urdu,
        scientificName: g.scientificName, category: g.category,
        plantSubcategory: g.plantSubcategory, season: g.season,
        seasonDetail: g.seasonDetail, sowingMonths: g.sowingMonths,
        harvestPeriod: g.harvestPeriod, soil: g.soil, water: g.water,
        sunlight: g.sunlight, climate: g.climate, regions: g.regions,
        npkN: g.npk?.n ?? null, npkP: g.npk?.p ?? null, npkK: g.npk?.k ?? null,
        npkSource: g.npkSource,
        verificationStatus: g.verificationStatus as VerificationStatus,
        indexable: g.indexable, published: true,
        stages: {
          create: g.stages.map((s, i) => ({
            name: s.name, timing: s.timing, note: s.note, position: i,
          })),
        },
      },
    });
    void item;
    gCount++;
  }
  console.log(`growing items inserted: ${gCount}`);

  // ── Countries (insert-if-missing by code) ──
  // Phase A seeds only the 2 currently configured countries. Additional
  // countries are added via Admin → Countries (never invented in seed).
  const COUNTRIES = [
    { code: "PK", name: "Pakistan", slug: "pakistan", defaultUnit: "acre" },
    { code: "IN", name: "India", slug: "india", defaultUnit: "acre" },
  ];
  const countryIdByCode = new Map<string, string>();
  for (const c of COUNTRIES) {
    const rec = await db.country.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, name: c.name, slug: c.slug, defaultUnit: c.defaultUnit, status: "active" },
    });
    countryIdByCode.set(c.code, rec.id);
  }
  console.log(`countries: ${COUNTRIES.length}`);

  // ── Regions (insert-if-missing by slug) ──
  const regionIdBySlug = new Map<string, string>();
  const legacyCountryToCode: Record<string, string> = { pakistan: "PK", india: "IN" };
  for (const r of REGIONS) {
    let rec = await db.region.findUnique({ where: { slug: r.id } });
    if (!rec) {
      rec = await db.region.create({
        data: { slug: r.id, country: r.country, name: r.name },
      });
    }
    // Backfill countryId (idempotent): link legacy string country -> Country row.
    // The legacy `country` string column is kept during transition.
    if (!rec.countryId) {
      const code = legacyCountryToCode[r.country];
      const countryId = code ? countryIdByCode.get(code) : undefined;
      if (countryId) {
        rec = await db.region.update({
          where: { id: rec.id },
          data: { countryId },
        });
      }
    }
    regionIdBySlug.set(r.id, rec.id);
  }
  console.log(`regions: ${REGIONS.length}`);

  // ── Planting windows (seed only when table is empty) ──
  if ((await db.plantingWindow.count()) === 0) {
    const itemIdBySlug = new Map(
      (await db.growingItem.findMany({ select: { id: true, slug: true } })).map((i) => [i.slug, i.id] as const)
    );
    let windowCount = 0;
    for (const w of PLANTING_WINDOWS) {
      const itemId = itemIdBySlug.get(w.itemSlug);
      const regionId = regionIdBySlug.get(w.regionId);
      if (!itemId || !regionId) continue;
      const win = await db.plantingWindow.create({
        data: {
          itemId, regionId,
          startMonth: w.startMonth, endMonth: w.endMonth,
          harvestText: w.harvestText, notes: w.notes,
          verificationStatus: w.verificationStatus as VerificationStatus,
          lastReviewed: w.lastReviewed ? new Date(w.lastReviewed) : null,
        },
      });
      const src = await db.source.create({
        data: {
          organization: w.source.organization,
          title: w.source.title,
          country: w.source.country ?? null,
          region: w.source.region ?? null,
          lastReviewed: w.source.lastReviewed ? new Date(w.source.lastReviewed) : null,
        },
      });
      await db.windowSource.create({ data: { windowId: win.id, sourceId: src.id } });
      windowCount++;
    }
    console.log(`planting windows inserted: ${windowCount}`);
  } else {
    console.log("planting windows: skipped (already seeded)");
  }

  // ── Blog posts (insert-if-missing by slug) ──
  let pCount = 0;
  for (const p of POSTS) {
    const exists = await db.post.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (!exists) {
      await db.post.create({
        data: {
          slug: p.slug, title: p.title, excerpt: p.excerpt,
          body: p.body.join("\n\n"), category: p.category,
          published: true, publishedAt: new Date(p.date),
        },
      });
      pCount++;
    }
  }
  console.log(`posts inserted: ${pCount}`);

  // ── Blog post upgrade: fuller "dose per acre" guide body (guarded, one-time) ──
  // Updates the live DB row ONLY where the slug matches AND the body is still
  // the old short version (guarded by startsWith on the old first paragraph).
  // Idempotent (no match after first run) and admin-safe (skipped if an admin
  // already edited the post). Follows the NPK_CORRECTIONS precedent.
  {
    const upgraded = POSTS.find((p) => p.slug === "how-to-calculate-fertilizer-dose-per-acre");
    if (upgraded) {
      const r = await db.post.updateMany({
        where: {
          slug: upgraded.slug,
          body: { startsWith: "Every fertilizer recommendation starts as nutrients, not products." },
        },
        data: { body: upgraded.body.join("\n\n") },
      });
      console.log(`blog post upgrade applied: ${r.count}`);
    }
  }

  // ── Blog heading structure upgrade: ## / ### section headings (guarded, one-time) ──
  // Updates live DB rows ONLY where the slug matches AND the body still starts with
  // the old first paragraph (pre-headings version). Idempotent (no match after first
  // run) and admin-safe (skipped if an admin already edited the post body).
  // Follows the NPK_CORRECTIONS / blog-upgrade precedent.
  const BLOG_HEADING_GUARDS: Record<string, string> = {
    "how-to-calculate-fertilizer-dose-per-acre": "How much urea and DAP does one acre of wheat actually need? The reliable way is five steps: get a nutrient recommendation, check whether it is per hectare or per acre, convert the units, calculate each fertilizer with the standard formula, and split the dose across growth stages. Followed carefully, this turns any recommendation into an exact shopping list — for example, a 120-60-40 (illustrative) recommendation works out to about 1.7 bags of urea and 1 bag of DAP per acre.",
    "urea-vs-dap-what-each-does": "Urea (46% nitrogen) and DAP (18% nitrogen, 46% phosphate) are the two most-used fertilizers in Pakistan and India — and the most confused.",
    "why-soil-testing-saves-money": "Most farmers fertilize by habit: the same bags, every season, regardless of what the soil already holds. A soil test breaks that habit with facts.",
    "how-to-read-fertilizer-bag-label": "If you want to know how to read a fertilizer bag label, start with the three big numbers printed on the front, like 18-46-0 or 46-0-0. Those three numbers always stand for nitrogen (N), phosphorus (P), and potassium (K) in that exact order, and they tell you what percentage of the bag's weight is each nutrient. So a bag of urea labeled 46-0-0 contains 46 percent nitrogen, no phosphorus, and no potassium.",
    "organic-vs-chemical-fertilizer-pros-cons": "The organic vs chemical fertilizer debate usually gets framed as a fight, with one side cast as the villain. That framing helps nobody. Chemical fertilizers like urea and DAP supply nutrients in exact, fast-acting forms, while organic sources like farmyard manure and compost supply nutrients slowly along with organic matter. Both have genuine strengths and genuine drawbacks, and most experienced farmers end up using a mix rather than picking a team.",
    "fertilizer-burn-symptoms-and-fix": "Fertilizer burn symptoms are easy to misread, and that misreading costs farmers twice: first the damaged crop, then the wrong treatment. Burnt plants look thirsty, with brown crispy leaf margins, wilting even in moist soil, and young seedlings that emerge and then collapse. The direct answer is that fertilizer burn is salt injury, not a disease and not drought, and it happens when too much fertilizer salt sits near roots or on leaves, pulling water out of plant tissue instead of into it.",
    "too-much-dap-effects": "What happens if you apply too much DAP? The short, honest answer is that you waste money and can harm the crop, without gaining yield. DAP is 18-46-0, meaning 18 percent nitrogen and 46 percent phosphate, so an overdose hits the field with excess phosphorus and excess nitrogen at the same time, and each causes its own distinct problems. More fertilizer is not more food for the plant; past the recommended dose, it becomes a pollutant in your own soil.",
    "best-time-of-day-to-apply-fertilizer": "The best time of day to apply fertilizer is early morning or late in the evening. During these cooler hours the sun is low, the air is usually calm, and the soil is often damp from dew or the previous night. Those three conditions keep more of your fertilizer working for the plant and less of it lost to the air. The worst time, by contrast, is the middle of the day, when heat, bright sun, and wind all work against you.",
    "does-rain-wash-away-fertilizer": "Does rain wash away fertilizer? The honest answer is: it depends on the rain. A light shower after you spread fertilizer is usually good news, because it dissolves the granules and carries the nutrients down into the root zone. A heavy downpour right after application is bad news, because it can wash granules off the surface and push dissolved nutrients below the reach of the roots. Timing, intensity, soil type, and slope decide which outcome you get.",
    "foliar-spray-vs-soil-application": "Foliar spray vs soil application: which is better? Neither wins outright, because they do different jobs. Soil application is how you supply the bulk of a crop's nitrogen, phosphorus, and potassium, the macronutrients needed in large amounts. Foliar spraying, where dissolved nutrients are sprayed directly onto the leaves, is best for quick correction of specific deficiencies, especially micronutrients like zinc, iron, boron, and manganese. Most well-managed crops use soil feeding as the foundation and foliar sprays as the targeted tool.",
    "how-long-does-urea-last-in-soil": "How long does urea last in soil? The short answer is that urea itself usually disappears within a few days, but the nitrogen it supplies typically remains available to crops for a few weeks — sometimes longer in cool conditions, sometimes much shorter in hot, dry, or sandy soils. Urea does not sit in the soil unchanged waiting for the plant. The moment it touches moist soil, a chain of transformations begins, and each step moves nitrogen into a form that is either easier for plants to use or easier to lose.",
    "nitrogen-deficiency-symptoms-wheat": "Nitrogen deficiency symptoms in wheat almost always start the same way: the oldest, lowest leaves turn pale green, then yellow, beginning at the leaf tip and working inward, while the newest leaves at the top still look normal. This bottom-up pattern is the single most useful clue in the field. If the yellowing begins on the youngest leaves instead, you are likely looking at a different problem, such as sulfur deficiency, and treating for nitrogen will not fix it.",
    "phosphorus-deficiency-symptoms-rice": "Phosphorus deficiency in rice shows up as a distinctive combination: plants stay short and stunted, leaves take on an unusually dark, bluish-green color, and a reddish-purple discoloration spreads across the leaf blades and sheaths. Tillering drops off sharply, and the whole crop looks like it stopped growing weeks ago while the calendar kept moving. If your rice is short, dark, and purpling instead of tall and green, phosphorus is the first suspect.",
    "yellow-leaves-nutrient-guide": "Why are my plant leaves turning yellow? The short answer is that yellow leaves are the plant's distress signal for a nutrient problem — most often nitrogen — but the pattern of the yellowing tells you which nutrient is actually missing. Leaves turning yellow because of nutrient deficiency follow rules: if the oldest, lowest leaves yellow first, the missing nutrient is a mobile one the plant is pulling out of old tissue to feed new growth; if the youngest leaves at the shoot tips yellow first, the missing nutrient is immobile and cannot be relocated.",
    "npk-19-19-19-guide": "What is NPK 19-19-19 used for? It is a balanced complex fertilizer used when a crop needs nitrogen, phosphorus, and potassium in roughly equal amounts — one bag that feeds the plant all three primary nutrients at once. The numbers mean 19 percent nitrogen (N), 19 percent phosphate (P2O5), and 19 percent potash (K2O) by weight, so every 100 kg of the fertilizer carries 19 kg of each nutrient, 57 kg of plant food in total. It is the general-purpose workhorse of the fertilizer world: vegetables, fruits, flowers, and field crops at planting time.",
    "can-manure-replace-chemical-fertilizer": "Can manure replace chemical fertilizer? The honest answer is: partially yes, fully rarely — manure can replace a large share of your chemical fertilizer and improve your soil while doing it, but matching the full nutrient demand of a high-yielding crop with manure alone takes enormous quantities that most farms cannot supply, transport, or time precisely. Think of manure as the foundation and chemical fertilizer as the precision top-up, not as enemies where you must choose one.",
    "how-to-make-compost-at-home": "Learning how to make compost at home for crops comes down to one simple recipe: mix roughly three parts dry browns with one part fresh greens by volume, keep the pile as moist as a wrung-out sponge, turn it every two to three weeks, and in typically two to four months you will have dark, crumbly compost ready for the field. Everything below is just the detail that makes that recipe work reliably.",
    "how-to-take-soil-sample": "Here is how to take a soil sample for testing in one paragraph: sample each uniform part of the field separately, take six to eight cores at zero to fifteen centimetres depth in a zigzag pattern while avoiding odd spots, mix them thoroughly, reduce the mixture to about half a kilogram, label the bag clearly, and send it to the lab. The rest of this guide explains each step so the report you get back is actually worth acting on.",
    "urea-vs-dap-which-to-buy": "On the question of urea vs DAP, which to buy comes down to one rule: buy the nutrient you need, not the cheaper bag. Need phosphorus at sowing, buy DAP. Need only nitrogen for top-dressing, buy urea, because it is the cheaper nitrogen. And never compare bag prices; compare the price per kilogram of actual nutrient. That single habit will save you money every season.",
    "npk-fertilizer-calculation-formula": "Your agriculture officer says 'apply 120 kg nitrogen per hectare' — but the shop sells urea in 50 kg bags. How many bags do you actually need? The answer comes from one simple formula: fertilizer needed (kg) = (nutrient needed in kg ÷ percentage of that nutrient in the fertilizer) × 100. For example, 120 kg of nitrogen ÷ 46 × 100 = 261 kg of urea per hectare, because urea contains 46% nitrogen. This guide walks you through the formula step by step, with a complete worked example using urea, DAP and MOP, and the common mistakes that cost farmers money.",
    "organic-fertilizers-for-plants": "Organic fertilizers feed plants slowly by feeding the soil first. Unlike a bag of urea that delivers 46% nitrogen immediately, materials like farmyard manure, compost and vermicompost release nutrients gradually as microbes break them down — typically over weeks to months. As a rough orientation, well-rotted farmyard manure (FYM) contains about 0.5–1.0% nitrogen, 0.15–0.20% phosphate (P₂O₅) and 0.5–0.6% potash (K₂O) (FAO glossary of fertilizers and soil fertility terms). Compare that with urea's 46% nitrogen and the trade-off is clear: organics are bulky and slow, but they build soil structure that chemicals alone cannot.",
  };
  for (const p of POSTS) {
    const guard = BLOG_HEADING_GUARDS[p.slug];
    if (!guard) continue;
    const r = await db.post.updateMany({
      where: { slug: p.slug, body: { startsWith: guard } },
      data: { body: p.body.join("\n\n") },
    });
    if (r.count) console.log(`blog headings applied: ${p.slug}`);
  }

  // ── FAQ (seed only when table is empty) ──
  if ((await db.faq.count()) === 0) {
    const faqItems: { q: string; a: string }[] = (
      await import("../src/messages/en.json")
    ).default.faq.items;
    for (let i = 0; i < faqItems.length; i++) {
      await db.faq.create({
        data: { question: faqItems[i].q, answer: faqItems[i].a, position: i, published: true },
      });
    }
    console.log(`faqs inserted: ${faqItems.length}`);
  } else {
    console.log("faqs: skipped (already seeded)");
  }

  // ── Settings ──
  await db.setting.upsert({
    where: { key: "site.name" },
    update: {},
    create: { key: "site.name", value: "Fertilizer Dose" },
  });

  // ── Batch 1 agricultural data (PK/IN/BD) — idempotent, approved 2026-10-05 ──
  // Runs AFTER the base seed so countries/regions/items exist for FK lookup.
  await seedBatch1(db);

  // ── Batch 2 agricultural data (US/BR/ID/AU) — idempotent, approved 2026-10-05 ──
  await seedBatch2(db);

  // ── Batch 3 agricultural data (CN/TR/MY/JP/KR) — idempotent, approved 2026-10-05 ──
  await seedBatch3(db);

  // ── Batch 4 agricultural data (ES/FR/DE/IT/PL/RU) — idempotent, approved 2026-10-05 ──
  await seedBatch4(db);

  // ── Batch 5 agricultural data (barley/chickpea/mustard/sunflower/lentil × IN) — idempotent, approved 2026-10-06 ──
  await seedBatch5(db);

  // ── Batch 6 agricultural data (canola/sugar-beet/jute/durum-wheat/coffee × IN/PK) — idempotent, approved 2026-10-06 ──
  await seedBatch6(db);

  // ── Batch 7: held-record resolutions + rye/triticale/rubber/oil-palm — idempotent, approved 2026-10-07 ──
  await seedBatch7(db);

  // ── Batch 8: citrus/grape/olive × PK/IN — idempotent, approved 2026-10-07 ("yes populate kro 8 bach") ──
  await seedBatch8(db);

  // ── Vegetable planting windows (17 countries) — idempotent, approved 2026-10-07 ("han kro") ──
  await seedVegplant(db);

  // ── AI translations (draft, NOT native-reviewed) — approved 2026-10-06 ──
  await seedTranslations(db);

  console.log("seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
