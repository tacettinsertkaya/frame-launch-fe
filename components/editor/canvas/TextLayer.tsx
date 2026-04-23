"use client";

import type { Locale, TextConfig } from "@/lib/types/project";

interface Props {
  config: TextConfig;
  locale: Locale;
  canvasWidth: number;
  canvasHeight: number;
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

export function TextLayer({ config, locale, canvasWidth, canvasHeight }: Props) {
  if (!config.enabled) return null;

  const text = config.text[locale] ?? config.text["en"] ?? "";
  if (!text.trim()) return null;

  const padX = canvasWidth * 0.06;
  const verticalPx = (canvasHeight * config.verticalOffset) / 100;
  const isTop = config.position === "top";

  const style: React.CSSProperties = {
    position: "absolute",
    left: padX,
    right: padX,
    fontFamily: `${config.font}, var(--font-sans)`,
    fontWeight: WEIGHT_MAP[config.weight] ?? 600,
    fontSize: (canvasWidth * config.fontSize) / 1000,
    lineHeight: config.lineHeight / 100,
    color: config.color,
    textAlign: config.align,
    opacity: config.opacity ? config.opacity / 100 : 1,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    pointerEvents: "none",
  };
  if (isTop) style.top = verticalPx;
  else style.bottom = verticalPx;

  return <div style={style}>{text}</div>;
}
