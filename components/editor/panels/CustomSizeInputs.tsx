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
    <div className="mt-2 space-y-2 rounded-[18px] border border-black/6 bg-white/65 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={width}
          onChange={(e) => handleWidth(e.target.value)}
          aria-label="Genişlik (px)"
          className="fl-no-focus w-full min-w-0 rounded-[16px] border border-black/6 bg-white px-3 py-2 text-sm tabular-nums text-[var(--color-ink-strong)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)]"
        />
        <span aria-hidden className="select-none text-xs font-semibold text-[var(--color-ink-muted)]">
          ×
        </span>
        <input
          type="number"
          min={min}
          max={max}
          value={height}
          onChange={(e) => handleHeight(e.target.value)}
          aria-label="Yükseklik (px)"
          className="fl-no-focus w-full min-w-0 rounded-[16px] border border-black/6 bg-white px-3 py-2 text-sm tabular-nums text-[var(--color-ink-strong)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)]"
        />
      </div>
      <p className="text-[10px] text-[var(--color-ink-muted)]">
        Aralık: {min}–{max} px
      </p>
    </div>
  );
}
