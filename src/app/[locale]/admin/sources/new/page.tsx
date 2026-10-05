import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { SourceForm } from "../SourceForm";

export default async function NewSource({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New source" />
      <SourceForm
        initial={{
          id: null, organization: "", title: "", url: "", country: "", region: "",
          sourceType: "", verificationStatus: "under_review", notes: "",
        }}
      />
    </div>
  );
}
