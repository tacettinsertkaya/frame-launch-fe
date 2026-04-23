import type {
  Project,
  Screenshot,
  TextConfig,
  ScreenshotTextBundle,
  DeviceConfig,
  BackgroundConfig,
  Locale,
  DeviceSizeId,
} from "@/lib/types/project";
import {
  defaultBackground,
  defaultDevice,
  defaultText,
} from "@/lib/types/project";
import { resolveDeviceSizeId } from "@/lib/devices/registry";

interface RawTextLeaf {
  enabled?: boolean;
  text?: Partial<Record<Locale, string>>;
  font?: string;
  weight?: string;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  perLanguageLayout?: boolean;
  position?: "top" | "bottom";
  verticalOffset?: number;
  lineHeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
  opacity?: number;
}

interface RawScreenshot {
  id?: string;
  name?: string;
  deviceSizeId?: string;
  customDimensions?: { width: number; height: number };
  uploads?: Partial<Record<Locale, string>>;
  uploadMeta?: Partial<
    Record<Locale, { filename: string; baseFilename: string; uploadedAt: string }>
  >;
  background?: Partial<BackgroundConfig>;
  device?: Partial<DeviceConfig>;
  text?: {
    headline?: RawTextLeaf;
    subheadline?: RawTextLeaf;
    perLanguageLayout?: boolean;
    languageLayouts?: Partial<Record<Locale, unknown>>;
  };
  elements?: unknown[];
  popouts?: unknown[];
}

interface RawProject {
  id?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: number;
  defaultLocale?: Locale;
  activeLocales?: Locale[];
  currentLocale?: Locale;
  defaultDeviceSizeId?: DeviceSizeId;
  defaultCustomDimensions?: { width: number; height: number };
  screenshots?: RawScreenshot[];
  lastStyleSource?: string;
}

function migrateText(raw: RawTextLeaf | undefined, isHeadline: boolean): TextConfig {
  const fallback = defaultText("top", isHeadline);
  if (!raw) return fallback;
  return {
    ...fallback,
    ...raw,
    italic: raw.italic ?? false,
    underline: raw.underline ?? false,
    strikethrough: raw.strikethrough ?? false,
    perLanguageLayout: raw.perLanguageLayout ?? false,
  } as TextConfig;
}

function migrateTextBundle(raw: RawScreenshot["text"]): ScreenshotTextBundle {
  const headline = migrateText(raw?.headline, true);
  const subheadline = migrateText(raw?.subheadline, false);
  const perLang = raw?.perLanguageLayout ?? raw?.headline?.perLanguageLayout ?? false;
  return {
    headline,
    subheadline,
    perLanguageLayout: perLang,
    languageLayouts:
      (raw?.languageLayouts as ScreenshotTextBundle["languageLayouts"]) ?? {},
  };
}

function migrateDevice(raw: Partial<DeviceConfig> | undefined): DeviceConfig {
  const base = defaultDevice();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    rotation: raw.rotation ?? base.rotation,
    shadow: { ...base.shadow, ...(raw.shadow ?? {}) },
    border: { ...base.border, ...(raw.border ?? {}) },
    perspective: raw.perspective ?? 0,
  };
}

function migrateBackground(raw: Partial<BackgroundConfig> | undefined): BackgroundConfig {
  const base = defaultBackground();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    gradient: raw.gradient ?? base.gradient,
    overlay: { ...base.overlay, ...(raw.overlay ?? {}) },
    noise: { ...base.noise, ...(raw.noise ?? {}) },
  };
}

function cryptoLikeId(prefix = "s_"): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function migrateScreenshot(raw: RawScreenshot): Screenshot {
  const deviceSizeId = resolveDeviceSizeId(raw.deviceSizeId ?? "iphone-69");
  return {
    id: raw.id ?? cryptoLikeId(),
    name: raw.name ?? "Ekran",
    deviceSizeId,
    customDimensions: raw.customDimensions,
    uploads: raw.uploads ?? {},
    uploadMeta: raw.uploadMeta ?? {},
    background: migrateBackground(raw.background),
    device: migrateDevice(raw.device),
    text: migrateTextBundle(raw.text),
    elements: (raw.elements ?? []) as Screenshot["elements"],
    popouts: (raw.popouts ?? []) as Screenshot["popouts"],
  };
}

export function migrateLegacyProject(raw: unknown): Project {
  const p = (raw ?? {}) as RawProject;
  const v = p.schemaVersion ?? 1;

  if (v >= 3) {
    return {
      id: p.id ?? cryptoLikeId("p_"),
      name: p.name ?? "Project",
      createdAt: p.createdAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? new Date().toISOString(),
      schemaVersion: 3,
      defaultLocale: p.defaultLocale ?? "tr",
      activeLocales: p.activeLocales?.length ? p.activeLocales : [p.defaultLocale ?? "tr"],
      currentLocale: p.currentLocale ?? p.defaultLocale ?? "tr",
      defaultDeviceSizeId: p.defaultDeviceSizeId ?? "iphone-69",
      defaultCustomDimensions: p.defaultCustomDimensions,
      screenshots: (p.screenshots ?? []) as Screenshot[],
      lastStyleSource: p.lastStyleSource,
    };
  }

  const screenshots = (p.screenshots ?? []).map(migrateScreenshot);
  const defaultDeviceSizeId: DeviceSizeId = p.defaultDeviceSizeId
    ? resolveDeviceSizeId(p.defaultDeviceSizeId)
    : screenshots[0]?.deviceSizeId ?? "iphone-69";

  return {
    id: p.id ?? cryptoLikeId("p_"),
    name: p.name ?? "Migrated Project",
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 3,
    defaultLocale: p.defaultLocale ?? "tr",
    activeLocales: p.activeLocales?.length ? p.activeLocales : [p.defaultLocale ?? "tr"],
    currentLocale: p.currentLocale ?? p.defaultLocale ?? "tr",
    defaultDeviceSizeId,
    defaultCustomDimensions: p.defaultCustomDimensions,
    screenshots,
    lastStyleSource: p.lastStyleSource,
  };
}
