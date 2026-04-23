export type Locale = "tr" | "en" | "de" | "es" | "fr" | "ja" | "pt";

export type Hex = string;

export type DeviceSizeId =
  | "iphone-69"
  | "iphone-67"
  | "iphone-65"
  | "iphone-55"
  | "ipad-129"
  | "ipad-11"
  | "android-phone"
  | "android-phone-hd"
  | "android-tablet-7"
  | "android-tablet-10"
  | "og"
  | "twitter-card"
  | "website-hero"
  | "feature-graphic"
  | "custom";

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

export interface BorderConfig {
  enabled: boolean;
  color: string;
  width: number;
  opacity: number;
}

export interface BackgroundConfig {
  type: "gradient" | "solid" | "image";
  gradient: {
    direction: number;
    stops: { color: Hex; position: number }[];
  };
  solidColor: Hex;
  image?: { blobId: string; fit: "cover" | "contain" | "stretch"; blur: number };
  overlay: { color: Hex; opacity: number };
  noise: { enabled: boolean; intensity: number };
}

export type DevicePositionPreset =
  | "centered"
  | "bleedBottom"
  | "bleedTop"
  | "floatCenter"
  | "tiltLeft"
  | "tiltRight"
  | "perspective"
  | "floatBottom";

export interface DeviceConfig {
  mode: "2d" | "3d";
  model: "iphone" | "samsung";
  rotation: { x: number; y: number; z: number };
  positionPreset: DevicePositionPreset;
  scale: number;
  verticalPos: number;
  horizontalPos: number;
  frameColor: Hex;
  cornerRadius: number;
  tiltRotation: number;
  shadow: ShadowConfig;
  border: BorderConfig;
}

export type TextWeight =
  | "Light"
  | "Regular"
  | "Medium"
  | "Semibold"
  | "Bold"
  | "Heavy"
  | "Black";

export interface TextConfig {
  enabled: boolean;
  text: Partial<Record<Locale, string>>;
  font: string;
  weight: TextWeight;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  perLanguageLayout: boolean;
  position: "top" | "bottom";
  verticalOffset: number;
  lineHeight: number;
  color: Hex;
  align: "left" | "center" | "right";
  fontSize: number;
  opacity?: number;
}

export type Layer = "behindScreenshot" | "aboveScreenshot" | "aboveText";

interface ElementBase {
  id: string;
  layer: Layer;
  positionX: number;
  positionY: number;
  size: number;
  rotation: number;
  opacity: number;
}

export type TextFrame =
  | "none"
  | "laurel"
  | "simpleLaurelStar"
  | "detailedLaurel"
  | "detailedLaurelStar"
  | "circleBadge"
  | "shieldBadge";

export type SceneElement =
  | (ElementBase & {
      kind: "icon";
      iconName: string;
      color: Hex;
      strokeWidth: number;
      shadow: ShadowConfig;
    })
  | (ElementBase & { kind: "emoji"; emoji: string })
  | (ElementBase & {
      kind: "text";
      text: Partial<Record<Locale, string>>;
      font: string;
      weight: TextWeight;
      color: Hex;
      frame: TextFrame;
      frameColor: Hex;
      frameScale: number;
    })
  | (ElementBase & { kind: "graphic"; blobId: string; flipH: boolean; flipV: boolean });

export interface Popout {
  id: string;
  crop: { x: number; y: number; width: number; height: number };
  display: {
    x: number;
    y: number;
    size: number;
    rotation: number;
    opacity: number;
    cornerRadius: number;
  };
  shadow: ShadowConfig;
  border: BorderConfig;
}

export interface Screenshot {
  id: string;
  name: string;
  deviceSizeId: DeviceSizeId;
  customDimensions?: { width: number; height: number };
  uploads: Partial<Record<Locale, string>>;
  background: BackgroundConfig;
  device: DeviceConfig;
  text: { headline: TextConfig; subheadline: TextConfig };
  elements: SceneElement[];
  popouts: Popout[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 2;
  defaultLocale: Locale;
  activeLocales: Locale[];
  screenshots: Screenshot[];
  lastStyleSource?: string;
}

export const defaultShadow = (): ShadowConfig => ({
  enabled: true,
  color: "#000000",
  blur: 40,
  opacity: 30,
  offsetX: 0,
  offsetY: 20,
});

export const defaultBorder = (): BorderConfig => ({
  enabled: false,
  color: "#000000",
  width: 12,
  opacity: 100,
});

export const defaultBackground = (): BackgroundConfig => ({
  type: "gradient",
  gradient: {
    direction: 135,
    stops: [
      { color: "#e8c610", position: 0 },
      { color: "#fff066", position: 100 },
    ],
  },
  solidColor: "#e8c610",
  overlay: { color: "#000000", opacity: 0 },
  noise: { enabled: false, intensity: 10 },
});

export const defaultDevice = (): DeviceConfig => ({
  mode: "2d",
  model: "iphone",
  rotation: { x: 0, y: 0, z: 0 },
  positionPreset: "centered",
  scale: 70,
  verticalPos: 55,
  horizontalPos: 50,
  frameColor: "#000000",
  cornerRadius: 24,
  tiltRotation: 0,
  shadow: defaultShadow(),
  border: defaultBorder(),
});

export const defaultText = (
  position: "top" | "bottom" = "top",
  isHeadline = true,
): TextConfig => ({
  enabled: true,
  text: {},
  font: "Inter",
  weight: isHeadline ? "Bold" : "Medium",
  italic: false,
  underline: false,
  strikethrough: false,
  perLanguageLayout: false,
  position,
  verticalOffset: 12,
  lineHeight: 110,
  color: "#000000",
  align: "center",
  fontSize: isHeadline ? 56 : 28,
  opacity: isHeadline ? undefined : 70,
});
