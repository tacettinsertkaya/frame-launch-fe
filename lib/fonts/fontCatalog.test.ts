import { describe, it, expect } from "vitest";
import {
  getFontOptionsForCategory,
  isSystemFontName,
  resolveTextFontCss,
  getAllGoogleFontFamilies,
} from "./fontCatalog";

describe("fontCatalog", () => {
  it("resolveTextFontCss uses stack for system fonts", () => {
    expect(resolveTextFontCss("SF Pro Display")).toContain("-apple-system");
    expect(resolveTextFontCss("Georgia")).toBe("Georgia, serif");
  });

  it("resolveTextFontCss quotes Google families", () => {
    expect(resolveTextFontCss("Open Sans")).toBe(`"Open Sans", var(--font-sans)`);
    expect(resolveTextFontCss("Inter")).toBe(`"Inter", var(--font-sans)`);
  });

  it("isSystemFontName", () => {
    expect(isSystemFontName("Arial")).toBe(true);
    expect(isSystemFontName("Inter")).toBe(false);
  });

  it("getFontOptionsForCategory popular is non-empty", () => {
    const p = getFontOptionsForCategory("popular");
    expect(p.length).toBeGreaterThan(10);
    expect(p.every((x) => x.kind === "google")).toBe(true);
  });

  it("getAllGoogleFontFamilies is sorted and deduped", () => {
    const all = getAllGoogleFontFamilies();
    const sorted = [...all].sort((a, b) => a.localeCompare(b));
    expect(all).toEqual(sorted);
    expect(new Set(all).size).toBe(all.length);
  });
});
