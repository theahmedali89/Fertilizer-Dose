/**
 * RelatedTools — shared cross-linking card for all six agricultural tools.
 * Ahmed's explicit order: every tool page links to the other tools.
 * Compact, tasteful, one section per tool page. The current page is shown
 * as non-clickable (aria-current) to avoid a self-link.
 */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";

const TOOLS = [
  { href: "/calculator", navKey: "calculator" },
  { href: "/soil-test-calculator", navKey: "soilTestCalculator" },
  { href: "/plant-dose-calculator", navKey: "plantDoseCalculator" },
  { href: "/land-area-calculator", navKey: "landAreaCalculator" },
  { href: "/profit-calculator", navKey: "profitCalculator" },
  { href: "/compare", navKey: "compare" },
] as const;

export function RelatedTools({ current }: { current: string }) {
  const tNav = useTranslations("nav");
  const t = useTranslations("landArea");
  return (
    <div className="bg-surface border-t border-line">
      <Section eyebrow={t("relatedTitle")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TOOLS.map((tool) => {
            const isCurrent = tool.href === current;
            const label = tNav(tool.navKey);
            const inner = (
              <CardBody className="py-4 px-4">
                <p className={`text-sm font-semibold ${isCurrent ? "text-ink-soft" : "text-leaf-700 dark:text-leaf-300"}`}>
                  {label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-ink-soft mt-1">{t("relatedCurrent")}</p>
                )}
              </CardBody>
            );
            return (
              <Card key={tool.href} className={isCurrent ? "opacity-70" : "hover:border-leaf-500 transition-colors"}>
                {isCurrent ? (
                  <div aria-current="page">{inner}</div>
                ) : (
                  <Link href={tool.href} className="block h-full">{inner}</Link>
                )}
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
