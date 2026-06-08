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
    <div className={cn("space-y-2 rounded-[18px] border border-black/6 bg-white/65 px-3 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.03)]", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className="truncate text-xs font-semibold text-[var(--color-ink-body)]"
          >
            {label}
          </label>
          <span className="shrink-0 rounded-full bg-black px-2 py-1 text-[10px] font-semibold tabular-nums text-white">
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
