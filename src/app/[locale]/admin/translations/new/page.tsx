import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { TranslationForm } from "../TranslationForm";
import { db, isDbConfigured } from "@/lib/db";
import { LOCALES } from "@/i18n/routing";

export default async function NewTranslation({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ itemId?: string; locale?: string }>;
}) {
  const { locale } = await params;
  const { itemId = "", locale: preLocale = "en" } = await searchParams;
  setRequestLocale(locale);

  const items = isDbConfigured()
    ? await db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="New translation" />
      <TranslationForm
        initial={{
          id: null,
          growingItemId: itemId || items[0]?.id || "",
          locale: preLocale,
          name: "", localName: "", description: "", growingNotes: "",
          status: "draft",
        }}
        itemOptions={items.map((i) => ({ value: i.id, label: i.name }))}
        localeOptions={LOCALES.map((l) => ({ value: l.code, label: `${l.name} (${l.nativeName})` }))}
        locked={false}
      />
    </div>
  );
}
