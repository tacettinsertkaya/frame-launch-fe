import type { DeviceConfig, DevicePositionPreset } from "@/lib/types/project";

export type DevicePositionPresetId = DevicePositionPreset;

export interface PositionPreset {
  id: DevicePositionPresetId;
  label: string;
  scale: number;
  horizontalPos: number;
  verticalPos: number;
  tiltRotation: number;
  perspective: number;
}

export const POSITION_PRESETS: Record<DevicePositionPresetId, PositionPreset> = {
  centered: {
    id: "centered",
    label: "Ortalı",
    scale: 70,
    horizontalPos: 50,
    verticalPos: 50,
    tiltRotation: 0,
    perspective: 0,
  },
  bleedBottom: {
    id: "bleedBottom",
    label: "Alt Kayma",
    scale: 85,
    horizontalPos: 50,
    verticalPos: 100,
    tiltRotation: 0,
    perspective: 0,
  },
  bleedTop: {
    id: "bleedTop",
    label: "Üst Kayma",
    scale: 85,
    horizontalPos: 50,
    verticalPos: 0,
    tiltRotation: 0,
    perspective: 0,
  },
  floatCenter: {
    id: "floatCenter",
    label: "Yüzen Orta",
    scale: 60,
    horizontalPos: 50,
    verticalPos: 50,
    tiltRotation: 0,
    perspective: 0,
  },
  tiltLeft: {
    id: "tiltLeft",
    label: "Sol Eğik",
    scale: 65,
    horizontalPos: 50,
    verticalPos: 60,
    tiltRotation: -8,
    perspective: 0,
  },
  tiltRight: {
    id: "tiltRight",
    label: "Sağ Eğik",
    scale: 65,
    horizontalPos: 50,
    verticalPos: 60,
    tiltRotation: 8,
    perspective: 0,
  },
  perspective: {
    id: "perspective",
    label: "Perspektif",
    scale: 65,
    horizontalPos: 50,
    verticalPos: 50,
    tiltRotation: 0,
    perspective: 15,
  },
  floatBottom: {
    id: "floatBottom",
    label: "Yüzen Alt",
    scale: 55,
    horizontalPos: 50,
    verticalPos: 70,
    tiltRotation: 0,
    perspective: 0,
  },
};

export function applyPositionPreset(
  presetId: DevicePositionPresetId,
  device: DeviceConfig,
): DeviceConfig {
  const preset = POSITION_PRESETS[presetId];
  if (!preset) return device;
  return {
    ...device,
    positionPreset: preset.id,
    scale: preset.scale,
    horizontalPos: preset.horizontalPos,
    verticalPos: preset.verticalPos,
    tiltRotation: preset.tiltRotation,
    perspective: preset.perspective,
  };
}

export const POSITION_PRESET_ORDER: DevicePositionPresetId[] = [
  "centered",
  "bleedBottom",
  "bleedTop",
  "floatCenter",
  "tiltLeft",
  "tiltRight",
  "perspective",
  "floatBottom",
];
