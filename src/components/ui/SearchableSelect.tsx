"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

/**
 * Searchable combobox: type to filter, arrow keys + enter to select, escape to close.
 * Dark-mode and RTL safe. Closes on outside click.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  id,
}: {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Clamp highlight to valid range (resets naturally as filter shrinks)
  const safeHighlight = Math.min(highlight, Math.max(0, filtered.length - 1));

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open ]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[safeHighlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [safeHighlight, open]);

  const choose = (opt: SearchableOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && !open) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[safeHighlight];
      if (opt) choose(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-controls={id ? `${id}-listbox` : undefined}
        autoComplete="off"
        placeholder={placeholder ?? selected?.label ?? ""}
        value={open ? query : (selected?.label ?? "")}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink",
          "placeholder:text-ink-faint focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20",
          "transition-colors"
        )}
      />
      {/* Chevron */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => {
          setOpen((o) => !o);
          inputRef.current?.focus();
        }}
        className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line",
            "bg-surface shadow-lift py-1.5"
          )}
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-ink-faint">No matches</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                onMouseDown={(e) => {
                  // mousedown (not click) so it fires before input blur closes the list
                  e.preventDefault();
                  choose(opt);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex items-center justify-between gap-2 px-4 py-2.5 text-[15px] cursor-pointer",
                  opt.disabled
                    ? "text-ink-faint cursor-not-allowed"
                    : "text-ink",
                  i === safeHighlight && !opt.disabled && "bg-leaf-50 dark:bg-leaf-950",
                  opt.value === value && "font-semibold"
                )}
              >
                <span>{opt.label}</span>
                {opt.hint && (
                  <span className="text-xs text-ink-faint shrink-0">{opt.hint}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
