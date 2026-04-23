"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  unit?: string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  unit,
  className,
  disabled = false,
}: SliderProps) {
  const id = label ? `sld-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className="truncate text-xs font-medium text-[var(--color-ink-body)]"
          >
            {label}
          </label>
          <span className="shrink-0 text-xs tabular-nums text-[var(--color-ink-muted)]">
            {value}
            {unit ?? ""}
          </span>
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={`${value}${unit ?? ""}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
