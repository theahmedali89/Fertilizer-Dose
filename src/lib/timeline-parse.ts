/**
 * Parses a fertilizer applicationMethod text into visual timeline stages.
 *
 * Handles common agronomy patterns:
 * - "50% N at sowing, 50% N at first irrigation (20-25 days)"
 * - "Basal: ... Top-dress: ... at 30-35 DAE"
 * - "1/3 at transplanting, 1/3 at 30 DAT, 1/3 at 60 DAT"
 * - "All P and K at sowing; remaining N in 2 splits"
 *
 * Falls back to a single stage when no split pattern is detected.
 */

export interface TimelineFertilizer {
  name: string;
  amount?: string;
}

export interface TimelineStage {
  /** Short label, e.g. "Sowing" / "First irrigation" */
  label: string;
  /** Day indicator, e.g. "Day 0", "Day 25–30", "DAT 30" */
  day?: string;
  fertilizers: TimelineFertilizer[];
  note?: string;
}

// Stage keywords mapped to friendly labels + day hints
const STAGE_PATTERNS: { re: RegExp; label: string; day?: string }[] = [
  { re: /\b(basal|sowing|planting|transplanting)\b/i, label: "Sowing / Planting", day: "Day 0" },
  { re: /first irrigation|1st irrigation/i, label: "First irrigation", day: "Day 20–25" },
  { re: /second irrigation|2nd irrigation/i, label: "Second irrigation", day: "Day 40–45" },
  { re: /bud[\s-]?break/i, label: "Bud break", day: "Spring" },
  { re: /bud initiation|flower(?:ing)? bud/i, label: "Bud initiation", day: "Day 35–40" },
  { re: /tillering/i, label: "Tillering", day: "Day 25–30" },
  { re: /booting/i, label: "Booting", day: "Day 45–50" },
  { re: /flowering|anthesis|bloom/i, label: "Flowering", day: "Day 50–60" },
  { re: /fruit set|berry[\s-]?set/i, label: "Fruit set", day: "Day 60–70" },
  { re: /veraison|color break/i, label: "Veraison", day: "Ripening" },
  { re: /earthing[\s-]?up/i, label: "Earthing-up", day: "Day 30–35" },
  { re: /top[\s-]?dress/i, label: "Top-dress", day: undefined },
  { re: /side[\s-]?dress/i, label: "Side-dress", day: undefined },
  { re: /pre[\s-]?bloom/i, label: "Pre-bloom", day: undefined },
  { re: /post[\s-]?harvest|after harvest/i, label: "Post-harvest", day: undefined },
];

// Fertilizer product names to detect in text
const FERTILIZER_PATTERNS: { re: RegExp; name: string }[] = [
  { re: /\burea\b/i, name: "Urea" },
  { re: /\bDAP\b/, name: "DAP" },
  { re: /\bMOP\b/, name: "MOP" },
  { re: /\bSOP\b/, name: "SOP" },
  { re: /\bSSP\b/, name: "SSP" },
  { re: /\bTSP\b/, name: "TSP" },
  { re: /\bNPK\s?15-15-15\b/i, name: "NPK 15-15-15" },
  { re: /\bNPK\s?20-10-10\b/i, name: "NPK 20-10-10" },
  { re: /muriate of potash/i, name: "MOP" },
  { re: /sulphate of potash/i, name: "SOP" },
  { re: /\bFYM\b|farmyard manure|gobar/i, name: "FYM" },
  { re: /gypsum/i, name: "Gypsum" },
  { re: /boron|borax|solubor/i, name: "Boron" },
  { re: /sulphur|\bsulfur\b/i, name: "Sulphur" },
  { re: /zinc|znso4/i, name: "Zinc" },
];

/** Extract "Day N" / "N DAT" / "N DAE" / "N days" hints from a text chunk. */
function extractDay(chunk: string): string | undefined {
  const m =
    chunk.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:days?|DAT|DAE)/i) ||
    chunk.match(/(?:day\s*)?(\d+)\s*(?:DAT|DAE)/i) ||
    chunk.match(/(\d+)\s*[-–]\s*(\d+)\s*din/i);
  if (m) {
    return m[2] ? `Day ${m[1]}–${m[2]}` : `Day ${m[1]}`;
  }
  const single = chunk.match(/(\d+)\s*days?\s*(?:after|baad)/i);
  if (single) return `Day ${single[1]}`;
  return undefined;
}

/** Find fertilizer mentions in a text chunk. */
function extractFertilizers(chunk: string): TimelineFertilizer[] {
  const found: TimelineFertilizer[] = [];
  const seen = new Set<string>();
  for (const { re, name } of FERTILIZER_PATTERNS) {
    if (re.test(chunk) && !seen.has(name)) {
      seen.add(name);
      // Try to grab an amount near the fertilizer name, e.g. "50 kg urea"
      const amt = chunk.match(new RegExp(`(\\d[\\d.,\\s-]*\\s*(?:kg|g)\\b)[^.;]{0,20}${name}|${name}[^.;]{0,30}(\\d[\\d.,\\s-]*\\s*(?:kg|g)\\b)`, "i"));
      found.push({ name, amount: amt ? (amt[1] || amt[2] || "").trim() : undefined });
    }
  }
  // Generic N/P/K split mentions like "50% N", "all P2O5"
  const npkBits: string[] = [];
  const pctN = chunk.match(/(\d+%|half|all|full|remaining)\s*[^.;,]{0,25}\bN\b/i);
  if (pctN) npkBits.push(pctN[0].trim());
  const pctP = chunk.match(/(\d+%|half|all|full)\s*[^.;,]{0,25}P2O5/i);
  if (pctP) npkBits.push(pctP[0].trim());
  const pctK = chunk.match(/(\d+%|half|all|full)\s*[^.;,]{0,25}K2O/i);
  if (pctK) npkBits.push(pctK[0].trim());
  for (const b of npkBits) {
    if (!seen.has(b)) {
      seen.add(b);
      found.push({ name: b });
    }
  }
  return found;
}

/**
 * Split method text into stage chunks. Splits on sentence boundaries and
 * on explicit split markers (";", "1.", "2.", "•", "–").
 */
function splitIntoChunks(method: string): string[] {
  return method
    .split(/(?:^|\s)[•\-–]\s+|;\s*|(?<=\.)\s+(?=[A-Z0-9(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

/**
 * Parse an applicationMethod (+ optional timing) into timeline stages.
 * Returns [] when the method is empty.
 */
export function parseApplicationTimeline(
  method: string | null | undefined,
  timing?: string | null | undefined
): TimelineStage[] {
  if (!method || !method.trim()) return [];

  const chunks = splitIntoChunks(method);
  const stages: TimelineStage[] = [];
  let stageNo = 0;

  for (const chunk of chunks) {
    // Find the best stage-pattern match
    let matched: (typeof STAGE_PATTERNS)[number] | undefined;
    for (const p of STAGE_PATTERNS) {
      if (p.re.test(chunk)) {
        matched = p;
        break;
      }
    }
    // Skip pure "note" chunks that carry no action (e.g. conflict warnings)
    // unless they are the only chunk.
    const isNote =
      /conflict|note:|warning|not a general/i.test(chunk) &&
      !/apply|apply|drill|broadcast|band|split|dose|top-dress|side-dress|incorporate/i.test(chunk);
    if (isNote && chunks.length > 1) continue;

    stageNo += 1;
    const day = extractDay(chunk) || matched?.day;
    const fertilizers = extractFertilizers(chunk);

    stages.push({
      label: matched?.label ?? `Stage ${stageNo}`,
      day,
      fertilizers,
      note: chunk.length > 160 ? chunk.slice(0, 157) + "…" : chunk,
    });
  }

  // If timing text adds day info the method lacks, attach to first stage.
  if (timing && stages.length > 0 && !stages[0].day) {
    const d = extractDay(timing);
    if (d) stages[0].day = d;
  }

  return stages;
}
