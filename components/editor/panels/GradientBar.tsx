"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GradientStopValue {
  color: string;
  position: number;
}

interface Props {
  stops: GradientStopValue[];
  /** Linear gradient direction in degrees (visual hint only, bar always renders 90deg). */
  direction?: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onChangePosition: (index: number, position: number) => void;
  onAdd: (color: string, position: number) => void;
  onRemove?: (index: number) => void;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

function colorAtPosition(stops: GradientStopValue[], position: number): string {
  if (stops.length === 0) return "#ffffff";
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  if (position <= sorted[0].position) return sorted[0].color;
  if (position >= sorted[sorted.length - 1].position) return sorted[sorted.length - 1].color;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (position >= a.position && position <= b.position) {
      // Use the closer stop's color (good enough for adding visual continuity).
      const mid = (a.position + b.position) / 2;
      return position < mid ? a.color : b.color;
    }
  }
  return sorted[0].color;
}

/**
 * Visual gradient bar with draggable color stops.
 * - Click on empty bar area: adds a new stop at that position.
 * - Drag handle: updates that stop's position.
 * - Click handle: selects it (parent decides what to do, e.g. show focus ring on color picker).
 */
export function GradientBar({
  stops,
  selectedIndex,
  onSelect,
  onChangePosition,
  onAdd,
  onRemove,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const [, force] = useState(0);

  const positionFromEvent = useCallback((clientX: number): number => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return clamp(((clientX - rect.left) / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const idx = draggingIndexRef.current;
      if (idx === null) return;
      const pos = positionFromEvent(e.clientX);
      onChangePosition(idx, Math.round(pos));
    };
    const onUp = () => {
      if (draggingIndexRef.current === null) return;
      draggingIndexRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      force((n) => n + 1);
    };
    if (draggingIndexRef.current !== null) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onChangePosition, positionFromEvent]);

  const startDrag = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(idx);
    draggingIndexRef.current = idx;
    force((n) => n + 1);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.role === "stop-handle") return;
    const pos = Math.round(positionFromEvent(e.clientX));
    onAdd(colorAtPosition(stops, pos), pos);
  };

  const sortedStops = [...stops]
    .map((s, i) => ({ ...s, originalIndex: i }))
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-1">
      <div
        ref={trackRef}
        onClick={onTrackClick}
        className="relative h-7 w-full cursor-copy overflow-visible rounded-[var(--radius-sm)] border border-[var(--color-surface-2)]"
        style={{
          backgroundImage: `linear-gradient(90deg, ${stops
            .map((s) => `${s.color} ${s.position}%`)
            .join(", ")})`,
        }}
        role="group"
        aria-label="Gradient durakları çubuğu (boş alana tıkla: yeni durak ekle, tutamacı sürükle: pozisyonu değiştir)"
      >
        {sortedStops.map((s) => {
          const isSelected = selectedIndex === s.originalIndex;
          return (
            <button
              key={s.originalIndex}
              type="button"
              data-role="stop-handle"
              role="slider"
              aria-label={`Stop ${s.originalIndex + 1} pozisyonu`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={s.position}
              aria-valuetext={`${s.position}%`}
              aria-pressed={isSelected}
              onPointerDown={(e) => startDrag(e, s.originalIndex)}
              onKeyDown={(e) => {
                const big = e.shiftKey ? 5 : 1;
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  onChangePosition(
                    s.originalIndex,
                    Math.round(clamp(s.position - big)),
                  );
                } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  onChangePosition(
                    s.originalIndex,
                    Math.round(clamp(s.position + big)),
                  );
                } else if (e.key === "Home") {
                  e.preventDefault();
                  onChangePosition(s.originalIndex, 0);
                } else if (e.key === "End") {
                  e.preventDefault();
                  onChangePosition(s.originalIndex, 100);
                } else if (
                  (e.key === "Delete" || e.key === "Backspace") &&
                  onRemove &&
                  stops.length > 2
                ) {
                  e.preventDefault();
                  onRemove(s.originalIndex);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(s.originalIndex);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onRemove && stops.length > 2) onRemove(s.originalIndex);
              }}
              className={[
                "absolute top-1/2 h-5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border shadow-sm transition-transform",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1",
                isSelected
                  ? "scale-110 border-[var(--color-ink-strong)]"
                  : "border-white/90",
              ].join(" ")}
              style={{
                left: `${s.position}%`,
                backgroundColor: s.color,
              }}
              title={`Stop ${s.originalIndex + 1} • ${s.position}%`}
            />
          );
        })}
      </div>
      <p className="text-[10px] leading-tight text-[var(--color-ink-muted)]">
        Çubuğa tıkla: yeni durak · Sürükle veya{" "}
        <kbd className="rounded bg-[var(--color-surface-2)] px-1">←→</kbd> ile pozisyon ·
        Çift tıkla / <kbd className="rounded bg-[var(--color-surface-2)] px-1">Del</kbd>{" "}
        ile sil
      </p>
    </div>
  );
}
