"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";

/* ── Page header ── */
export function AdminHeader({ title, actionHref, actionLabel }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">{title}</h1>
      {actionHref && (
        <Link
          href={actionHref}
          className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/* ── Table ── */
export function AdminTable({
  columns, rows, editBase, onDelete, deleteLabel = "Delete",
}: {
  columns: string[];
  rows: { id: string; cells: React.ReactNode[] }[];
  editBase: string;
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>;
  deleteLabel?: string;
}) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setDeleting(id);
    setError("");
    const res = await onDelete(id);
    setDeleting(null);
    if (!res.ok) setError(res.error ?? "Delete failed.");
  };

  if (!rows.length) {
    return <p className="text-sm text-ink-soft border border-dashed border-line rounded-2xl px-5 py-8 text-center">No records yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/60 text-start">
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-start font-semibold text-ink-soft whitespace-nowrap">{c}</th>
              ))}
              <th className="px-4 py-3 text-end font-semibold text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/40">
                {r.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-3 align-top">{cell}</td>
                ))}
                <td className="px-4 py-3 text-end whitespace-nowrap">
                  <Link href={`${editBase}/${r.id}`} className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline me-4">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  >
                    {deleting === r.id ? "…" : deleteLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Form fields ── */
const labelCls = "block text-[13px] font-semibold text-ink-soft mb-1.5";
const inputCls = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20";

export function TextField({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} {...props} />
      {hint && <span className="block text-xs text-ink-faint mt-1">{hint}</span>}
    </label>
  );
}

export function NumberField({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <TextField label={label} hint={hint} type="number" step="any" {...props} />;
}

export function TextAreaField({ label, hint, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea className={`${inputCls} min-h-[110px] leading-relaxed`} {...props} />
      {hint && <span className="block text-xs text-ink-faint mt-1">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, hint, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <select className={inputCls} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <span className="block text-xs text-ink-faint mt-1">{hint}</span>}
    </label>
  );
}

export function CheckField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input type="checkbox" className="w-4.5 h-4.5 accent-leaf-700" {...props} />
      <span className="text-[14px] font-medium">{label}</span>
    </label>
  );
}

/* ── Form wrapper with error display + submit ── */
export function AdminForm({
  action, children, submitLabel = "Save", backHref,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  children: React.ReactNode;
  submitLabel?: string;
  backHref: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (fd) => {
        setError("");
        setBusy(true);
        try {
          const res = await action(fd);
          if (!res.ok) {
            setError(res.error ?? "Save failed.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push(backHref);
            router.refresh();
          }
        } catch {
          setError("Something went wrong. Please try again.");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-5 max-w-3xl"
    >
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}
      {children}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        <Link href={backHref} className="text-sm font-medium text-ink-soft hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
