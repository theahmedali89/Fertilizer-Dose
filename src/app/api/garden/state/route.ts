import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db, isDbConfigured } from "@/lib/db";

const plotSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  location: z.string().max(160).nullable().optional(),
  regionId: z.string().max(80).nullable().optional(),
  area: z.number().positive().max(100000),
  unit: z.enum(["acre", "kanal", "marla", "hectare"]),
  soilType: z.string().max(80).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

const plantingSchema = z.object({
  id: z.string().min(1).max(64),
  plotId: z.string().min(1).max(64),
  itemSlug: z.string().min(1).max(80),
  plantedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stage: z.string().max(80).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

const calculationSchema = z.object({
  id: z.string().min(1).max(64),
  cropSlug: z.string().min(1).max(80),
  area: z.number().positive().max(100000),
  unit: z.enum(["acre", "kanal", "marla", "hectare"]),
  products: z.array(z.object({ product: z.string().max(80), kg: z.number().min(0).max(100000) })).max(20),
  notes: z.string().max(2000).nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

const reminderSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(160),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plotId: z.string().max(64).nullable().optional(),
  plantingId: z.string().max(64).nullable().optional(),
  done: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
});

const stateSchema = z.object({
  plots: z.array(plotSchema).max(100),
  plantings: z.array(plantingSchema).max(500),
  calculations: z.array(calculationSchema).max(100),
  reminders: z.array(reminderSchema).max(200),
});

async function requireUserId() {
  const session = await auth().catch(() => null);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

const iso = (d: Date) => d.toISOString();

/** GET: full garden state for the signed-in user. */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const [plots, plantings, calculations, reminders] = await Promise.all([
      db.gardenPlot.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      db.planting.findMany({ where: { plot: { userId } }, orderBy: { createdAt: "asc" } }),
      db.savedCalculation.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.gardenReminder.findMany({ where: { userId }, orderBy: { dueDate: "asc" } }),
    ]);
    return NextResponse.json({
      plots: plots.map((p) => ({ ...p, createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt) })),
      plantings: plantings.map((p) => ({
        ...p, plantedOn: p.plantedOn.toISOString().slice(0, 10), createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt),
      })),
      calculations: calculations.map((c) => ({ ...c, createdAt: iso(c.createdAt) })),
      reminders: reminders.map((r) => ({
        ...r, dueDate: r.dueDate.toISOString().slice(0, 10), createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt),
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

/** PUT: replace the signed-in user's garden state (idempotent full sync). */
export async function PUT(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = stateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid garden state" }, { status: 400 });
  }
  const { plots, plantings, calculations, reminders } = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      // Delete in FK-safe order.
      await tx.gardenReminder.deleteMany({ where: { userId } });
      await tx.planting.deleteMany({ where: { plot: { userId } } });
      await tx.savedCalculation.deleteMany({ where: { userId } });
      await tx.gardenPlot.deleteMany({ where: { userId } });

      const plotIds = new Set(plots.map((p) => p.id));
      for (const p of plots) {
        await tx.gardenPlot.create({
          data: {
            id: p.id, userId, name: p.name,
            location: p.location ?? null, regionId: p.regionId ?? null,
            area: p.area, unit: p.unit, soilType: p.soilType ?? null,
            notes: p.notes ?? null,
            createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          },
        });
      }
      for (const pl of plantings) {
        if (!plotIds.has(pl.plotId)) continue;
        await tx.planting.create({
          data: {
            id: pl.id, plotId: pl.plotId, itemSlug: pl.itemSlug,
            plantedOn: new Date(pl.plantedOn), stage: pl.stage ?? null,
            notes: pl.notes ?? null,
            createdAt: pl.createdAt ? new Date(pl.createdAt) : undefined,
          },
        });
      }
      const plantingIds = new Set(plantings.map((p) => p.id));
      for (const c of calculations) {
        await tx.savedCalculation.create({
          data: {
            id: c.id, userId, cropSlug: c.cropSlug, area: c.area,
            unit: c.unit, products: c.products, notes: c.notes ?? null,
            createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          },
        });
      }
      for (const r of reminders) {
        if (r.plotId && !plotIds.has(r.plotId)) continue;
        if (r.plantingId && !plantingIds.has(r.plantingId)) continue;
        await tx.gardenReminder.create({
          data: {
            id: r.id, userId, title: r.title,
            dueDate: new Date(r.dueDate),
            plotId: r.plotId ?? null, plantingId: r.plantingId ?? null,
            done: r.done ?? false,
            createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
          },
        });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[garden] sync failed:", (e as Error).message);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
