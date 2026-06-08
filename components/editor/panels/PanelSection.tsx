"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  accent?: "default" | "highlight" | "danger";
  toolbar?: ReactNode;
}

export function PanelSection({
  title,
  description,
  children,
  accent = "default",
  toolbar,
}: Props) {
  return (
    <section
      className={cn(
        "mx-3 mt-3 overflow-hidden rounded-[22px] border px-4 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.05)] last:mb-3",
        accent === "default" &&
          "border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.7)_100%)]",
        accent === "highlight" &&
          "border-[rgba(232,198,16,0.28)] bg-[linear-gradient(180deg,rgba(255,247,207,0.92)_0%,rgba(255,255,255,0.82)_100%)]",
        accent === "danger" &&
          "border-red-100 bg-[linear-gradient(180deg,rgba(255,245,245,0.94)_0%,rgba(255,255,255,0.82)_100%)]",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-strong)]">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              {description}
            </p>
          )}
        </div>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface PanelBadgeProps {
  children: ReactNode;
  tone?: "default" | "highlight" | "danger";
}

export function PanelBadge({ children, tone = "default" }: PanelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
        tone === "default" && "border border-black/8 bg-white/80 text-[var(--color-ink-muted)]",
        tone === "highlight" && "bg-[rgba(232,198,16,0.18)] text-[var(--color-ink-strong)]",
        tone === "danger" && "bg-red-50 text-red-600",
      )}
    >
      {children}
    </span>
  );
}

interface PanelToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function PanelToggle({
  checked,
  onChange,
  label,
  description,
}: PanelToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-[18px] border border-black/6 bg-white/70 px-3 py-3 text-xs shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
      <span className="min-w-0">
        <span className="block font-semibold text-[var(--color-ink-body)]">{label}</span>
        {description && (
          <p className="mt-1 text-[11px] leading-snug text-[var(--color-ink-muted)]">
            {description}
          </p>
        )}
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-black/12 transition-colors peer-checked:bg-[var(--color-brand-primary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-brand-primary)]" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
