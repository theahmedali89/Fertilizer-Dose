import { setRequestLocale } from "next-intl/server";
import { AdminHeader, StatusBadge } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { SuggestionActions } from "./SuggestionActions";

const TYPE_LABELS: Record<string, string> = {
  TRANSLATION: "Translation",
  DATA_CORRECTION: "Data correction",
  DATA_REQUEST: "Data request",
  FIELD_EXPERIENCE: "Field experience (community — never a calculator source)",
};

/**
 * Crowd-sourced suggestion review queue.
 * SAFETY: approving a suggestion only marks it reviewed — it NEVER writes to
 * GrowingItem, FertilizerRecommendation, locale files, or any live table.
 * - TRANSLATION: admin copies the suggested text into locale files manually.
 * - DATA_*: admin verifies the cited source and enters data via the normal
 *   research flow (standing data gates apply).
 * - FIELD_EXPERIENCE: community tier only — approved reports surface in the
 *   community section marked unverified; NEVER a calculator source.
 */
export default async function SuggestionsAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { status } = await searchParams;
  const filter = status === "APPROVED" || status === "REJECTED" ? status : undefined;

  const rows = isDbConfigured()
    ? await db.userSuggestion
        .findMany({
          where: filter ? { status: filter as "APPROVED" | "REJECTED" } : undefined,
          // Priority (trusted-tier contributors) first, then pending-first.
          orderBy: [{ priority: "desc" }, { status: "asc" }, { createdAt: "desc" }],
        })
        .catch(() => [])
    : [];

  const counts = isDbConfigured()
    ? await db.userSuggestion
        .groupBy({ by: ["status"], _count: true })
        .catch(() => [])
    : [];
  const countBy = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div>
      <AdminHeader title="User Suggestions" />
      <p className="mb-4 text-sm text-ink-soft leading-relaxed max-w-3xl">
        Review queue for crowd-sourced translation fixes and agronomic data suggestions.{" "}
        <strong>Approving never publishes anything automatically</strong> — translations are
        applied manually to locale files, and data suggestions require source verification
        through the normal research flow.
      </p>

      <div className="mb-5 flex gap-2 text-sm">
        {[
          { v: undefined, label: `All (${rows.length})` },
          { v: "PENDING", label: `Pending (${countBy.PENDING ?? 0})` },
          { v: "APPROVED", label: `Approved (${countBy.APPROVED ?? 0})` },
          { v: "REJECTED", label: `Rejected (${countBy.REJECTED ?? 0})` },
        ].map((f) => (
          <a
            key={f.label}
            href={f.v ? `/admin/suggestions?status=${f.v}` : "/admin/suggestions"}
            className={`rounded-full border px-3.5 py-1.5 font-semibold transition-colors ${
              (filter ?? undefined) === f.v
                ? "border-leaf-600 bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300"
                : "border-line bg-surface text-ink-soft hover:border-leaf-600"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-faint">No suggestions yet.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((s) => (
            <div key={s.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                  {TYPE_LABELS[s.type] ?? s.type}
                </span>
                <StatusBadge status={s.status} />
                {s.priority && s.status === "PENDING" && (
                  <span className="inline-flex items-center rounded-full bg-harvest-100 dark:bg-harvest-950/60 border border-harvest-300 dark:border-harvest-800 px-2.5 py-0.5 text-xs font-bold text-harvest-900 dark:text-harvest-200">
                    ⚡ Priority review
                  </span>
                )}
                {s.contributorName && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                    {s.contributorImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.contributorImage} alt="" className="h-5 w-5 rounded-full object-cover border border-line" />
                    )}
                    by {s.contributorName}
                  </span>
                )}
                {s.locale && (
                  <span className="text-xs text-ink-faint">locale: {s.locale}</span>
                )}
                {s.cropSlug && (
                  <span className="text-xs text-ink-faint">crop: {s.cropSlug}</span>
                )}
                <span className="ml-auto text-xs text-ink-faint">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>

              {s.pageUrl && (
                <p className="text-xs text-ink-faint mb-2 break-all">
                  Page: <span className="underline underline-offset-2">{s.pageUrl}</span>
                  {s.fieldKey && <> · field: {s.fieldKey}</>}
                </p>
              )}
              {s.issueText && (
                <p className="text-sm text-ink-soft mb-2">
                  <span className="font-semibold">Issue: </span>{s.issueText}
                </p>
              )}
              <div className="rounded-xl bg-surface-2 p-3.5 text-sm leading-relaxed whitespace-pre-wrap mb-2">
                {s.submittedText}
              </div>
              {s.sourceUrl && (
                <p className="text-xs mb-2 break-all">
                  <span className="font-semibold">Source: </span>
                  <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-leaf-700 hover:underline underline-offset-2 dark:text-leaf-300">
                    {s.sourceUrl}
                  </a>
                </p>
              )}
              {s.sourceText && (
                <p className="text-xs mb-2">
                  <span className="font-semibold">Source (written): </span>
                  <span className="text-ink-soft">{s.sourceText}</span>
                </p>
              )}
              {(s.district || s.variety || s.appliedText || s.yieldText) && (
                <div className="rounded-xl border border-harvest-200 bg-harvest-50 dark:border-harvest-800 dark:bg-harvest-950/40 p-3.5 mb-2 text-sm">
                  <p className="font-semibold text-xs uppercase tracking-widest text-harvest-900 dark:text-harvest-200 mb-2">
                    Field report — community tier, unverified
                  </p>
                  <dl className="space-y-1 text-[13px]">
                    {s.district && (
                      <div className="flex gap-2"><dt className="font-semibold shrink-0">District:</dt><dd className="text-ink-soft">{s.district}</dd></div>
                    )}
                    {s.variety && (
                      <div className="flex gap-2"><dt className="font-semibold shrink-0">Variety:</dt><dd className="text-ink-soft">{s.variety}</dd></div>
                    )}
                    {s.appliedText && (
                      <div className="flex gap-2"><dt className="font-semibold shrink-0">Applied:</dt><dd className="text-ink-soft whitespace-pre-wrap">{s.appliedText}</dd></div>
                    )}
                    {s.yieldText && (
                      <div className="flex gap-2"><dt className="font-semibold shrink-0">Yield:</dt><dd className="text-ink-soft">{s.yieldText}</dd></div>
                    )}
                  </dl>
                </div>
              )}

              <SuggestionActions id={s.id} status={s.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
