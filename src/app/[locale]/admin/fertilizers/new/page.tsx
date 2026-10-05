import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { FertilizerForm } from "../FertilizerForm";

export default async function NewFertilizer({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New fertilizer" />
      <FertilizerForm
        initial={{
          id: null, slug: "", name: "", urdu: null,
          n: 0, p: 0, k: 0, tagline: null,
          description: "", benefits: [], precautions: [],
          application: "", published: true,
        }}
      />
    </div>
  );
}
