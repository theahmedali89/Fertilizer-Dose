import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { CountryForm } from "../CountryForm";

export default async function NewCountry({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New country" />
      <CountryForm
        initial={{ id: null, code: "", name: "", slug: "", defaultUnit: "acre", status: "active" }}
      />
    </div>
  );
}
