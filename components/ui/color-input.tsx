"use client";

interface ColorInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export function ColorInput({ value, onChange, label }: ColorInputProps) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      {label && <span className="font-medium text-[var(--color-ink-body)]">{label}</span>}
      <div className="flex items-center gap-2">
        <span className="font-mono tabular-nums text-[var(--color-ink-muted)] text-[11px]">
          {value.toUpperCase()}
        </span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-surface-2)] bg-transparent"
        />
      </div>
    </label>
  );
}
