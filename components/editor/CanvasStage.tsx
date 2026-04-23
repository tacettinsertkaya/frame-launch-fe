"use client";

import { useEffect, useMemo, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { getEffectiveDimensions } from "@/lib/devices/registry";
import { useEditorStore } from "@/store/editorStore";
import { Canvas } from "./Canvas";

interface Props {
  project: Project;
}

export function CanvasStage({ project }: Props) {
  const activeId = useEditorStore((s) => s.activeScreenshotId);
  const setActive = useEditorStore((s) => s.setActiveScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // İlk yükte aktif ekran yoksa ilkini seç
  useEffect(() => {
    if (!activeId && project.screenshots[0]) {
      setActive(project.screenshots[0].id);
    }
  }, [activeId, project.screenshots, setActive]);

  const active = useMemo(
    () => project.screenshots.find((s) => s.id === activeId) ?? project.screenshots[0],
    [activeId, project.screenshots],
  );

  const fitZoom = () => {
    if (!containerRef.current || !active) return;
    const { width, height } = getEffectiveDimensions(
      active.deviceSizeId,
      active.customDimensions,
    );
    const cw = containerRef.current.clientWidth - 80;
    const ch = containerRef.current.clientHeight - 80;
    const z = Math.min(cw / width, ch / height, 1);
    setZoom(z);
  };

  useEffect(() => {
    const t = setTimeout(fitZoom, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.deviceSizeId]);

  return (
    <div className="relative flex h-full flex-1 flex-col bg-[var(--color-surface-1)]">
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-auto p-10"
      >
        {/* Hidden render canvases for export */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: -99999,
            top: -99999,
            pointerEvents: "none",
          }}
        >
          {project.screenshots.map((s) => (
            <div key={s.id} data-screenshot-id={s.id}>
              <Canvas screenshot={s} locale={activeLocale} scale={1} />
            </div>
          ))}
        </div>

        {active && (
          <div className="rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-xl)]">
            <Canvas screenshot={active} locale={activeLocale} scale={zoom} />
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1.5 shadow-[var(--shadow-md)] backdrop-blur-md">
        <button
          onClick={() => setZoom(zoom - 0.05)}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] hover:bg-[var(--color-surface-1)]"
          aria-label="Uzaklaştır"
        >
          <ZoomOut size={14} />
        </button>
        <span className="min-w-12 text-center text-xs font-medium tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.05)}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] hover:bg-[var(--color-surface-1)]"
          aria-label="Yakınlaştır"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={fitZoom}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] hover:bg-[var(--color-surface-1)]"
          aria-label="Ekrana sığdır"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}
