import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { rateLimit } from "@/server/rate-limit";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "contributors");
const URL_PREFIX = "/uploads/contributors/";

// Magic-byte signatures we accept (never trust the client-sent MIME alone).
const SIGNATURES: Array<{ ext: string; test: (b: Buffer) => boolean }> = [
  { ext: "jpg", test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    test: (b) =>
      b.length > 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    ext: "webp",
    test: (b) =>
      b.length > 12 &&
      b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
  {
    ext: "gif",
    test: (b) =>
      b.length > 6 &&
      (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a"),
  },
];

/**
 * Minimal JPEG EXIF stripper: drops APP1 (Exif) segments without re-encoding.
 * No new dependencies (sharp is transitive-only here, so we don't rely on it).
 * PNG/WebP/GIF pass through — JPEG is where phone-camera EXIF/GPS lives.
 */
function stripJpegExif(buf: Buffer): Buffer {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  const out: Buffer[] = [buf.subarray(0, 2)]; // SOI
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    // Standalone markers (no length field)
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      out.push(buf.subarray(i, i + 2));
      i += 2;
      continue;
    }
    if (marker === 0xda) {
      // SOS — rest of file is scan data; copy verbatim and stop.
      out.push(buf.subarray(i));
      break;
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) break; // corrupt — bail safely
    const isApp1 = marker === 0xe1;
    if (!isApp1) out.push(buf.subarray(i, i + 2 + len));
    // else: drop the APP1 (Exif) segment
    i += 2 + len;
  }
  return Buffer.concat(out);
}

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? "unknown").trim();
}

/**
 * Contributor photo upload.
 * - Same rate limit as suggestions (10/hour per IP), no login required.
 * - Validates magic bytes + 2 MB cap; strips JPEG EXIF (GPS etc.).
 * - Stores under public/uploads/contributors/<random-hex>.<ext>; the URL is
 *   returned and must be attached to a suggestion — the photo is shown
 *   publicly ONLY after an admin approves that suggestion.
 * - NOTE: serverless runtimes (Vercel) have an ephemeral filesystem — uploads
 *   work on a persistent host; on Vercel consider Vercel Blob later.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`suggestion-upload:${clientKey(req)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many uploads. Please wait a while." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("image");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  const buf = Buffer.from(await (file as File).arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB." }, { status: 400 });
  }

  const sig = SIGNATURES.find((s) => s.test(buf));
  if (!sig) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP or GIF images are accepted." },
      { status: 400 }
    );
  }

  const clean = sig.ext === "jpg" ? stripJpegExif(buf) : buf;
  const name = `${randomBytes(16).toString("hex")}.${sig.ext}`;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, name), clean, { mode: 0o644 });
  } catch {
    return NextResponse.json({ error: "Could not store the image. Try without a photo." }, { status: 503 });
  }

  return NextResponse.json({ url: `${URL_PREFIX}${name}` }, { status: 201 });
}
