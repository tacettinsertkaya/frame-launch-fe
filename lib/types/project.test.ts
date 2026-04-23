import { describe, it, expect } from "vitest";
import {
  defaultText,
  defaultScreenshotTextBundle,
  defaultDevice,
} from "./project";
import type { SceneElement } from "./project";

describe("defaultText", () => {
  it("default headline includes italic/underline/strikethrough flags as false", () => {
    const t = defaultText("top", true);
    expect(t.italic).toBe(false);
    expect(t.underline).toBe(false);
    expect(t.strikethrough).toBe(false);
  });

  it("default subheadline includes the same flags", () => {
    const t = defaultText("bottom", false);
    expect(t.italic).toBe(false);
    expect(t.underline).toBe(false);
    expect(t.strikethrough).toBe(false);
  });
});

describe("ScreenshotTextBundle", () => {
  it("has perLanguageLayout false by default", () => {
    const bundle = defaultScreenshotTextBundle();
    expect(bundle.perLanguageLayout).toBe(false);
  });

  it("has empty languageLayouts by default", () => {
    const bundle = defaultScreenshotTextBundle();
    expect(bundle.languageLayouts).toEqual({});
  });

  it("has headline + subheadline TextConfigs", () => {
    const bundle = defaultScreenshotTextBundle();
    expect(bundle.headline.enabled).toBe(true);
    expect(bundle.subheadline.enabled).toBe(false);
  });
});

describe("defaultDevice extensions", () => {
  it("has perspective 0 by default", () => {
    const d = defaultDevice();
    expect(d.perspective).toBe(0);
  });

  it("has no frameColorPresetId by default", () => {
    const d = defaultDevice();
    expect(d.frameColorPresetId).toBeUndefined();
  });
});

describe("SceneElement extensions", () => {
  it("text element accepts frameOffsetY", () => {
    const el: SceneElement = {
      id: "e1",
      layer: "aboveScreenshot",
      positionX: 0,
      positionY: 0,
      size: 1,
      rotation: 0,
      opacity: 100,
      kind: "text",
      text: { tr: "x" },
      font: "Inter",
      weight: "Bold",
      color: "#000",
      frame: "none",
      frameColor: "#000",
      frameScale: 1,
      frameOffsetY: 5,
    };
    expect(el.kind === "text" ? el.frameOffsetY : 0).toBe(5);
  });

  it("graphic element accepts optional tint", () => {
    const el: SceneElement = {
      id: "e2",
      layer: "aboveScreenshot",
      positionX: 0,
      positionY: 0,
      size: 1,
      rotation: 0,
      opacity: 100,
      kind: "graphic",
      blobId: "b",
      flipH: false,
      flipV: false,
      tint: "#ff0000",
    };
    expect(el.kind === "graphic" ? el.tint : undefined).toBe("#ff0000");
  });
});
