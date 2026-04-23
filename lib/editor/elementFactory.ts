import type { SceneElement } from "@/lib/types/project";
import { defaultShadow } from "@/lib/types/project";
import { uid } from "@/lib/utils";

const base = () => ({
  id: uid("el_"),
  positionX: 50,
  positionY: 50,
  size: 12,
  rotation: 0,
  opacity: 100,
});

export function makeEmojiElement(emoji: string): SceneElement {
  return {
    ...base(),
    layer: "aboveScreenshot",
    kind: "emoji",
    emoji,
  };
}

export function makeTextElement(): SceneElement {
  return {
    ...base(),
    size: 36,
    layer: "aboveScreenshot",
    kind: "text",
    text: { tr: "Yeni metin" },
    font: "Inter",
    weight: "Semibold",
    color: "#000000",
    frame: "none",
    frameColor: "#e8c610",
    frameScale: 1,
    frameOffsetY: 0,
  };
}

export function makeGraphicElement(blobId: string): SceneElement {
  return {
    ...base(),
    layer: "aboveScreenshot",
    kind: "graphic",
    blobId,
    flipH: false,
    flipV: false,
  };
}

export function makeIconElement(iconName: string): SceneElement {
  return {
    ...base(),
    layer: "aboveScreenshot",
    kind: "icon",
    iconName,
    color: "#000000",
    strokeWidth: 2,
    shadow: { ...defaultShadow(), enabled: false },
  };
}
