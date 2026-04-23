"use client";

import { useEffect, useState } from "react";
import type { Layer, Locale, SceneElement } from "@/lib/types/project";
import { getBlobUrl } from "@/lib/persistence/blobStore";
import { resolveTextFontCss } from "@/lib/fonts/fontCatalog";
import { resolveElementIcon } from "@/lib/editor/elementIcons";
import { cn } from "@/lib/utils";

const WEIGHT_MAP: Record<string, number> = {
  Light: 300,
  Regular: 400,
  Medium: 500,
  Semibold: 600,
  Bold: 700,
  Heavy: 800,
  Black: 900,
};

interface Props {
  elements: SceneElement[];
  layer: Layer;
  zIndex: number;
  canvasWidth: number;
  canvasHeight: number;
  locale: Locale;
  selectedElementId?: string | null;
}

export function ElementsLayer({
  elements,
  layer,
  zIndex,
  canvasWidth,
  canvasHeight,
  locale,
  selectedElementId,
}: Props) {
  const list = elements.filter((e) => e.layer === layer);
  if (list.length === 0) return null;

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
      }}
    >
      {list.map((el) => (
        <ElementSprite
          key={el.id}
          el={el}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          locale={locale}
          selected={selectedElementId === el.id}
        />
      ))}
    </div>
  );
}

function ElementSprite({
  el,
  canvasWidth,
  canvasHeight,
  locale,
  selected,
}: {
  el: SceneElement;
  canvasWidth: number;
  canvasHeight: number;
  locale: Locale;
  selected: boolean;
}) {
  const left = (canvasWidth * el.positionX) / 100;
  const top = (canvasHeight * el.positionY) / 100;
  const box = Math.max(16, (canvasWidth * el.size) / 100);
  const opacity = el.opacity / 100;
  const transform = `translate(-50%, -50%) rotate(${el.rotation}deg)`;

  const ring = selected
    ? "0 0 0 2px rgba(232,198,16,0.95), 0 0 0 4px rgba(0,0,0,0.35)"
    : undefined;

  if (el.kind === "emoji") {
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          transform,
          fontSize: box * 0.85,
          lineHeight: 1,
          opacity,
          boxShadow: ring,
          borderRadius: 4,
        }}
      >
        {el.emoji}
      </div>
    );
  }

  if (el.kind === "text") {
    const text = el.text[locale] ?? el.text["en"] ?? "";
    const fs = Math.max(10, (canvasWidth * el.size) / 200);
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          transform,
          maxWidth: canvasWidth * 0.5,
          fontFamily: resolveTextFontCss(el.font),
          fontWeight: WEIGHT_MAP[el.weight] ?? 600,
          fontSize: fs,
          color: el.color,
          opacity,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: ring,
        }}
      >
        {text}
      </div>
    );
  }

  if (el.kind === "graphic") {
    return (
      <GraphicSprite
        blobId={el.blobId}
        left={left}
        top={top}
        transform={transform}
        width={box}
        flipH={el.flipH}
        flipV={el.flipV}
        opacity={opacity}
        ring={ring}
      />
    );
  }

  if (el.kind === "icon") {
    const Icon = resolveElementIcon(el.iconName);
    const sw = el.strokeWidth ?? 2;
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          transform,
          width: box,
          height: box,
          color: el.color,
          opacity,
          boxShadow: ring,
        }}
        className="grid place-items-center"
      >
        <Icon size={Math.floor(box * 0.72)} strokeWidth={sw} />
      </div>
    );
  }

  return null;
}

function GraphicSprite({
  blobId,
  left,
  top,
  transform,
  width,
  flipH,
  flipV,
  opacity,
  ring,
}: {
  blobId: string;
  left: number;
  top: number;
  transform: string;
  width: number;
  flipH: boolean;
  flipV: boolean;
  opacity: number;
  ring?: string;
}) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    let c = false;
    void getBlobUrl(blobId).then((u) => {
      if (!c) setUrl(u);
    });
    return () => {
      c = true;
    };
  }, [blobId]);

  if (!url) return null;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform,
        width,
        opacity,
        boxShadow: ring,
      }}
    >
      <img
        src={url}
        alt=""
        className={cn("h-auto max-h-[40vh] w-full object-contain")}
        style={{
          transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
        }}
      />
    </div>
  );
}
