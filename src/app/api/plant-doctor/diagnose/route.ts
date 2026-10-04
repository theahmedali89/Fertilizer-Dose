import { NextRequest, NextResponse } from "next/server";

/**
 * Plant Doctor diagnosis endpoint — FRONTEND PHASE STUB.
 * Validates the upload like production will, but the Gemini call is not
 * wired yet (requires GEMINI_API_KEY). Returns 501 with a clear message
 * instead of faking a diagnosis — we never invent plant pathology results.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const image = form.get("image");
    const symptoms = String(form.get("symptoms") ?? "").trim();
    const crop = String(form.get("crop") ?? "").trim();

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Please attach a plant photo." }, { status: 400 });
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(image.type)) {
      return NextResponse.json({ error: "Photo must be JPG, PNG or WebP." }, { status: 400 });
    }
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Photo must be under 5 MB." }, { status: 400 });
    }
    if (symptoms.length < 10) {
      return NextResponse.json(
        { error: "Please describe the symptoms in a little more detail (at least a sentence)." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "AI diagnosis is not connected yet in this preview build. Your photo and description passed validation — connect a Gemini API key (server-side) to enable real diagnoses.",
        received: { fileName: image.name, sizeKb: Math.round(image.size / 1024), crop: crop || null },
      },
      { status: 501 }
    );
  } catch {
    return NextResponse.json({ error: "Could not read the request. Please try again." }, { status: 400 });
  }
}
