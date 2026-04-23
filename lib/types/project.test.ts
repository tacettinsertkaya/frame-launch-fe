import { describe, it, expect } from "vitest";
import { defaultText, defaultScreenshotTextBundle } from "./project";

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
