import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, isDbConfigured } from "@/lib/db";
import { diagnosePlant } from "@/server/gemini";
import { rateLimit } from "@/server/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map<string, number[]>([
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]], // "RIFF"
]);

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? "unknown").trim();
}

/**
 * Plant Doctor diagnosis endpoint.
 * - Validates upload (type via magic bytes, size ≤ 5 MB)
 * - Rate-limits: 10 diagnoses / hour per IP (20 for signed-in users)
 * - Calls Gemini server-side; stores the diagnosis when a database is set
 * - Returns 501 with a clear message when GEMINI_API_KEY is missing —
 *   we never invent a diagnosis.
 */
export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Plant Doctor AI is not enabled yet (missing API key). Please try again later." },
      { status: 501 }
    );
  }

  const session = await auth().catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const key = `plant-doctor:${userId ?? clientKey(req)}`;
  const limit = rateLimit(key, userId ? 20 : 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many diagnoses. Please wait a while and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const image = form.get("image");
  const symptoms = String(form.get("symptoms") ?? "").trim();
  const crop = String(form.get("crop") ?? "").trim() || null;

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "Please attach a plant photo." }, { status: 400 });
  }
  if (image.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo must be under 5 MB." }, { status: 400 });
  }
  if (symptoms.length < 10) {
    return NextResponse.json({ error: "Please describe the symptoms in at least a full sentence." }, { status: 400 });
  }
  if (symptoms.length > 2000) {
    return NextResponse.json({ error: "Symptom description is too long." }, { status: 400 });
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const entry = [...ALLOWED.entries()].find(([mime, magic]) =>
    magic.every((b, i) => bytes[i] === b) && (image.type === mime || !image.type)
  );
  if (!entry) {
    return NextResponse.json({ error: "Photo must be JPG, PNG or WebP." }, { status: 400 });
  }
  const [mimeType] = entry;

  try {
    const result = await diagnosePlant({
      imageBase64: Buffer.from(bytes).toString("base64"),
      mimeType,
      symptoms,
      cropHint: crop,
    });

    // Persist for history (best effort — never fails the diagnosis).
    if (isDbConfigured()) {
      try {
        await db.diagnosis.create({
          data: {
            userId,
            symptoms,
            cropHint: crop,
            result: result as unknown as object,
            confidence: result.likelyIssues[0]?.confidence ?? null,
          },
        });
      } catch (e) {
        console.error("[plant-doctor] failed to store diagnosis:", (e as Error).message);
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error("[plant-doctor]", (e as Error).message);
    return NextResponse.json(
      { error: "Diagnosis failed. Please try again in a moment." },
      { status: 502 }
    );
  }
}
