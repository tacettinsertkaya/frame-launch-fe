import { describe, expect, it } from "vitest";
import {
  computeSidePreviewScale,
  getSidePreviewSlotIndices,
} from "./sidePreviewLayout";

describe("computeSidePreviewScale", () => {
  it("caps to max 400×700 box and 1:1 at most", () => {
    const s1 = computeSidePreviewScale(1320, 2868);
    expect(s1).toBeLessThanOrEqual(1);
    expect(1320 * s1).toBeLessThanOrEqual(400);
    expect(2868 * s1).toBeLessThanOrEqual(700);
  });

  it("returns 1 for small content", () => {
    expect(computeSidePreviewScale(300, 600)).toBe(1);
  });

  it("handles pathological size with small positive scale", () => {
    const s = computeSidePreviewScale(0, 100);
    expect(s).toBeGreaterThan(0);
  });
});

describe("getSidePreviewSlotIndices", () => {
  it("returns all null for empty", () => {
    expect(getSidePreviewSlotIndices(0, 0).left).toBeNull();
  });

  it("one item: no neighbors or far", () => {
    const r = getSidePreviewSlotIndices(0, 1);
    expect(r).toEqual({ farLeft: null, left: null, right: null, farRight: null });
  });

  it("two items: left/right only on edges", () => {
    const a0 = getSidePreviewSlotIndices(0, 2);
    expect(a0).toEqual({ farLeft: null, left: null, right: 1, farRight: null });
    const a1 = getSidePreviewSlotIndices(1, 2);
    expect(a1).toEqual({ farLeft: null, left: 0, right: null, farRight: null });
  });

  it("clamps out-of-range active to bounds", () => {
    const r = getSidePreviewSlotIndices(99, 2);
    expect(r.left).toBe(0);
  });

  it("four items index 1: no farLeft, rest filled", () => {
    const r = getSidePreviewSlotIndices(1, 4);
    expect(r).toEqual({ farLeft: null, left: 0, right: 2, farRight: 3 });
  });

  it("five items index 2: full spread", () => {
    const r = getSidePreviewSlotIndices(2, 5);
    expect(r).toEqual({ farLeft: 0, left: 1, right: 3, farRight: 4 });
  });
});
