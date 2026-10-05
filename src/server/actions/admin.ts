"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, isDbConfigured } from "@/lib/db";
import { requireStaff } from "@/server/require-auth";
import { SOURCE_TYPES, TRANSLATION_STATUSES } from "@/lib/adminLookups";

async function guard() {
  await requireStaff();
  if (!isDbConfigured()) throw new Error("Database is not configured.");
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

export type ActionResult = { ok: true } | { ok: false; error: string };
const fail = (error: string): ActionResult => ({ ok: false, error });

/** Human-readable zod error naming the offending fields. */
function invalidFields(error: z.ZodError): string {
  const fields = [...new Set(error.issues.map((i) => String(i.path[0] ?? "field")))];
  return `Please check these fields: ${fields.join(", ")}.`;
}

const str = z.string().trim();
const optStr = z.string().trim().optional().transform((v) => (v ? v : null));
const num = z.coerce.number();
const optNum = z.coerce.number().optional().nullable();
const bool = z.string().optional().transform((v) => v === "on");
const lines = z.string().transform((v) => v.split("\n").map((s) => s.trim()).filter(Boolean));

/* ── Fertilizers ── */

const fertilizerSchema = z.object({
  slug: str.min(2).max(80).regex(/^[a-z0-9-]+$/),
  name: str.min(2).max(120),
  urdu: optStr, n: num.min(0).max(100), p: num.min(0).max(100), k: num.min(0).max(100),
  tagline: optStr, description: str.min(10), benefits: lines, precautions: lines,
  application: str.min(10), published: bool,
});

export async function upsertFertilizer(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = fertilizerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check all fields (slug: lowercase letters, numbers, hyphens).");
  const d = parsed.data;
  try {
    if (id) {
      await db.fertilizer.update({ where: { id }, data: d });
    } else {
      await db.fertilizer.create({ data: d });
    }
  } catch (e) {
    return fail((e as Error).message.includes("Unique") ? "Slug already exists." : "Save failed.");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deleteFertilizer(id: string): Promise<ActionResult> {
  await guard();
  await db.fertilizer.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Growing items ── */

const growingSchema = z.object({
  slug: str.min(2).max(80).regex(/^[a-z0-9-]+$/),
  name: str.min(2).max(120),
  urdu: optStr, scientificName: optStr,
  category: z.enum(["crop", "plant", "vegetable"]),
  plantSubcategory: optStr,
  season: optStr, seasonDetail: optStr, sowingMonths: optStr, harvestPeriod: optStr,
  soil: optStr, water: optStr, sunlight: optStr, climate: optStr,
  regions: z.string().transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
  npkN: optNum, npkP: optNum, npkK: optNum, npkSource: optStr,
  verificationStatus: z.enum(["draft", "under_review", "verified", "published", "archived"]),
  indexable: bool, published: bool,
  stages: z.string().transform((v) =>
    v.split("\n").map((s) => s.trim()).filter(Boolean).map((line, i) => {
      const [name = "", timing = "", note = ""] = line.split("|").map((p) => p.trim());
      return { name, timing: timing || null, note: note || null, position: i };
    })
  ),
});

export async function upsertGrowingItem(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = growingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  const { stages, ...d } = parsed.data;
  try {
    if (id) {
      await db.growingItem.update({ where: { id }, data: d });
      await db.growthStage.deleteMany({ where: { itemId: id } });
    } else {
      const created = await db.growingItem.create({ data: d });
      id = created.id;
    }
    for (const s of stages) {
      await db.growthStage.create({ data: { itemId: id!, ...s } });
    }
  } catch (e) {
    return fail((e as Error).message.includes("Unique") ? "Slug already exists." : "Save failed.");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deleteGrowingItem(id: string): Promise<ActionResult> {
  await guard();
  await db.growingItem.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Blog posts ── */

const postSchema = z.object({
  slug: str.min(2).max(120).regex(/^[a-z0-9-]+$/),
  title: str.min(4).max(200), excerpt: str.min(10),
  body: str.min(20), category: optStr, published: bool,
});

export async function upsertPost(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  const d = parsed.data;
  const data = { ...d, publishedAt: d.published ? new Date() : null };
  try {
    if (id) await db.post.update({ where: { id }, data });
    else await db.post.create({ data });
  } catch {
    return fail("Save failed (slug may already exist).");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deletePost(id: string): Promise<ActionResult> {
  await guard();
  await db.post.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── FAQs ── */

const faqSchema = z.object({
  question: str.min(4), answer: str.min(4),
  position: z.coerce.number().int().default(0), published: bool,
});

export async function upsertFaq(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  const d = parsed.data;
  if (id) await db.faq.update({ where: { id }, data: d });
  else await db.faq.create({ data: d });
  revalidateAdmin();
  return { ok: true };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  await guard();
  await db.faq.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Countries ── */

const countrySchema = z.object({
  code: str
    .min(2)
    .max(4)
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z]{2,4}$/.test(v), { message: "Code must be 2–4 letters." }),
  name: str.min(2).max(120),
  slug: str.min(2).max(80).regex(/^[a-z0-9-]+$/),
  defaultUnit: z.enum(["acre", "hectare"]),
  status: z.enum(["active", "inactive"]),
});

export async function upsertCountry(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = countrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  try {
    if (id) await db.country.update({ where: { id }, data: parsed.data });
    else await db.country.create({ data: parsed.data });
  } catch {
    return fail("Save failed (code or slug may already exist).");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deleteCountry(id: string): Promise<ActionResult> {
  await guard();
  const [regions, recommendations, seasons] = await Promise.all([
    db.region.count({ where: { countryId: id } }),
    db.fertilizerRecommendation.count({ where: { countryId: id } }),
    db.season.count({ where: { countryId: id } }),
  ]);
  if (regions > 0 || recommendations > 0 || seasons > 0) {
    return fail(
      `Cannot delete: ${regions} region(s), ${recommendations} recommendation(s), ${seasons} season(s) linked to this country.`
    );
  }
  await db.country.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Regions (extended with countryId) ── */

const regionSchema = z.object({
  slug: str.min(2).max(80).regex(/^[a-z0-9-]+$/),
  countryId: str.min(1),
  name: str.min(2).max(120),
});

export async function upsertRegion(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = regionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  const country = await db.country.findUnique({ where: { id: parsed.data.countryId } });
  if (!country) return fail("Please select a valid country.");
  // Keep the legacy `country` string in sync (public pages filter on it).
  const data = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    countryId: country.id,
    country: country.slug,
  };
  try {
    if (id) await db.region.update({ where: { id }, data });
    else await db.region.create({ data });
  } catch {
    return fail("Save failed (slug may already exist).");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deleteRegion(id: string): Promise<ActionResult> {
  await guard();
  const used = await db.plantingWindow.count({ where: { regionId: id } });
  if (used > 0) return fail(`Cannot delete: ${used} planting window(s) use this region.`);
  await db.region.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Planting windows (extended: activityType + season) ── */

const ACTIVITY_TYPES = ["SOW", "TRANSPLANT", "PLANT", "HARVEST", "LAND_PREPARATION"] as const;

const windowSchema = z.object({
  itemId: str.min(1), regionId: str.min(1),
  activityType: z.enum(ACTIVITY_TYPES),
  seasonId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  startMonth: z.coerce.number().int().min(1).max(12),
  endMonth: z.coerce.number().int().min(1).max(12),
  harvestText: optStr, notes: optStr,
  verificationStatus: z.enum(["draft", "under_review", "verified", "published", "archived"]),
  sourceOrganization: str.min(2), sourceTitle: str.min(2),
  sourceCountry: optStr, sourceRegion: optStr,
});

export async function upsertWindow(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = windowSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  const { sourceOrganization, sourceTitle, sourceCountry, sourceRegion, ...d } = parsed.data;
  const win = id
    ? await db.plantingWindow.update({ where: { id }, data: d })
    : await db.plantingWindow.create({ data: d });
  const src = await db.source.create({
    data: {
      organization: sourceOrganization, title: sourceTitle,
      country: sourceCountry, region: sourceRegion,
    },
  });
  await db.windowSource.create({ data: { windowId: win.id, sourceId: src.id } });
  revalidateAdmin();
  return { ok: true };
}

export async function deleteWindow(id: string): Promise<ActionResult> {
  await guard();
  await db.plantingWindow.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Sources (extended: sourceType + verificationStatus) ── */

const sourceSchema = z.object({
  organization: str.min(2).max(160), title: str.min(2).max(240),
  url: optStr, country: optStr, region: optStr,
  sourceType: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  verificationStatus: z.enum(["draft", "under_review", "verified", "published", "archived"]),
  notes: optStr,
});

export async function upsertSource(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = sourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  if (id) await db.source.update({ where: { id }, data: parsed.data });
  else await db.source.create({ data: parsed.data });
  revalidateAdmin();
  return { ok: true };
}

export async function deleteSource(id: string): Promise<ActionResult> {
  await guard();
  await db.source.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Fertilizer recommendations ── */

const recommendationSchema = z.object({
  growingItemId: str.min(1),
  countryId: str.min(1),
  regionId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  variety: optStr,
  soilContext: optStr,
  irrigationContext: optStr,
  growthStage: optStr,
  n: optNum, p2o5: optNum, k2o: optNum,
  micronutrients: optStr,
  applicationTiming: optStr,
  applicationMethod: optStr,
  sourceId: str.min(1),
  verificationStatus: z.enum(["draft", "under_review", "verified", "published", "archived"]),
  lastReviewed: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
});

export async function upsertRecommendation(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = recommendationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  const d = parsed.data;
  // Region must belong to the selected country (when set).
  if (d.regionId) {
    const region = await db.region.findUnique({ where: { id: d.regionId } });
    if (!region || region.countryId !== d.countryId) {
      return fail("Selected region does not belong to the selected country.");
    }
  }
  const source = await db.source.findUnique({ where: { id: d.sourceId } });
  if (!source) return fail("A valid source is required.");
  try {
    if (id) await db.fertilizerRecommendation.update({ where: { id }, data: d });
    else await db.fertilizerRecommendation.create({ data: d });
  } catch {
    return fail("Save failed.");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deleteRecommendation(id: string): Promise<ActionResult> {
  await guard();
  await db.fertilizerRecommendation.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Growing item translations ── */

const translationSchema = z.object({
  growingItemId: str.min(1),
  locale: str.min(2).max(10),
  name: str.min(2).max(200),
  localName: optStr,
  description: optStr,
  growingNotes: optStr,
  status: z.enum(["draft", "machine_translated", "review_required", "reviewed", "published"]),
});

export async function upsertTranslation(id: string | null, formData: FormData): Promise<ActionResult> {
  await guard();
  const parsed = translationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(invalidFields(parsed.error));
  try {
    if (id) await db.growingItemTranslation.update({ where: { id }, data: parsed.data });
    else await db.growingItemTranslation.create({ data: parsed.data });
  } catch {
    return fail("Save failed (a translation for this item + locale may already exist).");
  }
  revalidateAdmin();
  return { ok: true };
}

export async function deleteTranslation(id: string): Promise<ActionResult> {
  await guard();
  await db.growingItemTranslation.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true };
}

/* ── Users (role management, ADMIN only) ── */

export async function setUserRole(userId: string, role: "USER" | "EDITOR" | "ADMIN"): Promise<ActionResult> {
  const me = await requireStaff();
  if (me.role !== "ADMIN") return fail("Only admins can change roles.");
  if (!isDbConfigured()) return fail("Database is not configured.");
  if (me.id === userId && role !== "ADMIN") {
    return fail("You cannot demote your own account.");
  }
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidateAdmin();
  return { ok: true };
}
