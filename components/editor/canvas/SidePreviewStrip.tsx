"use client";

import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Project, Screenshot, Locale } from "@/lib/types/project";
import { getEffectiveDimensions } from "@/lib/devices/registry";
import { useEditorStore } from "@/store/editorStore";
import { Canvas } from "../Canvas";
import { cn } from "@/lib/utils";
import {
  getSidePreviewSlotIndices,
  computeSidePreviewScale,
  SIDE_GAP_PX,
  SLIDE_ANIMATION_MS,
} from "@/lib/editor/sidePreviewLayout";

interface Props {
  project: Project;
  active: Screenshot;
  activeLocale: Locale;
  /** Main canvas zoom (same as CanvasStage). */
  zoom: number;
}

const SideCanvas = memo(function SideCanvas({
  screenshot,
  locale,
  label,
  interactive,
  onClick,
}: {
  screenshot: Screenshot;
  locale: Locale;
  label: string;
  interactive: boolean;
  onClick?: () => void;
}) {
  const { width, height } = getEffectiveDimensions(
    screenshot.deviceSizeId,
    screenshot.customDimensions,
  );
  const scale = computeSidePreviewScale(width, height);
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      aria-hidden={!interactive}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      onClick={interactive ? onClick : undefined}
      className={cn(
        "origin-center overflow-hidden rounded-lg shadow-[0_25px_80px_rgba(0,0,0,0.2)]",
        "opacity-60 transition-opacity hover:opacity-[0.85]",
        interactive ? "cursor-pointer" : "pointer-events-none",
      )}
      style={{ maxWidth: 400, maxHeight: 700, direction: "ltr" as const }}
    >
      <div className="pointer-events-none">
        <Canvas screenshot={screenshot} locale={locale} scale={scale} />
      </div>
    </div>
  );
});

/**
 * Main canvas + up to 4 side previews, appscreen-style. Only ±1 are clickable; ±2 are visual.
 */
export function SidePreviewStrip({ project, active, activeLocale, zoom }: Props) {
  const isSliding = useEditorStore((s) => s.isSliding);
  const setSliding = useEditorStore((s) => s.setSliding);
  const setActive = useEditorStore((s) => s.setActiveScreenshot);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);

  const mainRef = useRef<HTMLDivElement | null>(null);
  const [mainWidth, setMainWidth] = useState(0);
  const [tx, setTx] = useState(0);
  const [transition, setTransition] = useState(true);

  const list = project.screenshots;
  const activeIndex = list.findIndex((s) => s.id === active.id);
  const slots = getSidePreviewSlotIndices(activeIndex, list.length);

  const remeasure = useCallback(() => {
    if (mainRef.current) {
      setMainWidth(mainRef.current.offsetWidth);
    }
  }, []);

  useLayoutEffect(() => {
    remeasure();
    if (!mainRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(remeasure);
    ro.observe(mainRef.current);
    return () => ro.disconnect();
  }, [active.id, remeasure, zoom, active.deviceSizeId, active.customDimensions]);

  const sideOffset =
    mainWidth > 0 ? mainWidth / 2 + SIDE_GAP_PX : 0;
  const farOffset =
    mainWidth > 0
      ? sideOffset + mainWidth + SIDE_GAP_PX
      : 0;

  const runSlide = useCallback(
    (targetId: string, direction: "left" | "right") => {
      const w = mainRef.current?.offsetWidth ?? mainWidth;
      if (isSliding || w <= 0) return;
      const d = w + SIDE_GAP_PX;
      setSliding(true, direction);
      setTransition(true);
      setTx(direction === "right" ? -d : d);
      window.setTimeout(() => {
        setActive(targetId);
        setTransition(false);
        setTx(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransition(true);
            setSliding(false, null);
            remeasure();
          });
        });
      }, SLIDE_ANIMATION_MS);
    },
    [isSliding, mainWidth, remeasure, setActive, setSliding],
  );

  if (list.length === 0) return null;

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 max-w-full flex-1 items-center justify-center",
        isSliding && "pointer-events-none",
      )}
    >
      <div
        className="relative flex w-full justify-center will-change-transform"
        style={{
          transform: `translate3d(${tx}px,0,0)`,
          transition: transition
            ? `transform ${SLIDE_ANIMATION_MS}ms ease-out`
            : "none",
        }}
      >
        {slots.farLeft != null && list[slots.farLeft] && (
          <div
            className="absolute top-1/2 z-0 -translate-y-1/2"
            style={{ right: `calc(50% + ${farOffset}px)` }}
            aria-hidden
          >
            <SideCanvas
              screenshot={list[slots.farLeft]!}
              locale={activeLocale}
              label="Daha eski ekran"
              interactive={false}
            />
          </div>
        )}
        {slots.left !== null && list[slots.left!] && (
          <div
            className="absolute top-1/2 z-10 -translate-y-1/2"
            style={{ right: `calc(50% + ${sideOffset}px)` }}
          >
            <SideCanvas
              screenshot={list[slots.left!]!}
              locale={activeLocale}
              label="Önceki ekran"
              interactive
              onClick={() => {
                const id = list[slots.left!]!.id;
                runSlide(id, "left");
              }}
            />
          </div>
        )}

        <div
          ref={mainRef}
          className="relative z-20 rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-xl)]"
        >
          <Canvas
            screenshot={active}
            locale={activeLocale}
            scale={zoom}
            selectedElementId={selectedElementId}
          />
        </div>

        {slots.right !== null && list[slots.right!] && (
          <div
            className="absolute top-1/2 z-10 -translate-y-1/2"
            style={{ left: `calc(50% + ${sideOffset}px)` }}
          >
            <SideCanvas
              screenshot={list[slots.right!]!}
              locale={activeLocale}
              label="Sonraki ekran"
              interactive
              onClick={() => {
                const id = list[slots.right!]!.id;
                runSlide(id, "right");
              }}
            />
          </div>
        )}

        {slots.farRight != null && list[slots.farRight] && (
          <div
            className="absolute top-1/2 z-0 -translate-y-1/2"
            style={{ left: `calc(50% + ${farOffset}px)` }}
            aria-hidden
          >
            <SideCanvas
              screenshot={list[slots.farRight]!}
              locale={activeLocale}
              label="Daha sonraki ekran"
              interactive={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
