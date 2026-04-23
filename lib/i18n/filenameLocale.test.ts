import { describe, expect, it } from "vitest";
import {
  ALL_LOCALES,
  detectLocaleFromFilename,
  getBaseFilename,
} from "./filenameLocale";

describe("getBaseFilename", () => {
  it("strips _de suffix before extension", () => {
    expect(getBaseFilename("screenshot_de.png", ALL_LOCALES)).toBe("screenshot");
  });

  it("strips -fr suffix", () => {
    expect(getBaseFilename("image-fr.jpg", ALL_LOCALES)).toBe("image");
  });

  it("returns stem when no locale suffix", () => {
    expect(getBaseFilename("plain.png", ALL_LOCALES)).toBe("plain");
  });
});

describe("detectLocaleFromFilename", () => {
  it("detects de", () => {
    expect(detectLocaleFromFilename("x_de.png", ALL_LOCALES, "tr")).toBe("de");
  });

  it("returns fallback when no pattern", () => {
    expect(detectLocaleFromFilename("plain.png", ALL_LOCALES, "tr")).toBe("tr");
  });

  it("respects subset of locales", () => {
    expect(detectLocaleFromFilename("a_de.png", ["en", "de"] as const, "en")).toBe(
      "de",
    );
  });
});
