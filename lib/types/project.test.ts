import { describe, it, expect } from "vitest";
import { defaultText } from "./project";

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
