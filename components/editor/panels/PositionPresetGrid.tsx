"use client";

import type { ReactNode } from "react";
import {
  POSITION_PRESET_ORDER,
  POSITION_PRESETS,
  type DevicePositionPresetId,
} from "@/lib/devices/positionPresets";

interface Props {
  active: DevicePositionPresetId;
  onApply: (id: DevicePositionPresetId) => void;
}

const ICONS: Record<DevicePositionPresetId, ReactNode> = {
  centered: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={8} y={12} width={24} height={36} rx={2} />
    </svg>
  ),
  bleedBottom: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={8} y={20} width={24} height={45} rx={2} />
    </svg>
  ),
  bleedTop: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={8} y={-5} width={24} height={45} rx={2} />
    </svg>
  ),
  floatCenter: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={10} y={15} width={20} height={30} rx={2} />
    </svg>
  ),
  tiltLeft: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect
        x={8}
        y={12}
        width={24}
        height={36}
        rx={2}
        transform="rotate(-8 20 30)"
      />
    </svg>
  ),
  tiltRight: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect
        x={8}
        y={12}
        width={24}
        height={36}
        rx={2}
        transform="rotate(8 20 30)"
      />
    </svg>
  ),
  perspective: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 15 L28 12 L30 48 L10 45 Z" />
    </svg>
  ),
  floatBottom: (
    <svg viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={10} y={25} width={20} height={30} rx={2} />
    </svg>
  ),
};

export function PositionPresetGrid({ active, onApply }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {POSITION_PRESET_ORDER.map((id) => {
        const preset = POSITION_PRESETS[id];
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onApply(id)}
            title={preset.label}
            aria-pressed={isActive}
            className={[
              "flex flex-col items-center gap-1 rounded-[var(--radius-md)] border bg-[var(--color-surface-0)] px-1.5 py-2 transition",
              "hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-soft)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1",
              isActive
                ? "border-[var(--color-brand-primary)] ring-1 ring-[var(--color-brand-primary)]"
                : "border-[var(--color-surface-2)]",
            ].join(" ")}
          >
            <span className="block h-7 w-5 text-[var(--color-ink-body)]">
              {ICONS[id]}
            </span>
            <span className="text-[10px] font-medium leading-tight text-[var(--color-ink-body)]">
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
