/**
 * Seed the database from the app's existing static datasets.
 * Run: npx prisma db seed
 *
 * INSERT-IF-MISSING semantics: existing records are NEVER overwritten,
 * so admin CMS edits always survive re-seeding. Safe to run on every deploy.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { FERTILIZERS } from "../src/lib/agronomy";
import { GROWING_ITEMS } from "../src/lib/growing";
import { REGIONS, PLANTING_WINDOWS } from "../src/lib/planting";
import { POSTS } from "../src/lib/blog";
import { seedBatch1 } from "./seed-batch1";
import { seedBatch2 } from "./seed-batch2";
import { seedBatch3 } from "./seed-batch3";
import { seedBatch4 } from "./seed-batch4";

const connectionString = process.env.DATABASE_URL ?? process.env.DATABASE_POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL (or DATABASE_POSTGRES_URL) is not set.");
}
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // ── Fertilizers (insert-if-missing by slug) ──
  let fCount = 0;
  for (const f of FERTILIZERS) {
    const exists = await db.fertilizer.findUnique({ where: { slug: f.slug }, select: { id: true } });
    if (!exists) {
      await db.fertilizer.create({
        data: {
          slug: f.slug, name: f.name, urdu: f.urdu, n: f.n, p: f.p, k: f.k,
          tagline: f.tagline, description: f.description,
          benefits: f.benefits, precautions: f.precautions,
          application: f.application, published: true,
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

  console.log("seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
