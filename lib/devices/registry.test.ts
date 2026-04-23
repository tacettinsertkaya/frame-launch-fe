import { describe, it, expect } from "vitest";
import { resolveDeviceSizeId } from "./registry";

describe("resolveDeviceSizeId", () => {
  it("maps appscreen iphone-6.9 to iphone-69", () => {
    expect(resolveDeviceSizeId("iphone-6.9")).toBe("iphone-69");
  });
  it("maps web-og to og", () => {
    expect(resolveDeviceSizeId("web-og")).toBe("og");
  });
  it("returns id unchanged when already canonical", () => {
    expect(resolveDeviceSizeId("iphone-69")).toBe("iphone-69");
  });
  it("returns custom for unknown ids fallback", () => {
    expect(resolveDeviceSizeId("non-existent")).toBe("custom");
  });
});
