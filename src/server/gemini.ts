/**
 * Gemini plant-diagnosis client (server-side only).
 * Uses the Generative Language REST API directly — no SDK dependency.
 * Never called without GEMINI_API_KEY; callers must handle the 501 path.
 */

export type DiagnosisIssue = {
  name: string;
  confidence: "high" | "medium" | "low";
  description: string;
};

export type DiagnosisResult = {
  likelyIssues: DiagnosisIssue[];
  recommendations: string[];
  urgency: "low" | "medium" | "high";
  needsExpert: boolean;
  disclaimer: string;
};

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

const SYSTEM_PROMPT = `You are an expert plant pathologist advising smallholder farmers in Pakistan and India.
Analyze the plant photo and the farmer's symptom description.
Respond ONLY with valid JSON (no markdown fences) matching this shape:
{
  "likelyIssues": [{ "name": "...", "confidence": "high|medium|low", "description": "..." }],
  "recommendations": ["..."],
  "urgency": "low|medium|high",
  "needsExpert": true|false,
  "disclaimer": "..."
}
Rules:
- List at most 3 likely issues, ordered by confidence.
- Be honest about uncertainty: use "low" confidence when the photo is unclear.
- Recommendations must be practical for smallholders (cultural controls first, then chemical only with safety notes).
- Never prescribe a specific pesticide brand; mention active ingredients generically where relevant.
- Always advise confirming with a local agriculture officer before spraying.
- Keep descriptions concise (1-2 sentences each).`;

export async function diagnosePlant(input: {
  imageBase64: string;
  mimeType: string;
  symptoms: string;
  cropHint: string | null;
}): Promise<DiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const userText = [
    input.cropHint ? `Crop (farmer's guess): ${input.cropHint}` : "Crop: unknown",
    `Symptoms described by farmer: ${input.symptoms}`,
  ].join("\n");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            parts: [
              { text: userText },
              { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1200, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const text: string | undefined =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new Error("Gemini returned an empty response.");

  let parsed: DiagnosisResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned an unparseable response.");
  }
  if (!Array.isArray(parsed.likelyIssues) || !Array.isArray(parsed.recommendations)) {
    throw new Error("Gemini returned a malformed diagnosis.");
  }
  return {
    likelyIssues: parsed.likelyIssues.slice(0, 3),
    recommendations: parsed.recommendations.slice(0, 8),
    urgency: ["low", "medium", "high"].includes(parsed.urgency) ? parsed.urgency : "medium",
    needsExpert: !!parsed.needsExpert,
    disclaimer:
      parsed.disclaimer ||
      "AI-assisted guidance only — confirm with your local agriculture officer before treating the crop.",
  };
}
