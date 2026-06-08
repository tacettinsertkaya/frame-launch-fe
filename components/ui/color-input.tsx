"use client";

interface ColorInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ColorInput({ value, onChange, label, disabled }: ColorInputProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[18px] border border-black/6 bg-white/65 px-3 py-2.5 text-xs shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
      {label && (
        <span className="min-w-0 flex-1 truncate font-semibold text-[var(--color-ink-body)]">
          {label}
        </span>
      )}
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-black/6 bg-white px-2 py-1 font-mono text-[10px] tabular-nums uppercase text-[var(--color-ink-muted)]">
          {value}
        </span>
        <input
          type="color"
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-full border border-black/8 bg-transparent shadow-[0_4px_12px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </label>
  );
}
