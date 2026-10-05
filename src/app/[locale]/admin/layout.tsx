import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireStaff } from "@/server/require-auth";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/fertilizers", label: "Fertilizers" },
  { href: "/admin/growing", label: "Crops · Plants · Vegetables" },
  { href: "/admin/countries", label: "Countries" },
  { href: "/admin/regions", label: "Regions" },
  { href: "/admin/windows", label: "Planting Windows" },
  { href: "/admin/recommendations", label: "Recommendations" },
  { href: "/admin/translations", label: "Translations" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/posts", label: "Blog Posts" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-60 shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3 px-1">
            Admin
          </p>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="hidden lg:inline-block mt-4 px-3.5 text-[13px] font-medium text-ink-faint hover:text-leaf-700 transition-colors"
          >
            ← Back to site
          </Link>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
