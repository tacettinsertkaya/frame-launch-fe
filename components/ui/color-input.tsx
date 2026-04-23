"use client";

interface ColorInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ColorInput({ value, onChange, label, disabled }: ColorInputProps) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      {label && (
        <span className="min-w-0 flex-1 truncate font-medium text-[var(--color-ink-body)]">
          {label}
        </span>
      )}
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[11px] tabular-nums uppercase text-[var(--color-ink-muted)]">
          {value}
        </span>
        <input
          type="color"
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-surface-2)] bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </label>
  );
}
