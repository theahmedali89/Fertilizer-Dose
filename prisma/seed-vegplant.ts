/**
 * Vegetable planting-window population — Ahmed approved 2026-10-07 ("han kro").
 * Research: ~/workspace/khaadguide/research-vegplant/ (566 windows, 17 countries).
 *
 * SCOPE: planting/sowing calendars ONLY (no NPK — that's a future batch).
 * - Creates PlantingWindow rows for vegetable items × regions.
 * - Statuses: researched "verified" → verified; everything else → under_review.
 *   (DE/FR editorials, KR blog-citations, CN mirror sources, TR greenhouse —
 *   all under_review on import per research concerns.)
 * - Nursery→transplant pairs stay as separate SOW + TRANSPLANT windows.
 * - Cross-year windows (startMonth > endMonth) preserved as-is.
 *
 * IDEMPOTENT: windows matched on (itemId, regionId, startMonth, endMonth,
 * activityType) — re-running never duplicates. Safe on every deploy.
 *
 * Data lives in prisma/data/vegplant/vegplant-data.json.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface VegSource {
  organization: string;
  title: string;
  url?: string | null;
}

interface VegWindow {
  itemSlug: string;
  regionSlug: string;
  startMonth: number;
  endMonth: number;
  activityType: string;
  harvestText?: string | null;
  notes?: string | null;
  source: VegSource;
  verificationStatus: string;
}

interface VegFile {
  windows: VegWindow[];
}

function loadVegFile(): VegFile {
  const p = join(process.cwd(), "prisma", "data", "vegplant", "vegplant-data.json");
  return JSON.parse(readFileSync(p, "utf8")) as VegFile;
}

const VALID_ACTIVITIES = new Set(["SOW", "TRANSPLANT", "PLANT", "HARVEST", "LAND_PREPARATION"]);

export async function seedVegplant(db: PrismaClient): Promise<void> {
  const f = loadVegFile();
  const windows = f.windows ?? [];
  console.log(`vegplant: ${windows.length} windows in file`);

  // ── Lookup maps ──
  const itemIdBySlug = new Map(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map(
      (i) => [i.slug, i.id] as const
    )
  );
  const regionIdBySlug = new Map(
    (await db.region.findMany({ select: { id: true, slug: true } })).map(
      (r) => [r.slug, r.id] as const
    )
  );

  // ── Sources (dedupe by organization+title) ──
  const sourceIdByKey = new Map<string, string>();
  let sourceCount = 0;
  for (const w of windows) {
    const s = w.source;
    const key = `${s.organization}||${s.title}`;
    if (sourceIdByKey.has(key)) continue;
    const existing = await db.source.findFirst({
      where: { organization: s.organization, title: s.title },
      select: { id: true },
    });
    if (existing) {
      sourceIdByKey.set(key, existing.id);
      continue;
    }
    const rec = await db.source.create({
      data: {
        organization: s.organization,
        title: s.title,
        url: s.url ?? null,
        verificationStatus: "under_review",
      },
    });
    sourceIdByKey.set(key, rec.id);
    sourceCount++;
  }
  console.log(`vegplant: sources created: ${sourceCount}`);

  // ── Planting windows (insert-if-missing) ──
  let created = 0;
  let skipped = 0;
  let verifiedCount = 0;
  let reviewCount = 0;
  let promoted = 0;
  for (const w of windows) {
    const itemId = itemIdBySlug.get(w.itemSlug);
    const regionId = regionIdBySlug.get(w.regionSlug);
    const sourceId = sourceIdByKey.get(`${w.source.organization}||${w.source.title}`);

    if (!itemId) {
      console.warn(`vegplant: skipped (unknown item): ${w.itemSlug}`);
      skipped++;
      continue;
    }
    if (!regionId) {
      console.warn(`vegplant: skipped (unknown region): ${w.regionSlug}`);
      skipped++;
      continue;
    }
    if (!sourceId) {
      console.warn(`vegplant: skipped (missing source): ${w.itemSlug}/${w.regionSlug}`);
      skipped++;
      continue;
    }

    const activityType = VALID_ACTIVITIES.has(w.activityType) ? w.activityType : "SOW";

    // Idempotency: same item+region+months+activity = same window
    const existing = await db.plantingWindow.findFirst({
      where: {
        itemId,
        regionId,
        startMonth: w.startMonth,
        endMonth: w.endMonth,
        activityType,
      },
      select: { id: true, verificationStatus: true },
    });
    // Status: only researched-"verified" becomes verified; all else under_review
    const status: VerificationStatus =
      w.verificationStatus === "verified" ? "verified" : "under_review";
    if (existing) {
      // Promote under_review → verified when the file now says verified.
      // Never demote verified → under_review (protects reviewed data).
      if (
        existing.verificationStatus === "under_review" &&
        status === "verified"
      ) {
        await db.plantingWindow.update({
          where: { id: existing.id },
          data: { verificationStatus: "verified" },
        });
        promoted++;
      }
      skipped++;
      continue;
    }
    // No exact match: check if this is a research-corrected months update.
    // If exactly ONE under_review record exists for item+region+activity
    // (different months), it's the outdated version — update it in place
    // instead of creating a duplicate.
    const siblings = await db.plantingWindow.findMany({
      where: { itemId, regionId, activityType, verificationStatus: "under_review" },
      select: { id: true, startMonth: true, endMonth: true },
    });
    if (siblings.length === 1 && status === "verified") {
      const sib = siblings[0];
      // Only update if months actually differ (avoid touching unrelated)
      if (sib.startMonth !== w.startMonth || sib.endMonth !== w.endMonth) {
        await db.plantingWindow.update({
          where: { id: sib.id },
          data: {
            startMonth: w.startMonth,
            endMonth: w.endMonth,
            harvestText: w.harvestText ?? null,
            notes: w.notes ?? null,
            verificationStatus: "verified",
          },
        });
        // Update source link
        await db.windowSource.deleteMany({ where: { windowId: sib.id } });
        await db.windowSource.create({ data: { windowId: sib.id, sourceId } });
        promoted++;
        skipped++;
        continue;
      }
    }
    if (status === "verified") verifiedCount++;
    else reviewCount++;

    const win = await db.plantingWindow.create({
      data: {
        itemId,
        regionId,
        activityType,
        startMonth: w.startMonth,
        endMonth: w.endMonth,
        harvestText: w.harvestText ?? null,
        notes: w.notes ?? null,
        verificationStatus: status,
      },
    });
    await db.windowSource.create({
      data: { windowId: win.id, sourceId },
    });
    created++;
  }

  // Cleanup: remove outdated under_review duplicates created before the
  // months-correction logic existed. For each item+region+activity group,
  // if a VERIFIED record exists and an UNDER_REVIEW record has different
  // months not present in the file, the under_review one is stale → delete.
  let cleaned = 0;
  {
    const fileKeys = new Set(
      windows.map((w) => `${w.itemSlug}|${w.regionSlug}|${w.activityType}|${w.startMonth}|${w.endMonth}`)
    );
    const allWindows = await db.plantingWindow.findMany({
      include: { item: { select: { slug: true } }, region: { select: { slug: true } } },
    });
    // Group by item+region+activity
    const groups = new Map<string, typeof allWindows>();
    for (const win of allWindows) {
      const key = `${win.item.slug}|${win.region.slug}|${win.activityType}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(win);
    }
    for (const [groupKey, wins] of groups) {
      const hasVerified = wins.some((w) => w.verificationStatus === "verified");
      if (!hasVerified) continue;
      for (const win of wins) {
        if (win.verificationStatus !== "under_review") continue;
        const fileKey = `${win.item.slug}|${win.region.slug}|${win.activityType}|${win.startMonth}|${win.endMonth}`;
        if (!fileKeys.has(fileKey)) {
          // Stale: under_review months not in file, but a verified version exists
          await db.windowSource.deleteMany({ where: { windowId: win.id } });
          await db.plantingWindow.delete({ where: { id: win.id } });
          cleaned++;
        }
      }
    }
  }
  console.log(
    `vegplant: windows created: ${created} (verified: ${verifiedCount}, under_review: ${reviewCount}), promoted to verified: ${promoted}, stale cleaned: ${cleaned}, skipped: ${skipped}`
  );
}
