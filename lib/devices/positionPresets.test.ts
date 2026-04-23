import { describe, expect, it } from "vitest";
import { defaultDevice } from "@/lib/types/project";
import {
  POSITION_PRESETS,
  applyPositionPreset,
  type DevicePositionPresetId,
} from "./positionPresets";

describe("POSITION_PRESETS map", () => {
  it("defines all 8 preset entries", () => {
    const ids: DevicePositionPresetId[] = [
      "centered",
      "bleedBottom",
      "bleedTop",
      "floatCenter",
      "tiltLeft",
      "tiltRight",
      "perspective",
      "floatBottom",
    ];
    for (const id of ids) {
      expect(POSITION_PRESETS[id]).toBeDefined();
      expect(POSITION_PRESETS[id].id).toBe(id);
      expect(typeof POSITION_PRESETS[id].label).toBe("string");
    }
  });

  it("each preset has fields within sane ranges", () => {
    for (const p of Object.values(POSITION_PRESETS)) {
      expect(p.scale).toBeGreaterThanOrEqual(0);
      expect(p.scale).toBeLessThanOrEqual(120);
      expect(p.horizontalPos).toBeGreaterThanOrEqual(0);
      expect(p.horizontalPos).toBeLessThanOrEqual(100);
      expect(p.verticalPos).toBeGreaterThanOrEqual(0);
      expect(p.verticalPos).toBeLessThanOrEqual(100);
      expect(p.tiltRotation).toBeGreaterThanOrEqual(-45);
      expect(p.tiltRotation).toBeLessThanOrEqual(45);
      expect(p.perspective).toBeGreaterThanOrEqual(0);
      expect(p.perspective).toBeLessThanOrEqual(30);
    }
  });
});

describe("applyPositionPreset()", () => {
  it("applies centered preset values onto the device", () => {
    const dev = defaultDevice();
    const next = applyPositionPreset("centered", dev);
    expect(next.scale).toBe(70);
    expect(next.horizontalPos).toBe(50);
    expect(next.verticalPos).toBe(50);
    expect(next.tiltRotation).toBe(0);
    expect(next.perspective).toBe(0);
    expect(next.positionPreset).toBe("centered");
  });

  it("applies tilt-left preset (negative rotation)", () => {
    const dev = defaultDevice();
    const next = applyPositionPreset("tiltLeft", dev);
    expect(next.tiltRotation).toBe(-8);
    expect(next.positionPreset).toBe("tiltLeft");
  });

  it("applies perspective preset (perspective > 0)", () => {
    const dev = defaultDevice();
    const next = applyPositionPreset("perspective", dev);
    expect(next.perspective).toBe(15);
    expect(next.positionPreset).toBe("perspective");
  });

  it("does not mutate unrelated device fields (frameColor, cornerRadius, shadow, border)", () => {
    const dev = defaultDevice();
    const original = JSON.parse(JSON.stringify(dev));
    const next = applyPositionPreset("bleedBottom", dev);

    expect(next.frameColor).toBe(original.frameColor);
    expect(next.cornerRadius).toBe(original.cornerRadius);
    expect(next.shadow).toEqual(original.shadow);
    expect(next.border).toEqual(original.border);
    expect(next.mode).toBe(original.mode);
    expect(next.model).toBe(original.model);
  });

  it("does not mutate the original device object (returns new ref)", () => {
    const dev = defaultDevice();
    const next = applyPositionPreset("floatCenter", dev);
    expect(next).not.toBe(dev);
    expect(dev.scale).toBe(defaultDevice().scale);
  });

  it("returns the device unchanged for an unknown preset id", () => {
    const dev = defaultDevice();
    const next = applyPositionPreset(
      "nonexistent" as DevicePositionPresetId,
      dev,
    );
    expect(next).toEqual(dev);
  });
});
