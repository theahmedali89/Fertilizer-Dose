import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { RoleSelect } from "./RoleSelect";

export default async function UsersAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.user.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [])
    : [];

  if (!rows.length) {
    return (
      <div>
        <AdminHeader title="Users" />
        <p className="text-sm text-ink-soft border border-dashed border-line rounded-2xl px-5 py-8 text-center">No users yet.</p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Users" />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/60">
              {["Name", "Email", "Role", "Created"].map((c) => (
                <th key={c} className="px-4 py-3 text-start font-semibold text-ink-soft whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/40">
                <td className="px-4 py-3 font-semibold">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <RoleSelect userId={u.id} role={u.role} />
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
