/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { makeBlankProject } from "./projectsStore";

describe("makeBlankProject", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("sets schemaVersion to 3", () => {
    const p = makeBlankProject("Test");
    expect(p.schemaVersion).toBe(3);
  });

  it("sets currentLocale equal to defaultLocale", () => {
    const p = makeBlankProject("Test");
    expect(p.currentLocale).toBe(p.defaultLocale);
  });

  it("sets defaultDeviceSizeId to iphone-69", () => {
    const p = makeBlankProject("Test");
    expect(p.defaultDeviceSizeId).toBe("iphone-69");
  });
});
