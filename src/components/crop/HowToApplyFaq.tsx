import { Card, CardBody } from "@/components/ui/Card";
import { FaqJsonLd } from "@/components/seo/JsonLd";

export interface HowToApplyFaqProps {
  /** Crop display name, used to personalize the questions (e.g. "wheat"). */
  cropName: string;
}

function faqsFor(cropName: string): { q: string; a: string }[] {
  return [
    {
      q: `What is the correct way to flood DAP for ${cropName}?`,
      a: "Dissolve the DAP with a DAP solvent in a drum so it fully dissolves. Do NOT open the drum valve at the start of irrigation — wait until the water has covered about 25% of the plot (roughly 1–1.5 kanal in). Then open the valve. Close the drum valve about 10 minutes before you stop the water, so the last flow of water carries the dissolved fertilizer evenly to the far end of the field.",
    },
    {
      q: `Should urea be flooded with irrigation water, or broadcast afterwards?`,
      a: "Do NOT flood urea. Flooding loses 40–50% of nitrogen through leaching (deep percolation) and denitrification (lost as gas). Instead, broadcast (chhatta) the urea 1–3 days after irrigation, when the soil is moist (tar-wattar condition). This gives 30%+ better absorption than flooding.",
    },
    {
      q: "How can I distribute fertilizer evenly across the field?",
      a: "Open the fertilizer drum valve only after irrigation water has already entered 1–1.5 kanal — opening it too early empties the drum before the far end is reached. If the field is not laser-leveled, divide one acre into 2–4 plots (kyare): 2 plots for heavy clay soils, 3–4 for loam, and fertigate each plot separately. Keep checking both the field and the drum during irrigation until you get a feel for the timing.",
    },
    {
      q: "When should phosphorus and potash be applied?",
      a: "Phosphorus (P₂O₅) and potash (K₂O) are best applied at sowing as a basal dose, placed in the seedbed. If you missed it at sowing, dissolve the fertilizer (use a DAP solvent for DAP) and flood it at the first or second irrigation — flooding is far more effective than broadcasting for phosphorus and potash at that stage.",
    },
  ];
}

/**
 * "How to Apply" FAQ — practical fertigation/application guidance for farmers.
 *
 * Rendered as an accessible <details>/<summary> accordion with FAQPage
 * JSON-LD for SEO. Place near the fertilizer recommendation on crop pages.
 */
export function HowToApplyFaq({ cropName }: HowToApplyFaqProps) {
  const faqs = faqsFor(cropName);

  return (
    <Card>
      <CardBody>
        <FaqJsonLd items={faqs} />
        <h2 className="font-display text-xl font-semibold mb-1">
          How to Apply Fertilizer Correctly
        </h2>
        <p className="text-sm text-ink-faint mb-4">
          Practical field advice for {cropName} — knowing <em>how</em> to apply
          fertilizer matters as much as knowing how much.
        </p>
        <div className="divide-y divide-line rounded-xl border border-line overflow-hidden">
          {faqs.map((f, i) => (
            <details key={i} className="group bg-surface">
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-2 transition-colors list-none [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-leaf-700 dark:text-leaf-300 transition-transform group-open:rotate-45 text-lg leading-none"
                >
                  +
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-ink-soft leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
