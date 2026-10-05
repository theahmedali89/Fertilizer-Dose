import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { db, isDbConfigured } from "@/lib/db";
import { LOCALES } from "@/i18n/routing";

function chipClass(status: string | null): string {
  if (!status) return "border-dashed border-line text-ink-faint hover:border-leaf-600";
  if (status === "published" || status === "reviewed")
    return "border-leaf-300 dark:border-leaf-800 bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300 border";
  return "border-harvest-300 dark:border-harvest-800 bg-harvest-100 dark:bg-harvest-950 text-harvest-800 dark:text-harvest-300 border";
}

export default async function TranslationsAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [items, translations] = isDbConfigured()
    ? await Promise.all([
        db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
        db.growingItemTranslation.findMany({ select: { id: true, growingItemId: true, locale: true, status: true } }).catch(() => []),
      ])
    : [[], []];

  const byItem = new Map<string, Map<string, { id: string; status: string }>>();
  for (const t of translations) {
    if (!byItem.has(t.growingItemId)) byItem.set(t.growingItemId, new Map());
    byItem.get(t.growingItemId)!.set(t.locale, { id: t.id, status: t.status });
  }

  const totalCells = items.length * LOCALES.length;
  const filledCells = translations.length;

  return (
    <div>
      <AdminHeader title="Translations" actionHref="/admin/translations/new" actionLabel="+ New translation" />
      <p className="text-sm text-ink-soft mb-5">
        {filledCells} of {totalCells} item × language cells translated.
        <span className="text-ink-faint"> Green = published/reviewed · amber = needs review · dashed = missing.</span>
      </p>
      <div className="space-y-3">
        {items.map((item) => {
          const map = byItem.get(item.id);
          return (
            <Card key={item.id}>
              <CardBody>
                <p className="font-semibold mb-3">{item.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {LOCALES.map((l) => {
                    const t = map?.get(l.code);
                    return (
                      <Link
                        key={l.code}
                        href={t ? `/admin/translations/${t.id}` : `/admin/translations/new?itemId=${item.id}&locale=${l.code}`}
                        title={t ? `${l.name}: ${t.status}` : `${l.name}: missing`}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${chipClass(t?.status ?? null)}`}
                      >
                        {l.code}
                      </Link>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          );
        })}
        {!items.length && (
          <p className="text-sm text-ink-soft border border-dashed border-line rounded-2xl px-5 py-8 text-center">
            No growing items yet.
          </p>
        )}
      </div>
    </div>
  );
}
