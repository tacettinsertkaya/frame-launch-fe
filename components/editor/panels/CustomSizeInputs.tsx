"use client";

interface Props {
  width: number;
  height: number;
  onChange: (next: { width: number; height: number }) => void;
  min?: number;
  max?: number;
}

export function CustomSizeInputs({
  width,
  height,
  onChange,
  min = 100,
  max = 4000,
}: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const handleWidth = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    onChange({ width: clamp(n), height });
  };

  const handleHeight = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    onChange({ width, height: clamp(n) });
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={width}
          onChange={(e) => handleWidth(e.target.value)}
          aria-label="Genişlik (px)"
          className="fl-no-focus w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-2 py-1.5 text-sm tabular-nums text-[var(--color-ink-strong)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
        />
        <span aria-hidden className="select-none text-xs text-[var(--color-ink-muted)]">
          ×
        </span>
        <input
          type="number"
          min={min}
          max={max}
          value={height}
          onChange={(e) => handleHeight(e.target.value)}
          aria-label="Yükseklik (px)"
          className="fl-no-focus w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-2 py-1.5 text-sm tabular-nums text-[var(--color-ink-strong)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
        />
      </div>
      <p className="text-[10px] text-[var(--color-ink-muted)]">
        Aralık: {min}–{max} px
      </p>
    </div>
  );
}
