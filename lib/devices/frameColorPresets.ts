export interface FrameColorPreset {
  id: string;
  label: string;
  color: string;
}

export const IPHONE_FRAME_PRESETS: FrameColorPreset[] = [
  { id: "black-titanium", label: "Black Titanium", color: "#3a3632" },
  { id: "natural-titanium", label: "Natural Titanium", color: "#9d927f" },
  { id: "white-titanium", label: "White Titanium", color: "#e3ddd4" },
  { id: "blue-titanium", label: "Blue Titanium", color: "#3d4d5c" },
  { id: "desert-titanium", label: "Desert Titanium", color: "#c4a882" },
  { id: "deep-purple", label: "Deep Purple", color: "#5b4a6e" },
  { id: "gold", label: "Gold", color: "#e3c8a0" },
  { id: "red", label: "Product Red", color: "#c1272d" },
];

export const SAMSUNG_FRAME_PRESETS: FrameColorPreset[] = [
  { id: "titanium-black", label: "Titanium Black", color: "#2a2a2a" },
  { id: "titanium-gray", label: "Titanium Gray", color: "#8a8a8a" },
  { id: "titanium-silverblue", label: "Titanium Silverblue", color: "#a8b8c8" },
  { id: "titanium-whitesilver", label: "Titanium Whitesilver", color: "#e8e4df" },
  { id: "titanium-pinkgold", label: "Titanium Pinkgold", color: "#d4a89a" },
  { id: "titanium-jadegreen", label: "Titanium Jadegreen", color: "#9aaa9c" },
];

export const GENERIC_FRAME_PRESETS: FrameColorPreset[] = [
  { id: "black", label: "Black", color: "#1a1a1a" },
  { id: "space-gray", label: "Space Gray", color: "#4a4a4a" },
  { id: "silver", label: "Silver", color: "#c0c0c0" },
  { id: "white", label: "White", color: "#f0f0f0" },
];

export function getFramePresets(
  deviceSizeId: string,
): FrameColorPreset[] {
  if (
    deviceSizeId.startsWith("iphone") ||
    deviceSizeId.startsWith("ipad")
  ) {
    return IPHONE_FRAME_PRESETS;
  }
  if (deviceSizeId.startsWith("android")) {
    return SAMSUNG_FRAME_PRESETS;
  }
  return GENERIC_FRAME_PRESETS;
}
