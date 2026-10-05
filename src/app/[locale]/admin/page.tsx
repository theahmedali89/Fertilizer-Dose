import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { AdminHeader } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";

async function getCounts() {
  if (!isDbConfigured()) return null;
  try {
    const [fertilizers, growing, windows, regions, posts, faqs, users, diagnoses] = await Promise.all([
      db.fertilizer.count(),
      db.growingItem.count(),
      db.plantingWindow.count(),
      db.region.count(),
      db.post.count(),
      db.faq.count(),
      db.user.count(),
      db.diagnosis.count(),
    ]);
    return { fertilizers, growing, windows, regions, posts, faqs, users, diagnoses };
  } catch {
    return null;
  }
}

const CARDS: { key: keyof NonNullable<Awaited<ReturnType<typeof getCounts>>>; label: string; href: string }[] = [
  { key: "fertilizers", label: "Fertilizers", href: "/admin/fertilizers" },
  { key: "growing", label: "Crops · Plants · Vegetables", href: "/admin/growing" },
  { key: "windows", label: "Planting Windows", href: "/admin/windows" },
  { key: "regions", label: "Regions", href: "/admin/regions" },
  { key: "posts", label: "Blog Posts", href: "/admin/posts" },
  { key: "faqs", label: "FAQs", href: "/admin/faqs" },
  { key: "users", label: "Users", href: "/admin/users" },
  { key: "diagnoses", label: "Plant Doctor Diagnoses", href: "/admin" },
];

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const counts = await getCounts();

  return (
    <div>
      <AdminHeader title="Dashboard" />
      {!counts ? (
        <Card>
          <CardBody>
            <p className="text-sm text-ink-soft leading-relaxed">
              The database is not configured yet. Set <code className="font-mono">DATABASE_URL</code> in
              your environment, run <code className="font-mono">npx prisma migrate deploy</code> and{" "}
              <code className="font-mono">npx prisma db seed</code>, then this dashboard will show live
              content counts.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {CARDS.map((c) => (
            <Link key={c.key} href={c.href}>
              <Card className="hover:border-leaf-600 transition-colors h-full">
                <CardBody>
                  <p className="font-display text-4xl font-semibold text-leaf-700 dark:text-leaf-300">
                    {counts[c.key]}
                  </p>
                  <p className="text-sm font-medium text-ink-soft mt-1">{c.label}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
