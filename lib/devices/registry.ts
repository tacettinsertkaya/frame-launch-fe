import type { DeviceSizeId } from "@/lib/types/project";

export type DeviceCategory = "iOS" | "Android" | "Marketing" | "Custom";

export interface DeviceSize {
  id: DeviceSizeId;
  label: string;
  width: number;
  height: number;
  category: DeviceCategory;
  /** ekran (screen) alanının kenarlardan içeriye göreli oran (%) — sadece telefon/tablet için */
  bezel?: { top: number; right: number; bottom: number; left: number };
}

export const DEVICE_SIZES: DeviceSize[] = [
  {
    id: "iphone-69",
    label: 'iPhone 6.9"',
    width: 1320,
    height: 2868,
    category: "iOS",
    bezel: { top: 3.2, right: 3.2, bottom: 3.2, left: 3.2 },
  },
  {
    id: "iphone-67",
    label: 'iPhone 6.7"',
    width: 1290,
    height: 2796,
    category: "iOS",
    bezel: { top: 3.2, right: 3.2, bottom: 3.2, left: 3.2 },
  },
  {
    id: "iphone-65",
    label: 'iPhone 6.5"',
    width: 1284,
    height: 2778,
    category: "iOS",
    bezel: { top: 3.2, right: 3.2, bottom: 3.2, left: 3.2 },
  },
  {
    id: "iphone-55",
    label: 'iPhone 5.5"',
    width: 1242,
    height: 2208,
    category: "iOS",
    bezel: { top: 5.5, right: 2.8, bottom: 5.5, left: 2.8 },
  },
  {
    id: "ipad-129",
    label: 'iPad 12.9"',
    width: 2048,
    height: 2732,
    category: "iOS",
    bezel: { top: 3.0, right: 3.0, bottom: 3.0, left: 3.0 },
  },
  {
    id: "ipad-11",
    label: 'iPad 11"',
    width: 1668,
    height: 2388,
    category: "iOS",
    bezel: { top: 3.0, right: 3.0, bottom: 3.0, left: 3.0 },
  },
  {
    id: "android-phone",
    label: "Android Phone",
    width: 1080,
    height: 1920,
    category: "Android",
    bezel: { top: 4.0, right: 3.5, bottom: 4.0, left: 3.5 },
  },
  {
    id: "android-phone-hd",
    label: "Android Phone HD",
    width: 1440,
    height: 2560,
    category: "Android",
    bezel: { top: 3.5, right: 3.0, bottom: 3.5, left: 3.0 },
  },
  {
    id: "android-tablet-7",
    label: 'Android Tablet 7"',
    width: 1200,
    height: 1920,
    category: "Android",
    bezel: { top: 3.5, right: 3.5, bottom: 3.5, left: 3.5 },
  },
  {
    id: "android-tablet-10",
    label: 'Android Tablet 10"',
    width: 1600,
    height: 2560,
    category: "Android",
    bezel: { top: 3.5, right: 3.5, bottom: 3.5, left: 3.5 },
  },
  { id: "og", label: "Open Graph", width: 1200, height: 630, category: "Marketing" },
  { id: "twitter-card", label: "Twitter / X Card", width: 1200, height: 675, category: "Marketing" },
  { id: "website-hero", label: "Website Hero", width: 1920, height: 1080, category: "Marketing" },
  { id: "feature-graphic", label: "Feature Graphic", width: 1024, height: 500, category: "Marketing" },
  { id: "custom", label: "Custom Size", width: 1200, height: 800, category: "Custom" },
];

export function getDeviceSize(id: DeviceSizeId): DeviceSize {
  const found = DEVICE_SIZES.find((d) => d.id === id);
  if (!found) {
    throw new Error(`Unknown device size: ${id}`);
  }
  return found;
}

export function getEffectiveDimensions(
  id: DeviceSizeId,
  custom?: { width: number; height: number },
): { width: number; height: number } {
  if (id === "custom" && custom) return custom;
  const d = getDeviceSize(id);
  return { width: d.width, height: d.height };
}

export function isPhoneOrTablet(id: DeviceSizeId): boolean {
  const d = getDeviceSize(id);
  return d.category === "iOS" || d.category === "Android";
}
