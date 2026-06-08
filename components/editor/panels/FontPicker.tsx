"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  type FontPickerCategory,
  type FontOption,
  getFontOptionsForCategory,
  isSystemFontName,
  resolveTextFontCss,
} from "@/lib/fonts/fontCatalog";
import { ensureGoogleFontLoaded } from "@/lib/fonts/loadGoogleFont";
import { cn } from "@/lib/utils";

const MAX_LIST = 100;

interface Props {
  id?: string;
  value: string;
  onChange: (fontName: string) => void;
  /** Numeric weights to warm-cache after load (e.g. headline + sub weights). */
  weightsToLoad?: number[];
}

export function FontPicker({ id, value, onChange, weightsToLoad = [400, 600, 700] }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FontPickerCategory>("popular");
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const baseOptions = useMemo(() => getFontOptionsForCategory(category), [category]);

  const displayOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? baseOptions.filter((o) => o.name.toLowerCase().includes(q))
      : baseOptions;

    const knownNames = new Set(list.map((o) => o.name));
    if (value && !knownNames.has(value)) {
      const kind: FontOption["kind"] = isSystemFontName(value) ? "system" : "google";
      list = [{ name: value, kind }, ...list];
    }
    return list.slice(0, MAX_LIST);
  }, [baseOptions, search, value]);

  const warmFont = useCallback(
    (name: string, kind: FontOption["kind"]) => {
      if (kind === "google") void ensureGoogleFontLoaded(name, weightsToLoad);
    },
    [weightsToLoad],
  );

  useEffect(() => {
    if (!open || !value) return;
    if (!isSystemFontName(value)) void ensureGoogleFontLoaded(value, weightsToLoad);
  }, [open, value, weightsToLoad]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={value ? `Font: ${value}` : "Font seç"}
        className="flex w-full items-center justify-between gap-2 rounded-[18px] border border-black/6 bg-[rgba(255,255,255,0.78)] px-3 py-2 text-left text-xs text-[var(--color-ink-strong)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-colors hover:bg-white focus:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]/30"
      >
        <span className="min-w-0 truncate">{value || "Font"}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-3.5 w-3.5 shrink-0 opacity-60 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-hidden rounded-[22px] border border-black/6 bg-[rgba(255,255,255,0.96)] text-[var(--color-ink-body)] shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="border-b border-black/6 p-2">
            <input
              type="search"
              placeholder="Ara…"
              aria-label="Font ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[14px] border border-black/6 bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[rgba(232,198,16,0.22)]"
              autoComplete="off"
            />
          </div>
          <div
            role="tablist"
            aria-label="Font kategorisi"
            className="flex gap-1 border-b border-black/6 px-2 py-1.5"
          >
            {(
              [
                ["popular", "Popüler"],
                ["system", "Sistem"],
                ["all", "Tümü"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={category === key}
                onClick={() => {
                  setCategory(key);
                  setSearch("");
                }}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]",
                  category === key
                    ? "bg-[var(--color-ink-strong)] text-white"
                    : "text-[var(--color-ink-muted)] hover:bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div role="listbox" aria-label="Fontlar" className="max-h-48 overflow-y-auto py-1">
            {displayOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--color-ink-muted)]">Sonuç yok</div>
            ) : (
              displayOptions.map((opt) => (
                <button
                  key={`${opt.kind}-${opt.name}`}
                  type="button"
                  role="option"
                  aria-selected={opt.name === value}
                  onMouseEnter={() => warmFont(opt.name, opt.kind)}
                  onFocus={() => warmFont(opt.name, opt.kind)}
                  onClick={async () => {
                    if (opt.kind === "google") {
                      await ensureGoogleFontLoaded(opt.name, weightsToLoad).catch(() => undefined);
                    }
                    onChange(opt.name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors",
                    "focus:outline-none focus-visible:bg-[var(--color-surface-1)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary)]",
                    opt.name === value
                      ? "bg-[rgba(232,198,16,0.12)] font-medium text-[var(--color-ink-strong)]"
                      : "text-[var(--color-ink-body)] hover:bg-[var(--color-surface-1)]",
                  )}
                >
                  <span
                    className="min-w-0 truncate"
                    style={{ fontFamily: resolveTextFontCss(opt.name) }}
                  >
                    {opt.name}
                  </span>
                  <span
                    aria-label={opt.kind === "system" ? "Sistem fontu" : "Google fontu"}
                    className="shrink-0 pl-2 text-[9px] uppercase text-[var(--color-ink-muted)]"
                  >
                    {opt.kind === "system" ? "sys" : "gf"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
