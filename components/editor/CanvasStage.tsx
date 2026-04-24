"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { LOCALE_LABELS } from "@/lib/i18n/localeLabels";
import { getDeviceSize, getEffectiveDimensions } from "@/lib/devices/registry";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
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

  const activeIndex = active
    ? project.screenshots.findIndex((s) => s.id === active.id)
    : -1;
  const activeDimensions = useMemo(
    () =>
      active
        ? getEffectiveDimensions(active.deviceSizeId, active.customDimensions)
        : null,
    [active],
  );
  const activeDevice = active ? getDeviceSize(active.deviceSizeId) : null;

  const measureFitZoom = useCallback(() => {
    if (!containerRef.current || !activeDimensions) return null;
    const cw = containerRef.current.clientWidth - 96;
    const ch = containerRef.current.clientHeight - 160;
    return Math.min(cw / activeDimensions.width, ch / activeDimensions.height, 1);
  }, [activeDimensions]);

  const fitZoom = useCallback(() => {
    const nextZoom = measureFitZoom();
    if (nextZoom !== null) {
      setZoom(nextZoom);
    }
  }, [measureFitZoom, setZoom]);

  useEffect(() => {
    const t = window.setTimeout(fitZoom, 50);
    return () => window.clearTimeout(t);
  }, [
    fitZoom,
    active?.deviceSizeId,
    active?.customDimensions?.width,
    active?.customDimensions?.height,
  ]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const nextZoom = measureFitZoom();
      if (nextZoom === null) return;
      const currentZoom = useEditorStore.getState().zoom;
      if (currentZoom > nextZoom) {
        setZoom(nextZoom);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measureFitZoom, setZoom]);

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
      const currentZoom = useEditorStore.getState().zoom;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom(currentZoom + 0.05);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom(currentZoom - 0.05);
      } else if (e.key === "0") {
        e.preventDefault();
        fitZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fitZoom, setZoom]);

  return (
    <div
      role="region"
      aria-label="Ekran görüntüsü tuval alanı"
      className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,248,214,0.8)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,198,16,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.08),transparent_32%)]" />
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />
      </div>
      <div
        ref={containerRef}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        {active && activeDimensions && activeDevice && (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="pointer-events-auto max-w-xl rounded-[24px] border border-black/10 bg-[rgba(255,255,255,0.82)] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                <span>Review Stage</span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-brand-primary)]" />
                <span>
                  {activeIndex + 1} / {project.screenshots.length}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink-strong)]">
                  {active.name}
                </h2>
                <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {LOCALE_LABELS[activeLocale]}
                </span>
              </div>
              <p className="mt-1 max-w-lg text-xs leading-5 text-[var(--color-ink-muted)]">
                {project.screenshots.length > 1
                  ? "Yan önizlemeleri kullanarak akışı hızlıca gözden geçirin; düzen bozulmadan varyasyonlar arasında gezinebilirsiniz."
                  : "İlk sahnenizi inşa ediyorsunuz. Yeni ekranlar ekledikçe bu alan tam bir storyboard inceleme yüzeyine dönüşecek."}
              </p>
            </div>

            <div className="pointer-events-auto hidden items-center gap-2 md:flex">
              <StageBadge label="Format" value={activeDevice.label} />
              <StageBadge
                label="Boyut"
                value={`${activeDimensions.width}×${activeDimensions.height}`}
              />
              <StageBadge label="Yakınlaştırma" value={`${Math.round(zoom * 100)}%`} />
            </div>
          </div>
        )}

        <div
          className="relative flex min-h-0 flex-1 items-stretch justify-center overflow-auto px-4 pb-8 pt-28 sm:px-8 sm:pt-32 md:px-10 md:pt-36"
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
        className="pointer-events-auto absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-full border border-black/10 bg-[rgba(255,255,255,0.88)] px-2 py-1.5 text-[var(--color-ink-body)] shadow-[0_12px_36px_rgba(0,0,0,0.12)] backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={() => setZoom(zoom - 0.05)}
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
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
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-body)] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          aria-label="Yakınlaştır (Ctrl/Cmd + +)"
          title="Yakınlaştır (Ctrl/Cmd + +)"
        >
          <ZoomIn size={14} aria-hidden />
        </button>
        <button
          type="button"
          onClick={fitZoom}
          className="grid h-7 w-7 place-items-center rounded-full bg-black px-2 text-white transition-colors hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          aria-label="Ekrana sığdır (Ctrl/Cmd + 0)"
          title="Ekrana sığdır (Ctrl/Cmd + 0)"
        >
          <Maximize2 size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}

interface StageBadgeProps {
  label: string;
  value: string;
}

function StageBadge({ label, value }: StageBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-full border border-black/10 bg-[rgba(255,255,255,0.8)] px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-[var(--color-ink-strong)]">
        {value}
      </div>
    </div>
  );
}
