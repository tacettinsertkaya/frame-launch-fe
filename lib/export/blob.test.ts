import { describe, it, expect } from "vitest";
import { dataUrlToBase64 } from "./blob";

describe("dataUrlToBase64", () => {
  it("strips data URL prefix", () => {
    expect(dataUrlToBase64("data:image/png;base64,QUJD")).toBe("QUJD");
  });

  it("throws on invalid input", () => {
    expect(() => dataUrlToBase64("not-a-data-url")).toThrow("Invalid data URL");
  });
});
