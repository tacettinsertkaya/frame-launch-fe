"use client";

import { useMemo } from "react";
import { TEMPLATES } from "@/lib/templates/registry";
import { Canvas } from "@/components/editor/Canvas";
import { cn } from "@/lib/utils";
import { getEffectiveDimensions } from "@/lib/devices/registry";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const THUMB_WIDTH = 140;

export function TemplatePickerGrid({ selectedId, onSelect }: Props) {
  const previews = useMemo(
    () => TEMPLATES.map((t) => ({ meta: t, built: t.build() })),
    [],
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {previews.map(({ meta, built }) => {
        const first = built.screenshots[0];
        const selected = selectedId === meta.id;
        const dims = getEffectiveDimensions(
          first.deviceSizeId,
          first.customDimensions,
        );
        const scale = THUMB_WIDTH / dims.width;
        const thumbHeight = Math.min(dims.height * scale, 220);

        return (
          <button
            key={meta.id}
            type="button"
            onClick={() => onSelect(meta.id)}
            className={cn(
              "group flex flex-col overflow-hidden rounded-[var(--radius-md)] border-2 text-left transition-all",
              selected
                ? "border-[var(--color-brand-primary)] shadow-[var(--shadow-md)]"
                : "border-[var(--color-surface-2)] hover:border-[var(--color-surface-3)]",
            )}
          >
            <div
              className="relative flex items-start justify-center overflow-hidden bg-[var(--color-surface-1)]"
              style={{ height: thumbHeight }}
            >
              <div className="pointer-events-none">
                <Canvas screenshot={first} locale="tr" scale={scale} selectedElementId={null} />
              </div>
            </div>
            <div className="border-t border-[var(--color-surface-2)] px-2 py-1.5">
              <div className="truncate text-[11px] font-semibold text-[var(--color-ink-strong)]">
                {meta.name}
              </div>
              <div className="truncate text-[10px] text-[var(--color-ink-muted)]">
                {meta.category} · {built.screenshots.length} ekran
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
