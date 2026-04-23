"use client";

import type { Locale, TextConfig } from "@/lib/types/project";
import { resolveTextFontCss } from "@/lib/fonts/fontCatalog";

interface Props {
  config: TextConfig;
  locale: Locale;
  canvasWidth: number;
  canvasHeight: number;
  /** Canvas içi stacking (elements üstü metin). */
  zIndex?: number;
}

const WEIGHT_MAP: Record<string, number> = {
  Light: 300,
  Regular: 400,
  Medium: 500,
  Semibold: 600,
  Bold: 700,
  Heavy: 800,
  Black: 900,
};

export function TextLayer({ config, locale, canvasWidth, canvasHeight, zIndex = 5 }: Props) {
  if (!config.enabled) return null;

  const text = config.text[locale] ?? config.text["en"] ?? "";
  if (!text.trim()) return null;

  const padX = canvasWidth * 0.06;
  const verticalPx = (canvasHeight * config.verticalOffset) / 100;
  const isTop = config.position === "top";

  const deco: string[] = [];
  if (config.underline) deco.push("underline");
  if (config.strikethrough) deco.push("line-through");

  const style: React.CSSProperties = {
    position: "absolute",
    left: padX,
    right: padX,
    fontFamily: resolveTextFontCss(config.font),
    fontWeight: WEIGHT_MAP[config.weight] ?? 600,
    fontStyle: config.italic ? "italic" : "normal",
    textDecoration: deco.length ? deco.join(" ") : undefined,
    fontSize: (canvasWidth * config.fontSize) / 1000,
    lineHeight: config.lineHeight / 100,
    color: config.color,
    textAlign: config.align,
    opacity: config.opacity ? config.opacity / 100 : 1,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    pointerEvents: "none",
    zIndex,
  };
  if (isTop) style.top = verticalPx;
  else style.bottom = verticalPx;

  return <div style={style}>{text}</div>;
}
