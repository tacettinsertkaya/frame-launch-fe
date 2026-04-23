"use client";

import { useEffect, useMemo, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { getEffectiveDimensions } from "@/lib/devices/registry";
import { useEditorStore } from "@/store/editorStore";
import { Canvas } from "./Canvas";
import { SidePreviewStrip } from "./canvas/SidePreviewStrip";

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom(zoom + 0.05);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom(zoom - 0.05);
      } else if (e.key === "0") {
        e.preventDefault();
        fitZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  return (
    <div
      role="region"
      aria-label="Ekran görüntüsü tuval alanı"
      className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-surface-1)]"
    >
      <div
        ref={containerRef}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <div
          className="relative flex min-h-0 flex-1 items-stretch justify-center overflow-auto p-4 sm:p-8 md:p-10"
        >
          {/* Export için gizli tam çözünürlük kopyaları */}
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
                <Canvas screenshot={s} locale={activeLocale} scale={1} selectedElementId={null} />
              </div>
            ))}
          </div>

          {active && (
            <SidePreviewStrip
              project={project}
              active={active}
              activeLocale={activeLocale}
              zoom={zoom}
            />
          )}
        </div>
      </div>

      <div
        role="toolbar"
        aria-label="Yakınlaştırma"
        className="pointer-events-auto absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-full border border-[var(--color-surface-2)] bg-[var(--color-surface-0)]/95 px-2 py-1.5 text-[var(--color-ink-body)] shadow-[var(--shadow-md)] backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setZoom(zoom - 0.05)}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] transition-colors hover:bg-[var(--color-surface-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          aria-label="Uzaklaştır (Ctrl/Cmd + −)"
          title="Uzaklaştır (Ctrl/Cmd + −)"
        >
          <ZoomOut size={14} aria-hidden />
        </button>
        <span
          className="min-w-12 text-center text-xs font-medium tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(zoom + 0.05)}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] transition-colors hover:bg-[var(--color-surface-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          aria-label="Yakınlaştır (Ctrl/Cmd + +)"
          title="Yakınlaştır (Ctrl/Cmd + +)"
        >
          <ZoomIn size={14} aria-hidden />
        </button>
        <button
          type="button"
          onClick={fitZoom}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] transition-colors hover:bg-[var(--color-surface-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          aria-label="Ekrana sığdır (Ctrl/Cmd + 0)"
          title="Ekrana sığdır (Ctrl/Cmd + 0)"
        >
          <Maximize2 size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}
