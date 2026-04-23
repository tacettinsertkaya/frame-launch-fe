import { describe, it, expect } from "vitest";
import { parseMagicalTitlesResponse } from "./magicalTitlesVision";

describe("parseMagicalTitlesResponse", () => {
  it("parses fenced JSON with string keys", () => {
    const raw = '```json\n{"0":{"headline":"A","subheadline":"B b"}}\n```';
    const r = parseMagicalTitlesResponse(raw);
    expect(r["0"]).toEqual({ headline: "A", subheadline: "B b" });
  });

  it("extracts outer object from noise", () => {
    const r = parseMagicalTitlesResponse('ok {"1":{"headline":"X"}} tail');
    expect(r["1"]?.headline).toBe("X");
  });
});
