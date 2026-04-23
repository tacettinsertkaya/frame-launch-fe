"use client";

import { cn } from "@/lib/utils";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Segment<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "sm",
}: SegmentProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-[var(--radius-md)] bg-[var(--color-surface-2)] p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "flex-1 inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] font-medium transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3 text-sm",
              active
                ? "bg-white text-[var(--color-ink-strong)] shadow-[var(--shadow-sm)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-strong)]",
            )}
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
