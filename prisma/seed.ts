/**
 * Seed the database from the app's existing static datasets.
 * Run: npx prisma db seed   (or: npx prisma migrate dev --seed)
 *
 * Idempotent: uses upserts on unique slugs, so re-running is safe.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { FERTILIZERS } from "../src/lib/agronomy";
import { GROWING_ITEMS } from "../src/lib/growing";
import { REGIONS, PLANTING_WINDOWS } from "../src/lib/planting";
import { POSTS } from "../src/lib/blog";

const db = new PrismaClient();

async function main() {
  // ── Fertilizers ──
  for (const f of FERTILIZERS) {
    await db.fertilizer.upsert({
      where: { slug: f.slug },
      update: {
        name: f.name, urdu: f.urdu, n: f.n, p: f.p, k: f.k,
        tagline: f.tagline, description: f.description,
        benefits: f.benefits, precautions: f.precautions,
        application: f.application,
      },
      create: {
        slug: f.slug, name: f.name, urdu: f.urdu, n: f.n, p: f.p, k: f.k,
        tagline: f.tagline, description: f.description,
        benefits: f.benefits, precautions: f.precautions,
        application: f.application, published: true,
      },
    });
  }
  console.log(`fertilizers: ${FERTILIZERS.length}`);

  // ── Growing items (crops, plants, vegetables) ──
  for (const g of GROWING_ITEMS) {
    const item = await db.growingItem.upsert({
      where: { slug: g.slug },
      update: {
        name: g.name, urdu: g.urdu, scientificName: g.scientificName,
        category: g.category, plantSubcategory: g.plantSubcategory,
        season: g.season, seasonDetail: g.seasonDetail,
        sowingMonths: g.sowingMonths, harvestPeriod: g.harvestPeriod,
        soil: g.soil, water: g.water, sunlight: g.sunlight,
        climate: g.climate, regions: g.regions,
        npkN: g.npk?.n ?? null, npkP: g.npk?.p ?? null, npkK: g.npk?.k ?? null,
        npkSource: g.npkSource,
        verificationStatus: g.verificationStatus as VerificationStatus,
        indexable: g.indexable,
      },
      create: {
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
      },
    });
    // stages
    await db.growthStage.deleteMany({ where: { itemId: item.id } });
    for (let i = 0; i < g.stages.length; i++) {
      const s = g.stages[i];
      await db.growthStage.create({
        data: { itemId: item.id, name: s.name, timing: s.timing, note: s.note, position: i },
      });
    }
  }
  console.log(`growing items: ${GROWING_ITEMS.length}`);

  // ── Regions ──
  const regionIdBySlug = new Map<string, string>();
  for (const r of REGIONS) {
    const rec = await db.region.upsert({
      where: { slug: r.id },
      update: { country: r.country, name: r.name },
      create: { slug: r.id, country: r.country, name: r.name },
    });
    regionIdBySlug.set(r.id, rec.id);
  }
  console.log(`regions: ${REGIONS.length}`);

  // ── Planting windows ──
  await db.plantingWindow.deleteMany({});
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
    // editorial source record
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
  console.log(`planting windows: ${windowCount}`);

  // ── Blog posts ──
  for (const p of POSTS) {
    await db.post.upsert({
      where: { slug: p.slug },
      update: { title: p.title, excerpt: p.excerpt, body: p.body.join("\n\n"), category: p.category },
      create: {
        slug: p.slug, title: p.title, excerpt: p.excerpt,
        body: p.body.join("\n\n"), category: p.category,
        published: true, publishedAt: new Date(p.date),
      },
    });
  }
  console.log(`posts: ${POSTS.length}`);

  // ── FAQ (from the English dictionary) ──
  const faqItems: { q: string; a: string }[] = (
    await import("../src/messages/en.json")
  ).default.faq.items;
  await db.faq.deleteMany({});
  for (let i = 0; i < faqItems.length; i++) {
    await db.faq.create({
      data: { question: faqItems[i].q, answer: faqItems[i].a, position: i, published: true },
    });
  }
  console.log(`faqs: ${faqItems.length}`);

  // ── Settings ──
  await db.setting.upsert({
    where: { key: "site.name" },
    update: {},
    create: { key: "site.name", value: "Fertilizer Dose" },
  });

  console.log("seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
