import { getTranslations } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/Card";
import { FaqJsonLd } from "@/components/seo/JsonLd";

export interface FertilizerFaqProps {
  /** Fertilizer slug (e.g. "dap", "urea"). */
  slug: string;
  /** Localized fertilizer display name, used in the heading. */
  name: string;
}

/** Slugs that have FAQ entries under the `fertilizers.faqs` message key. */
const FAQ_SLUGS = [
  "dap",
  "urea",
  "mop",
  "ammonium-sulphate",
  "farmyard-manure",
  "vermicompost",
];

interface FaqItem {
  q: string;
  a: string;
}

/**
 * "Common questions" FAQ for fertilizer detail pages — search-driven Q&A
 * (e.g. "What is DAP fertilizer?", "How long does urea last in soil?").
 *
 * Rendered as an accessible <details>/<summary> accordion with FAQPage
 * JSON-LD for SEO. Renders nothing for slugs without FAQ entries, so the
 * page layout is untouched for other fertilizers.
 */
export async function FertilizerFaq({ slug, name }: FertilizerFaqProps) {
  if (!FAQ_SLUGS.includes(slug)) return null;

  const t = await getTranslations("fertilizers");
  let faqs: FaqItem[] = [];
  try {
    const raw = t.raw(`faqs.${slug}`) as unknown;
    if (!Array.isArray(raw)) return null;
    faqs = raw as FaqItem[];
  } catch {
    return null;
  }
  if (faqs.length === 0) return null;

  return (
    <Card>
      <CardBody>
        <FaqJsonLd items={faqs} />
        <h2 className="font-display text-xl font-semibold mb-1">
          {t("detailFaqTitle", { name })}
        </h2>
        <div className="divide-y divide-line rounded-xl border border-line overflow-hidden mt-4">
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
