import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { TranslationForm } from "../TranslationForm";
import { db } from "@/lib/db";
import { LOCALES, getLocaleMeta } from "@/i18n/routing";

export default async function EditTranslation({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await db.growingItemTranslation.findUnique({
    where: { id },
    include: { item: { select: { name: true } } },
  });
  if (!t) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${t.item.name} — ${getLocaleMeta(t.locale).name}`} />
      <TranslationForm
        initial={{
          id: t.id,
          growingItemId: t.growingItemId, locale: t.locale,
          name: t.name, localName: t.localName ?? "",
          description: t.description ?? "", growingNotes: t.growingNotes ?? "",
          status: t.status,
        }}
        itemOptions={[{ value: t.growingItemId, label: t.item.name }]}
        localeOptions={LOCALES.map((l) => ({ value: l.code, label: `${l.name} (${l.nativeName})` }))}
        locked
      />
    </div>
  );
}
