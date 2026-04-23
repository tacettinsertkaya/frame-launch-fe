# Foundation & Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Genişletilmiş tip sistemi, yeni store alanları, settings store ve schema-version 3 migration ekleyerek sonraki tüm appscreen-parity alt-projeleri için temeli kur. UI veya render değişikliği yok.

**Architecture:**
- `lib/types/project.ts` genişletilir, `ScreenshotTextBundle` ve `LanguageLayoutSettings` tipleri eklenir, `schemaVersion: 3` olur
- Yeni `lib/persistence/migrate.ts` v2 → v3 dönüşümü ve eski device size id alias'larını yapar
- Yeni `store/settingsStore.ts` theme + AI provider + API key + model seçimini `localStorage`'da appscreen ile birebir aynı anahtarlarla saklar
- `store/editorStore.ts` ve `store/projectsStore.ts` yeni alan/aksiyonlarla genişletilir
- Vitest test runner kurulur, migration ve settings store için birim testler yazılır
- Tüm yeni alanlar opsiyonel veya default değerli → mevcut UI bileşenleri (Topbar, RightPanel, paneller) değiştirilmeden çalışmaya devam eder

**Tech Stack:** TypeScript 5.7, Zustand 5, Next.js 15, vitest (yeni), `lz-string`, `idb-keyval`, jsdom

---

## File Structure

| Dosya | Sorumluluk | Tip |
|---|---|---|
| `lib/types/project.ts` | Tüm domain tipleri + default factory'ler | MODIFY |
| `lib/persistence/migrate.ts` | v2→v3 dönüşüm, eski id alias'ları | CREATE |
| `lib/persistence/migrate.test.ts` | Migration birim testleri | CREATE |
| `lib/persistence/localProjects.ts` | `loadProjects()` migration çağrısı | MODIFY |
| `lib/devices/registry.ts` | `LEGACY_DEVICE_SIZE_ALIASES` map'i | MODIFY |
| `store/editorStore.ts` | Yeni state alanları + setter'lar + RightPanelTab genişletme | MODIFY |
| `store/projectsStore.ts` | Yeni aksiyonlar (`duplicateProject`, `reorderScreenshots`, locale aksiyonları) | MODIFY |
| `store/settingsStore.ts` | Theme + AI provider + apiKey + model state, hydrate/setter'lar | CREATE |
| `store/settingsStore.test.ts` | settingsStore birim testleri | CREATE |
| `lib/ai/providers.ts` | `AI_PROVIDERS` config sabiti (anthropic/openai/google modelleri, key prefix'leri, storage key'leri) | CREATE |
| `vitest.config.ts` | Vitest yapılandırması (jsdom env, alias) | CREATE |
| `package.json` | `vitest`, `jsdom`, `@vitest/ui` devDeps + `test` script | MODIFY |
| `tsconfig.json` | (gerekirse) `vitest/globals` types | MODIFY |

---

## Task 1: Vitest kurulumu

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Test bağımlılıklarını ekle**

```bash
cd /Users/tacettinsertkaya/Desktop/frame-launch-fe
pnpm add -D vitest@^2.1.8 @vitest/ui@^2.1.8 jsdom@^25.0.1
```

Beklenen: `package.json` `devDependencies` altında `vitest`, `@vitest/ui`, `jsdom` çıkar; `pnpm-lock.yaml` güncellenir.

- [ ] **Step 2: `vitest.config.ts` oluştur**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["lib/**/*.test.ts", "store/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3: `package.json` script'leri ekle**

`scripts` objesine ekle:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Sanity test (geçici)**

Geçici dosya: `lib/persistence/_sanity.test.ts`

```ts
import { describe, it, expect } from "vitest";

describe("vitest sanity", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Sanity test'i çalıştır**

Run: `pnpm test`  
Beklenen: 1 passed

- [ ] **Step 6: Sanity dosyasını sil**

```bash
rm /Users/tacettinsertkaya/Desktop/frame-launch-fe/lib/persistence/_sanity.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: add vitest + jsdom for unit testing"
```

---

## Task 2: Tip genişletmeleri — `TextConfig` style flag'leri

**Files:**
- Modify: `lib/types/project.ts:84-97` (`TextConfig` interface)
- Modify: `lib/types/project.ts:226-242` (`defaultText`)
- Test: `lib/types/project.test.ts` (yeni)

- [ ] **Step 1: Failing test yaz**

`lib/types/project.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test lib/types/project.test.ts`  
Beklenen: FAIL — `t.italic` undefined / type error

- [ ] **Step 3: `TextConfig` interface'ine 3 alan ekle**

`lib/types/project.ts:84-97`:

```ts
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
```

- [ ] **Step 4: `defaultText` factory'sine 3 alan ekle**

`lib/types/project.ts:226-242`:

```ts
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
```

- [ ] **Step 5: Run test → PASS**

Run: `pnpm test lib/types/project.test.ts`  
Beklenen: 2 passed

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors

- [ ] **Step 7: Commit**

```bash
git add lib/types/project.ts lib/types/project.test.ts
git commit -m "feat(types): add italic/underline/strikethrough to TextConfig"
```

---

## Task 3: `LanguageLayoutSettings` ve `ScreenshotTextBundle` tipleri

**Files:**
- Modify: `lib/types/project.ts`
- Modify: `lib/types/project.test.ts`

- [ ] **Step 1: Failing test yaz**

`lib/types/project.test.ts`'e ekle:

```ts
import { defaultScreenshotTextBundle } from "./project";

describe("ScreenshotTextBundle", () => {
  it("has perLanguageLayout false by default", () => {
    const bundle = defaultScreenshotTextBundle();
    expect(bundle.perLanguageLayout).toBe(false);
  });

  it("has empty languageLayouts by default", () => {
    const bundle = defaultScreenshotTextBundle();
    expect(bundle.languageLayouts).toEqual({});
  });

  it("has headline + subheadline TextConfigs", () => {
    const bundle = defaultScreenshotTextBundle();
    expect(bundle.headline.enabled).toBe(true);
    expect(bundle.subheadline.enabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test lib/types/project.test.ts`  
Beklenen: FAIL — import error

- [ ] **Step 3: `LanguageLayoutSettings` ve `ScreenshotTextBundle` ekle**

`lib/types/project.ts` içinde `TextConfig` tanımının altına ekle:

```ts
export interface LanguageLayoutSettings {
  headlineSize: number;
  subheadlineSize: number;
  position: "top" | "bottom";
  verticalOffset: number;
  lineHeight: number;
}

export interface ScreenshotTextBundle {
  headline: TextConfig;
  subheadline: TextConfig;
  perLanguageLayout: boolean;
  languageLayouts: Partial<Record<Locale, LanguageLayoutSettings>>;
}

export const defaultScreenshotTextBundle = (): ScreenshotTextBundle => ({
  headline: defaultText("top", true),
  subheadline: { ...defaultText("top", false), enabled: false },
  perLanguageLayout: false,
  languageLayouts: {},
});
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test lib/types/project.test.ts`  
Beklenen: 5 passed (önceki 2 + yeni 3)

- [ ] **Step 5: Commit**

```bash
git add lib/types/project.ts lib/types/project.test.ts
git commit -m "feat(types): add ScreenshotTextBundle with perLanguageLayout"
```

---

## Task 4: `DeviceConfig` genişletmeleri

**Files:**
- Modify: `lib/types/project.ts:60-73` ve `:211-224`
- Modify: `lib/types/project.test.ts`

- [ ] **Step 1: Failing test yaz**

```ts
import { defaultDevice } from "./project";

describe("defaultDevice extensions", () => {
  it("has perspective 0 by default", () => {
    const d = defaultDevice();
    expect(d.perspective).toBe(0);
  });

  it("has no frameColorPresetId by default", () => {
    const d = defaultDevice();
    expect(d.frameColorPresetId).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test`  
Beklenen: FAIL

- [ ] **Step 3: `DeviceConfig` interface'ine 2 alan ekle**

```ts
export interface DeviceConfig {
  mode: "2d" | "3d";
  model: "iphone" | "samsung";
  rotation: { x: number; y: number; z: number };
  positionPreset: DevicePositionPreset;
  scale: number;
  verticalPos: number;
  horizontalPos: number;
  perspective: number;
  frameColor: Hex;
  frameColorPresetId?: string;
  cornerRadius: number;
  tiltRotation: number;
  shadow: ShadowConfig;
  border: BorderConfig;
}
```

- [ ] **Step 4: `defaultDevice` factory'ye `perspective: 0` ekle**

```ts
export const defaultDevice = (): DeviceConfig => ({
  mode: "2d",
  model: "iphone",
  rotation: { x: 0, y: 0, z: 0 },
  positionPreset: "centered",
  scale: 70,
  verticalPos: 55,
  horizontalPos: 50,
  perspective: 0,
  frameColor: "#000000",
  cornerRadius: 24,
  tiltRotation: 0,
  shadow: defaultShadow(),
  border: defaultBorder(),
});
```

- [ ] **Step 5: Run test → PASS**

Run: `pnpm test`  
Beklenen: 7 passed

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors

- [ ] **Step 7: Commit**

```bash
git add lib/types/project.ts lib/types/project.test.ts
git commit -m "feat(types): add perspective + frameColorPresetId to DeviceConfig"
```

---

## Task 5: `SceneElement` küçük genişletmeleri

**Files:**
- Modify: `lib/types/project.ts:120-139`

- [ ] **Step 1: Failing test yaz**

```ts
import type { SceneElement } from "./project";

describe("SceneElement extensions", () => {
  it("text element accepts frameOffsetY", () => {
    const el: SceneElement = {
      id: "e1", layer: "aboveScreenshot", positionX: 0, positionY: 0,
      size: 1, rotation: 0, opacity: 100,
      kind: "text", text: { tr: "x" }, font: "Inter", weight: "Bold",
      color: "#000", frame: "none", frameColor: "#000", frameScale: 1,
      frameOffsetY: 5,
    };
    expect(el.kind === "text" ? el.frameOffsetY : 0).toBe(5);
  });

  it("graphic element accepts optional tint", () => {
    const el: SceneElement = {
      id: "e2", layer: "aboveScreenshot", positionX: 0, positionY: 0,
      size: 1, rotation: 0, opacity: 100,
      kind: "graphic", blobId: "b", flipH: false, flipV: false,
      tint: "#ff0000",
    };
    expect(el.kind === "graphic" ? el.tint : undefined).toBe("#ff0000");
  });
});
```

- [ ] **Step 2: Run test → FAIL (typecheck error)**

Run: `pnpm typecheck`  
Beklenen: errors hakkında `frameOffsetY` ve `tint`

- [ ] **Step 3: `SceneElement` union'ını genişlet**

`lib/types/project.ts:120-139`:

```ts
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
      frameOffsetY: number;
    })
  | (ElementBase & {
      kind: "graphic";
      blobId: string;
      flipH: boolean;
      flipV: boolean;
      tint?: Hex;
    });
```

- [ ] **Step 4: Run test + typecheck → PASS**

Run: `pnpm test && pnpm typecheck`  
Beklenen: 9 passed, typecheck 0 errors

- [ ] **Step 5: Commit**

```bash
git add lib/types/project.ts lib/types/project.test.ts
git commit -m "feat(types): add frameOffsetY to text element + tint to graphic element"
```

---

## Task 6: `Screenshot.uploadMeta` ekle

**Files:**
- Modify: `lib/types/project.ts:156-167`

- [ ] **Step 1: Failing test yaz**

```ts
import type { Screenshot, UploadMeta } from "./project";

describe("Screenshot.uploadMeta", () => {
  it("accepts optional uploadMeta keyed by locale", () => {
    const meta: UploadMeta = { filename: "x_de.png", baseFilename: "x", uploadedAt: "2026-01-01" };
    const s: Partial<Screenshot> = { uploadMeta: { de: meta } };
    expect(s.uploadMeta?.de?.filename).toBe("x_de.png");
  });
});
```

- [ ] **Step 2: Run test → FAIL (typecheck)**

- [ ] **Step 3: `UploadMeta` ve alanı ekle**

`lib/types/project.ts:156` öncesine ekle:

```ts
export interface UploadMeta {
  filename: string;
  baseFilename: string;
  uploadedAt: string;
}
```

`Screenshot` interface'ine ekle:

```ts
export interface Screenshot {
  id: string;
  name: string;
  deviceSizeId: DeviceSizeId;
  customDimensions?: { width: number; height: number };
  uploads: Partial<Record<Locale, string>>;
  uploadMeta?: Partial<Record<Locale, UploadMeta>>;
  background: BackgroundConfig;
  device: DeviceConfig;
  text: ScreenshotTextBundle;
  elements: SceneElement[];
  popouts: Popout[];
}
```

> Bu değişiklik aynı zamanda `text` tipini eski `{ headline, subheadline }` literal'inden `ScreenshotTextBundle`'a çevirir.

- [ ] **Step 4: Run typecheck → ERRORS (mevcut kullanım `s.text.headline` hâlâ çalışmalı)**

Run: `pnpm typecheck`  
Beklenen: hâlâ çalışıyor olmalı çünkü `ScreenshotTextBundle.headline/subheadline` aynı.

- [ ] **Step 5: Run test → PASS**

Run: `pnpm test`  
Beklenen: 10 passed

- [ ] **Step 6: Commit**

```bash
git add lib/types/project.ts lib/types/project.test.ts
git commit -m "feat(types): add UploadMeta + ScreenshotTextBundle for Screenshot"
```

---

## Task 7: `Project` genişletmeleri (currentLocale, defaultDeviceSizeId, schemaVersion 3)

**Files:**
- Modify: `lib/types/project.ts:169-179`
- Modify: `store/projectsStore.ts:135-148` (`makeBlankProject`)
- Modify: `lib/templates/registry.ts:20-31` (`makeProject` helper)

- [ ] **Step 1: Failing test yaz**

`store/projectsStore.test.ts` (yeni dosya):

```ts
import { describe, it, expect } from "vitest";
import { makeBlankProject } from "./projectsStore";

describe("makeBlankProject", () => {
  it("sets schemaVersion to 3", () => {
    const p = makeBlankProject("Test");
    expect(p.schemaVersion).toBe(3);
  });

  it("sets currentLocale equal to defaultLocale", () => {
    const p = makeBlankProject("Test");
    expect(p.currentLocale).toBe(p.defaultLocale);
  });

  it("sets defaultDeviceSizeId to iphone-69", () => {
    const p = makeBlankProject("Test");
    expect(p.defaultDeviceSizeId).toBe("iphone-69");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test`  
Beklenen: FAIL

- [ ] **Step 3: `Project` interface'ini genişlet**

`lib/types/project.ts:169-179`:

```ts
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 3;
  defaultLocale: Locale;
  activeLocales: Locale[];
  currentLocale: Locale;
  defaultDeviceSizeId: DeviceSizeId;
  defaultCustomDimensions?: { width: number; height: number };
  screenshots: Screenshot[];
  lastStyleSource?: string;
}
```

- [ ] **Step 4: `makeBlankProject` güncelle**

`store/projectsStore.ts:135-148`:

```ts
export function makeBlankProject(name: string): Project {
  const id = uid("p_");
  const now = nowIso();
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    schemaVersion: 3,
    defaultLocale: "tr",
    activeLocales: ["tr"],
    currentLocale: "tr",
    defaultDeviceSizeId: "iphone-69",
    screenshots: [makeBlankScreenshot("Ekran 1")],
  };
}
```

- [ ] **Step 5: `lib/templates/registry.ts` `makeProject`'i güncelle**

`makeProject`'in dönen objesini şuna çevir:

```ts
function makeProject(name: string, screenshots: Screenshot[]): Project {
  return {
    id: uid("p_"),
    name,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    schemaVersion: 3,
    defaultLocale: "tr",
    activeLocales: ["tr", "en"],
    currentLocale: "tr",
    defaultDeviceSizeId: "iphone-69",
    screenshots,
  };
}
```

`screenshot()` helper içinde `text` alanını `defaultScreenshotTextBundle()`'dan oluşturacak şekilde güncelle:

```ts
import { defaultScreenshotTextBundle } from "@/lib/types/project";

function screenshot(partial: Partial<Screenshot>): Screenshot {
  const base = defaultScreenshotTextBundle();
  if (partial.text) {
    return {
      id: uid("s_"),
      name: "Ekran",
      deviceSizeId: "iphone-69",
      uploads: {},
      background: defaultBackground(),
      device: defaultDevice(),
      text: { ...base, ...partial.text },
      elements: [],
      popouts: [],
      ...partial,
      text: { ...base, ...partial.text },
    };
  }
  return {
    id: uid("s_"),
    name: "Ekran",
    deviceSizeId: "iphone-69",
    uploads: {},
    background: defaultBackground(),
    device: defaultDevice(),
    text: base,
    elements: [],
    popouts: [],
    ...partial,
  };
}
```

- [ ] **Step 6: `makeBlankScreenshot` güncelle**

`store/projectsStore.ts:150-165`:

```ts
export function makeBlankScreenshot(name: string): Screenshot {
  return {
    id: uid("s_"),
    name,
    deviceSizeId: "iphone-69",
    uploads: {},
    background: defaultBackground(),
    device: defaultDevice(),
    text: defaultScreenshotTextBundle(),
    elements: [],
    popouts: [],
  };
}
```

`defaultScreenshotTextBundle` import'u ekle (üst satırlara).

- [ ] **Step 7: `cloneTemplateProject` zaten `structuredClone` kullanıyor; alanlar otomatik geçer.**

- [ ] **Step 8: Run typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors. (Eğer `Topbar.tsx` veya başka yerde `s.text.headline` kullanılıyorsa hâlâ çalışmalı.)

- [ ] **Step 9: Run test → PASS**

Run: `pnpm test`  
Beklenen: 13 passed

- [ ] **Step 10: Commit**

```bash
git add lib/types/project.ts store/projectsStore.ts lib/templates/registry.ts store/projectsStore.test.ts
git commit -m "feat(project): add currentLocale + defaultDeviceSizeId, bump schemaVersion to 3"
```

---

## Task 8: `LEGACY_DEVICE_SIZE_ALIASES` map ve resolver

**Files:**
- Modify: `lib/devices/registry.ts`
- Test: `lib/devices/registry.test.ts` (yeni)

- [ ] **Step 1: Failing test yaz**

`lib/devices/registry.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveDeviceSizeId } from "./registry";

describe("resolveDeviceSizeId", () => {
  it("maps appscreen iphone-6.9 to iphone-69", () => {
    expect(resolveDeviceSizeId("iphone-6.9")).toBe("iphone-69");
  });
  it("maps web-og to og", () => {
    expect(resolveDeviceSizeId("web-og")).toBe("og");
  });
  it("returns id unchanged when already canonical", () => {
    expect(resolveDeviceSizeId("iphone-69")).toBe("iphone-69");
  });
  it("returns custom for unknown ids fallback", () => {
    expect(resolveDeviceSizeId("non-existent")).toBe("custom");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test lib/devices/registry.test.ts`

- [ ] **Step 3: `lib/devices/registry.ts` sonuna ekle**

```ts
const LEGACY_DEVICE_SIZE_ALIASES: Record<string, DeviceSizeId> = {
  "iphone-6.9": "iphone-69",
  "iphone-6.7": "iphone-67",
  "iphone-6.5": "iphone-65",
  "iphone-5.5": "iphone-55",
  "ipad-12.9": "ipad-129",
  "web-og": "og",
  "web-twitter": "twitter-card",
};

export function resolveDeviceSizeId(rawId: string): DeviceSizeId {
  if (LEGACY_DEVICE_SIZE_ALIASES[rawId]) {
    return LEGACY_DEVICE_SIZE_ALIASES[rawId];
  }
  if (DEVICE_SIZES.find((d) => d.id === rawId)) {
    return rawId as DeviceSizeId;
  }
  return "custom";
}
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test`  
Beklenen: 17 passed

- [ ] **Step 5: Commit**

```bash
git add lib/devices/registry.ts lib/devices/registry.test.ts
git commit -m "feat(devices): add resolveDeviceSizeId for legacy id aliasing"
```

---

## Task 9: Migration modülü — `migrate.ts` (v2 → v3)

**Files:**
- Create: `lib/persistence/migrate.ts`
- Create: `lib/persistence/migrate.test.ts`

- [ ] **Step 1: Failing test yaz**

`lib/persistence/migrate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { migrateLegacyProject } from "./migrate";

describe("migrateLegacyProject", () => {
  it("upgrades v2 project to v3 with currentLocale + defaultDeviceSizeId", () => {
    const v2 = {
      id: "p1",
      name: "Old",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      schemaVersion: 2,
      defaultLocale: "tr",
      activeLocales: ["tr", "en"],
      screenshots: [
        { id: "s1", name: "S", deviceSizeId: "iphone-69", uploads: {},
          background: {}, device: {}, text: { headline: {}, subheadline: {} },
          elements: [], popouts: [] }
      ],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.schemaVersion).toBe(3);
    expect(v3.currentLocale).toBe("tr");
    expect(v3.defaultDeviceSizeId).toBe("iphone-69");
  });

  it("maps legacy device size ids", () => {
    const v2 = {
      schemaVersion: 2, defaultLocale: "tr", activeLocales: ["tr"],
      id: "p", name: "x", createdAt: "x", updatedAt: "x",
      screenshots: [{ id: "s1", name: "S", deviceSizeId: "iphone-6.9",
        uploads: {}, background: {}, device: {}, text: { headline: {}, subheadline: {} },
        elements: [], popouts: [] }],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].deviceSizeId).toBe("iphone-69");
    expect(v3.defaultDeviceSizeId).toBe("iphone-69");
  });

  it("adds italic/underline/strikethrough false to text configs", () => {
    const v2 = {
      schemaVersion: 2, defaultLocale: "tr", activeLocales: ["tr"],
      id: "p", name: "x", createdAt: "x", updatedAt: "x",
      screenshots: [{ id: "s1", name: "S", deviceSizeId: "iphone-69",
        uploads: {}, background: {}, device: {},
        text: { headline: { enabled: true, text: { tr: "Hi" } }, subheadline: { enabled: false } },
        elements: [], popouts: [] }],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].text.headline.italic).toBe(false);
    expect(v3.screenshots[0].text.headline.underline).toBe(false);
    expect(v3.screenshots[0].text.headline.strikethrough).toBe(false);
    expect(v3.screenshots[0].text.headline.text).toEqual({ tr: "Hi" });
  });

  it("preserves perLanguageLayout from legacy headline if present", () => {
    const v2 = {
      schemaVersion: 2, defaultLocale: "tr", activeLocales: ["tr"],
      id: "p", name: "x", createdAt: "x", updatedAt: "x",
      screenshots: [{ id: "s1", name: "S", deviceSizeId: "iphone-69",
        uploads: {}, background: {}, device: {},
        text: { headline: { enabled: true, perLanguageLayout: true }, subheadline: { enabled: false } },
        elements: [], popouts: [] }],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].text.perLanguageLayout).toBe(true);
  });

  it("adds device.perspective default 0", () => {
    const v2 = {
      schemaVersion: 2, defaultLocale: "tr", activeLocales: ["tr"],
      id: "p", name: "x", createdAt: "x", updatedAt: "x",
      screenshots: [{ id: "s1", name: "S", deviceSizeId: "iphone-69",
        uploads: {}, background: {}, device: { scale: 80 },
        text: { headline: {}, subheadline: {} }, elements: [], popouts: [] }],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].device.perspective).toBe(0);
    expect(v3.screenshots[0].device.scale).toBe(80);
  });

  it("returns v3 project unchanged", () => {
    const v3in = {
      schemaVersion: 3, defaultLocale: "tr", activeLocales: ["tr"],
      currentLocale: "tr", defaultDeviceSizeId: "iphone-69",
      id: "p", name: "x", createdAt: "x", updatedAt: "x",
      screenshots: [],
    };
    const v3 = migrateLegacyProject(v3in);
    expect(v3.schemaVersion).toBe(3);
    expect(v3.screenshots).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test lib/persistence/migrate.test.ts`  
Beklenen: FAIL — module not found

- [ ] **Step 3: `lib/persistence/migrate.ts` oluştur**

```ts
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
  defaultScreenshotTextBundle,
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
  uploadMeta?: Partial<Record<Locale, { filename: string; baseFilename: string; uploadedAt: string }>>;
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
    languageLayouts: (raw?.languageLayouts ?? {}) as ScreenshotTextBundle["languageLayouts"],
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

function cryptoLikeId(): string {
  return `s_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function migrateLegacyProject(raw: unknown): Project {
  const p = (raw ?? {}) as RawProject;
  const v = p.schemaVersion ?? 1;

  if (v >= 3) {
    return {
      ...p,
      schemaVersion: 3,
      currentLocale: p.currentLocale ?? p.defaultLocale ?? "tr",
      defaultDeviceSizeId: p.defaultDeviceSizeId ?? "iphone-69",
      screenshots: (p.screenshots ?? []) as Screenshot[],
    } as Project;
  }

  const screenshots = (p.screenshots ?? []).map(migrateScreenshot);
  const defaultDeviceSizeId = (p.defaultDeviceSizeId
    ? resolveDeviceSizeId(p.defaultDeviceSizeId)
    : screenshots[0]?.deviceSizeId ?? "iphone-69") as DeviceSizeId;

  return {
    id: p.id ?? `p_${Date.now().toString(36)}`,
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
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test lib/persistence/migrate.test.ts`  
Beklenen: 6 passed

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors

- [ ] **Step 6: Commit**

```bash
git add lib/persistence/migrate.ts lib/persistence/migrate.test.ts
git commit -m "feat(persistence): add migrateLegacyProject for v2→v3 schema migration"
```

---

## Task 10: `loadProjects()` migration entegrasyonu

**Files:**
- Modify: `lib/persistence/localProjects.ts`

- [ ] **Step 1: Failing test yaz**

`lib/persistence/localProjects.test.ts`:

```ts
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { compressToUTF16 } from "lz-string";
import { loadProjects } from "./localProjects";

const KEY = "framelaunch:projects:v2";

describe("loadProjects migration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("migrates a stored v2 project to v3", () => {
    const v2 = [{
      id: "p1", name: "Old", createdAt: "2026-01-01", updatedAt: "2026-01-01",
      schemaVersion: 2, defaultLocale: "tr", activeLocales: ["tr"],
      screenshots: [{ id: "s1", name: "S", deviceSizeId: "iphone-6.9",
        uploads: {}, background: {}, device: {},
        text: { headline: {}, subheadline: {} }, elements: [], popouts: [] }],
    }];
    window.localStorage.setItem(KEY, compressToUTF16(JSON.stringify(v2)));

    const loaded = loadProjects();

    expect(loaded[0].schemaVersion).toBe(3);
    expect(loaded[0].screenshots[0].deviceSizeId).toBe("iphone-69");
    expect(loaded[0].currentLocale).toBe("tr");
  });

  it("returns empty array if storage is empty", () => {
    expect(loadProjects()).toEqual([]);
  });

  it("skips a corrupted project (returns the rest)", () => {
    const mixed = [
      { schemaVersion: 2, screenshots: [] }, // ok
      "not a project", // corrupt
    ];
    window.localStorage.setItem(KEY, compressToUTF16(JSON.stringify(mixed)));
    const loaded = loadProjects();
    expect(loaded.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test → FAIL**

Run: `pnpm test lib/persistence/localProjects.test.ts`

- [ ] **Step 3: `loadProjects` güncelle**

`lib/persistence/localProjects.ts`:

```ts
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import type { Project } from "@/lib/types/project";
import { migrateLegacyProject } from "./migrate";

const KEY_PROJECTS = "framelaunch:projects:v2";
const KEY_ACTIVE = "framelaunch:activeProjectId";

const isClient = () => typeof window !== "undefined";

export function loadProjects(): Project[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(KEY_PROJECTS);
    if (!raw) return [];
    const decompressed = decompressFromUTF16(raw);
    if (!decompressed) return [];
    const parsed = JSON.parse(decompressed) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const out: Project[] = [];
    for (const item of parsed) {
      try {
        out.push(migrateLegacyProject(item));
      } catch (err) {
        console.warn("loadProjects: skipping corrupted project", err);
      }
    }
    return out;
  } catch (err) {
    console.warn("loadProjects failed", err);
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (!isClient()) return;
  try {
    const compressed = compressToUTF16(JSON.stringify(projects));
    window.localStorage.setItem(KEY_PROJECTS, compressed);
  } catch (err) {
    console.warn("saveProjects failed", err);
  }
}

export function loadActiveProjectId(): string | null {
  if (!isClient()) return null;
  return window.localStorage.getItem(KEY_ACTIVE);
}

export function saveActiveProjectId(id: string | null): void {
  if (!isClient()) return;
  if (id) window.localStorage.setItem(KEY_ACTIVE, id);
  else window.localStorage.removeItem(KEY_ACTIVE);
}
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test`  
Beklenen: 26 passed

- [ ] **Step 5: Commit**

```bash
git add lib/persistence/localProjects.ts lib/persistence/localProjects.test.ts
git commit -m "feat(persistence): wire loadProjects through migrateLegacyProject"
```

---

## Task 11: AI providers config — `lib/ai/providers.ts`

**Files:**
- Create: `lib/ai/providers.ts`
- Create: `lib/ai/providers.test.ts`

- [ ] **Step 1: Failing test yaz**

`lib/ai/providers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  AI_PROVIDERS,
  AI_PROVIDER_IDS,
  validateApiKeyFormat,
  getDefaultModel,
} from "./providers";

describe("AI_PROVIDERS", () => {
  it("contains anthropic, openai, google", () => {
    expect(AI_PROVIDER_IDS).toEqual(["anthropic", "openai", "google"]);
  });

  it("each provider has at least one model", () => {
    for (const id of AI_PROVIDER_IDS) {
      expect(AI_PROVIDERS[id].models.length).toBeGreaterThan(0);
    }
  });
});

describe("validateApiKeyFormat", () => {
  it("anthropic keys start with sk-ant-", () => {
    expect(validateApiKeyFormat("anthropic", "sk-ant-abc")).toBe(true);
    expect(validateApiKeyFormat("anthropic", "sk-foo")).toBe(false);
  });
  it("openai keys start with sk-", () => {
    expect(validateApiKeyFormat("openai", "sk-foo")).toBe(true);
  });
  it("google keys start with AIza", () => {
    expect(validateApiKeyFormat("google", "AIzaXyz")).toBe(true);
  });
});

describe("getDefaultModel", () => {
  it("returns the configured default", () => {
    expect(getDefaultModel("anthropic")).toBe("claude-sonnet-4-5-20250929");
    expect(getDefaultModel("openai")).toBe("gpt-5-mini-2025-08-07");
    expect(getDefaultModel("google")).toBe("gemini-2.5-flash");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

- [ ] **Step 3: `lib/ai/providers.ts` oluştur**

```ts
export type AiProvider = "anthropic" | "openai" | "google";

export interface AiModel {
  id: string;
  name: string;
}

export interface AiProviderConfig {
  name: string;
  keyPrefix: string;
  storageKey: string;
  modelStorageKey: string;
  models: AiModel[];
  defaultModel: string;
}

export const AI_PROVIDERS: Record<AiProvider, AiProviderConfig> = {
  anthropic: {
    name: "Anthropic (Claude)",
    keyPrefix: "sk-ant-",
    storageKey: "claudeApiKey",
    modelStorageKey: "anthropicModel",
    models: [
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 ($)" },
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5 ($$)" },
      { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5 ($$$)" },
    ],
    defaultModel: "claude-sonnet-4-5-20250929",
  },
  openai: {
    name: "OpenAI (GPT)",
    keyPrefix: "sk-",
    storageKey: "openaiApiKey",
    modelStorageKey: "openaiModel",
    models: [
      { id: "gpt-5.1-2025-11-13", name: "GPT-5.1 ($$$)" },
      { id: "gpt-5-mini-2025-08-07", name: "GPT-5 Mini ($$)" },
      { id: "gpt-5-nano-2025-08-07", name: "GPT-5 Nano ($)" },
    ],
    defaultModel: "gpt-5-mini-2025-08-07",
  },
  google: {
    name: "Google (Gemini)",
    keyPrefix: "AIza",
    storageKey: "googleApiKey",
    modelStorageKey: "googleModel",
    models: [
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview) ($$)" },
      { id: "gemini-3-pro-preview", name: "Gemini 3 Pro (Preview) ($$$)" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite ($)" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash ($$)" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro ($$$)" },
    ],
    defaultModel: "gemini-2.5-flash",
  },
};

export const AI_PROVIDER_IDS: AiProvider[] = ["anthropic", "openai", "google"];

export function validateApiKeyFormat(provider: AiProvider, key: string): boolean {
  return key.startsWith(AI_PROVIDERS[provider].keyPrefix);
}

export function getDefaultModel(provider: AiProvider): string {
  return AI_PROVIDERS[provider].defaultModel;
}
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test lib/ai/providers.test.ts`  
Beklenen: 6 passed

- [ ] **Step 5: Commit**

```bash
git add lib/ai/providers.ts lib/ai/providers.test.ts
git commit -m "feat(ai): add AI providers config (Anthropic/OpenAI/Google) with validation"
```

---

## Task 12: `settingsStore.ts` — theme + AI provider + key + model + tooltip

**Files:**
- Create: `store/settingsStore.ts`
- Create: `store/settingsStore.test.ts`

- [ ] **Step 1: Failing test yaz**

`store/settingsStore.test.ts`:

```ts
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({
      hydrated: false,
      theme: "auto",
      aiProvider: "anthropic",
      apiKeys: { anthropic: "", openai: "", google: "" },
      selectedModels: {
        anthropic: "claude-sonnet-4-5-20250929",
        openai: "gpt-5-mini-2025-08-07",
        google: "gemini-2.5-flash",
      },
      hasSeenMagicalTitlesTooltip: false,
    });
  });

  it("hydrate reads theme from localStorage", () => {
    window.localStorage.setItem("themePreference", "dark");
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("hydrate reads api keys with appscreen-compatible storage keys", () => {
    window.localStorage.setItem("claudeApiKey", "sk-ant-test");
    window.localStorage.setItem("openaiApiKey", "sk-openai");
    window.localStorage.setItem("googleApiKey", "AIzaG");
    useSettingsStore.getState().hydrate();
    const s = useSettingsStore.getState();
    expect(s.apiKeys.anthropic).toBe("sk-ant-test");
    expect(s.apiKeys.openai).toBe("sk-openai");
    expect(s.apiKeys.google).toBe("AIzaG");
  });

  it("setTheme persists to localStorage", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().setTheme("light");
    expect(window.localStorage.getItem("themePreference")).toBe("light");
    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("setApiKey persists with appscreen-compatible key", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().setApiKey("anthropic", "sk-ant-x");
    expect(window.localStorage.getItem("claudeApiKey")).toBe("sk-ant-x");
  });

  it("setSelectedModel persists", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().setSelectedModel("openai", "gpt-5-nano-2025-08-07");
    expect(window.localStorage.getItem("openaiModel")).toBe("gpt-5-nano-2025-08-07");
  });

  it("markMagicalTitlesTooltipSeen persists", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().markMagicalTitlesTooltipSeen();
    expect(window.localStorage.getItem("magicalTitlesTooltipDismissed")).toBe("1");
    expect(useSettingsStore.getState().hasSeenMagicalTitlesTooltip).toBe(true);
  });

  it("hydrate is idempotent", () => {
    window.localStorage.setItem("themePreference", "dark");
    useSettingsStore.getState().hydrate();
    window.localStorage.setItem("themePreference", "light");
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().theme).toBe("dark");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

- [ ] **Step 3: `store/settingsStore.ts` oluştur**

```ts
"use client";

import { create } from "zustand";
import {
  AI_PROVIDERS,
  type AiProvider,
  validateApiKeyFormat as validateKeyFormat,
} from "@/lib/ai/providers";

export type Theme = "auto" | "light" | "dark";

interface SettingsState {
  hydrated: boolean;
  theme: Theme;
  aiProvider: AiProvider;
  apiKeys: Record<AiProvider, string>;
  selectedModels: Record<AiProvider, string>;
  hasSeenMagicalTitlesTooltip: boolean;

  hydrate(): void;
  setTheme(t: Theme): void;
  setAiProvider(p: AiProvider): void;
  setApiKey(provider: AiProvider, key: string): void;
  setSelectedModel(provider: AiProvider, modelId: string): void;
  markMagicalTitlesTooltipSeen(): void;
  validateKey(provider: AiProvider, key: string): boolean;
}

const isClient = () => typeof window !== "undefined";

function readLs(key: string, fallback = ""): string {
  if (!isClient()) return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function writeLs(key: string, value: string): void {
  if (!isClient()) return;
  window.localStorage.setItem(key, value);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  theme: "auto",
  aiProvider: "anthropic",
  apiKeys: { anthropic: "", openai: "", google: "" },
  selectedModels: {
    anthropic: AI_PROVIDERS.anthropic.defaultModel,
    openai: AI_PROVIDERS.openai.defaultModel,
    google: AI_PROVIDERS.google.defaultModel,
  },
  hasSeenMagicalTitlesTooltip: false,

  hydrate: () => {
    if (get().hydrated) return;
    const theme = (readLs("themePreference", "auto") as Theme) ?? "auto";
    const aiProvider = (readLs("aiProvider", "anthropic") as AiProvider) ?? "anthropic";
    const apiKeys = {
      anthropic: readLs(AI_PROVIDERS.anthropic.storageKey),
      openai: readLs(AI_PROVIDERS.openai.storageKey),
      google: readLs(AI_PROVIDERS.google.storageKey),
    };
    const selectedModels = {
      anthropic: readLs(AI_PROVIDERS.anthropic.modelStorageKey, AI_PROVIDERS.anthropic.defaultModel),
      openai: readLs(AI_PROVIDERS.openai.modelStorageKey, AI_PROVIDERS.openai.defaultModel),
      google: readLs(AI_PROVIDERS.google.modelStorageKey, AI_PROVIDERS.google.defaultModel),
    };
    const hasSeenMagicalTitlesTooltip = readLs("magicalTitlesTooltipDismissed") === "1";
    set({
      hydrated: true,
      theme,
      aiProvider,
      apiKeys,
      selectedModels,
      hasSeenMagicalTitlesTooltip,
    });
  },

  setTheme: (t) => {
    writeLs("themePreference", t);
    set({ theme: t });
  },

  setAiProvider: (p) => {
    writeLs("aiProvider", p);
    set({ aiProvider: p });
  },

  setApiKey: (provider, key) => {
    writeLs(AI_PROVIDERS[provider].storageKey, key);
    set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } }));
  },

  setSelectedModel: (provider, modelId) => {
    writeLs(AI_PROVIDERS[provider].modelStorageKey, modelId);
    set((s) => ({ selectedModels: { ...s.selectedModels, [provider]: modelId } }));
  },

  markMagicalTitlesTooltipSeen: () => {
    writeLs("magicalTitlesTooltipDismissed", "1");
    set({ hasSeenMagicalTitlesTooltip: true });
  },

  validateKey: (provider, key) => validateKeyFormat(provider, key),
}));
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test store/settingsStore.test.ts`  
Beklenen: 7 passed

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors

- [ ] **Step 6: Commit**

```bash
git add store/settingsStore.ts store/settingsStore.test.ts
git commit -m "feat(settings): add settingsStore with theme + AI provider + apiKeys + models"
```

---

## Task 13: `editorStore` genişletmeleri

**Files:**
- Modify: `store/editorStore.ts`
- Modify: `store/editorStore.test.ts` (yeni)

- [ ] **Step 1: Failing test yaz**

`store/editorStore.test.ts`:

```ts
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "./editorStore";

describe("editorStore extensions", () => {
  beforeEach(() => {
    useEditorStore.setState({
      activeScreenshotId: null,
      activeLocale: "tr",
      rightPanelTab: "background",
      zoom: 0.35,
      showSafeArea: false,
      exportModalOpen: false,
      transferTarget: null,
      selectedElementId: null,
      selectedPopoutId: null,
      isSliding: false,
      slidingDirection: null,
      settingsModalOpen: false,
      aboutModalOpen: false,
      magicalTitlesModalOpen: false,
      languagesModalOpen: false,
      applyStyleModalOpen: false,
      translateModalState: null,
      duplicateUploadDialog: null,
      exportLanguageDialogOpen: false,
    });
  });

  it("setTransferTarget updates value", () => {
    useEditorStore.getState().setTransferTarget("s_1");
    expect(useEditorStore.getState().transferTarget).toBe("s_1");
  });

  it("openTranslateModal sets translateModalState with field", () => {
    useEditorStore.getState().openTranslateModal({ field: "headline" });
    expect(useEditorStore.getState().translateModalState).toEqual({
      open: true,
      field: "headline",
    });
  });

  it("closeTranslateModal sets translateModalState null", () => {
    useEditorStore.getState().openTranslateModal({ field: "subheadline" });
    useEditorStore.getState().closeTranslateModal();
    expect(useEditorStore.getState().translateModalState).toBeNull();
  });

  it("RightPanelTab now accepts popouts", () => {
    useEditorStore.getState().setRightPanelTab("popouts");
    expect(useEditorStore.getState().rightPanelTab).toBe("popouts");
  });

  it("setSliding updates flag and direction", () => {
    useEditorStore.getState().setSliding(true, "left");
    expect(useEditorStore.getState().isSliding).toBe(true);
    expect(useEditorStore.getState().slidingDirection).toBe("left");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

- [ ] **Step 3: `store/editorStore.ts` güncelle**

```ts
"use client";

import { create } from "zustand";
import type { Locale } from "@/lib/types/project";

export type RightPanelTab =
  | "background"
  | "device"
  | "text"
  | "elements"
  | "popouts";

export type TranslateField = "headline" | "subheadline" | "element";

export interface TranslateModalState {
  open: boolean;
  field: TranslateField;
  elementId?: string;
}

export type DuplicateUploadAction = "replace" | "create" | "ignore";

export interface DuplicateUploadDialogState {
  open: boolean;
  baseFilename: string;
  matchedScreenshotId: string;
  locale: Locale;
  resolve: (action: DuplicateUploadAction) => void;
}

interface EditorState {
  activeScreenshotId: string | null;
  activeLocale: Locale;
  rightPanelTab: RightPanelTab;
  zoom: number;
  showSafeArea: boolean;
  exportModalOpen: boolean;

  transferTarget: string | null;
  selectedElementId: string | null;
  selectedPopoutId: string | null;

  isSliding: boolean;
  slidingDirection: "left" | "right" | null;

  settingsModalOpen: boolean;
  aboutModalOpen: boolean;
  magicalTitlesModalOpen: boolean;
  languagesModalOpen: boolean;
  applyStyleModalOpen: boolean;
  exportLanguageDialogOpen: boolean;

  translateModalState: TranslateModalState | null;
  duplicateUploadDialog: DuplicateUploadDialogState | null;

  setActiveScreenshot: (id: string | null) => void;
  setActiveLocale: (locale: Locale) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setZoom: (zoom: number) => void;
  toggleSafeArea: () => void;
  setExportModalOpen: (open: boolean) => void;

  setTransferTarget: (id: string | null) => void;
  setSelectedElementId: (id: string | null) => void;
  setSelectedPopoutId: (id: string | null) => void;
  setSliding: (isSliding: boolean, direction?: "left" | "right" | null) => void;

  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openAboutModal: () => void;
  closeAboutModal: () => void;
  openMagicalTitlesModal: () => void;
  closeMagicalTitlesModal: () => void;
  openLanguagesModal: () => void;
  closeLanguagesModal: () => void;
  openApplyStyleModal: () => void;
  closeApplyStyleModal: () => void;
  setExportLanguageDialogOpen: (open: boolean) => void;

  openTranslateModal: (opts: { field: TranslateField; elementId?: string }) => void;
  closeTranslateModal: () => void;

  setDuplicateUploadDialog: (state: DuplicateUploadDialogState | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeScreenshotId: null,
  activeLocale: "tr",
  rightPanelTab: "background",
  zoom: 0.35,
  showSafeArea: false,
  exportModalOpen: false,

  transferTarget: null,
  selectedElementId: null,
  selectedPopoutId: null,

  isSliding: false,
  slidingDirection: null,

  settingsModalOpen: false,
  aboutModalOpen: false,
  magicalTitlesModalOpen: false,
  languagesModalOpen: false,
  applyStyleModalOpen: false,
  exportLanguageDialogOpen: false,

  translateModalState: null,
  duplicateUploadDialog: null,

  setActiveScreenshot: (id) => set({ activeScreenshotId: id }),
  setActiveLocale: (locale) => set({ activeLocale: locale }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(1.5, zoom)) }),
  toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),
  setExportModalOpen: (open) => set({ exportModalOpen: open }),

  setTransferTarget: (id) => set({ transferTarget: id }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setSelectedPopoutId: (id) => set({ selectedPopoutId: id }),
  setSliding: (isSliding, direction = null) =>
    set({ isSliding, slidingDirection: direction }),

  openSettingsModal: () => set({ settingsModalOpen: true }),
  closeSettingsModal: () => set({ settingsModalOpen: false }),
  openAboutModal: () => set({ aboutModalOpen: true }),
  closeAboutModal: () => set({ aboutModalOpen: false }),
  openMagicalTitlesModal: () => set({ magicalTitlesModalOpen: true }),
  closeMagicalTitlesModal: () => set({ magicalTitlesModalOpen: false }),
  openLanguagesModal: () => set({ languagesModalOpen: true }),
  closeLanguagesModal: () => set({ languagesModalOpen: false }),
  openApplyStyleModal: () => set({ applyStyleModalOpen: true }),
  closeApplyStyleModal: () => set({ applyStyleModalOpen: false }),
  setExportLanguageDialogOpen: (open) => set({ exportLanguageDialogOpen: open }),

  openTranslateModal: ({ field, elementId }) =>
    set({ translateModalState: { open: true, field, elementId } }),
  closeTranslateModal: () => set({ translateModalState: null }),

  setDuplicateUploadDialog: (state) => set({ duplicateUploadDialog: state }),
}));
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test store/editorStore.test.ts`  
Beklenen: 5 passed

- [ ] **Step 5: Mevcut UI bileşenleri çalışıyor mu kontrol et**

Run: `pnpm typecheck`  
Beklenen: 0 errors. (Önceki `RightPanelTab` üyesi `"export"` kaldırıldı; `RightPanel.tsx` veya başka bir yer onu kullanıyorsa fix gerekir.)

Eğer typecheck hatası gelirse (örneğin `RightPanel.tsx` `setRightPanelTab("export")` çağırıyorsa), o satırı sil veya başka bir UI mantığına bağla.

`grep` ile kontrol:

```bash
rg "rightPanelTab|setRightPanelTab" components/ --type ts --type tsx
```

Bulunan referansların hepsi yeni union ile uyumlu olmalı.

- [ ] **Step 6: Commit**

```bash
git add store/editorStore.ts store/editorStore.test.ts
git commit -m "feat(editor): expand editorStore with transfer/element/popout/modal state"
```

---

## Task 14: `projectsStore` yeni aksiyonlar

**Files:**
- Modify: `store/projectsStore.ts`
- Modify: `store/projectsStore.test.ts`

- [ ] **Step 1: Failing test yaz**

`store/projectsStore.test.ts`'e ekle:

```ts
import { useProjectsStore } from "./projectsStore";

function resetStore() {
  useProjectsStore.setState({
    projects: [],
    activeProjectId: null,
    hydrated: false,
  });
  window.localStorage.clear();
}

describe("projectsStore actions", () => {
  beforeEach(() => {
    resetStore();
    useProjectsStore.getState().hydrate();
  });

  it("duplicateProject creates a new project with same screenshots and new ids", () => {
    const original = useProjectsStore.getState().createProject("Orig");
    const dup = useProjectsStore.getState().duplicateProject(original.id);
    expect(dup).not.toBeNull();
    expect(dup!.id).not.toBe(original.id);
    expect(dup!.screenshots.length).toBe(original.screenshots.length);
    expect(dup!.screenshots[0].id).not.toBe(original.screenshots[0].id);
  });

  it("reorderScreenshots swaps positions", () => {
    const p = useProjectsStore.getState().createProject("Reorder");
    useProjectsStore.getState().updateProject(p.id, (proj) => {
      proj.screenshots.push({ ...proj.screenshots[0], id: "s2", name: "Ekran 2" });
      proj.screenshots.push({ ...proj.screenshots[0], id: "s3", name: "Ekran 3" });
    });
    const before = useProjectsStore.getState().projects.find((x) => x.id === p.id)!.screenshots.map((s) => s.id);
    useProjectsStore.getState().reorderScreenshots(p.id, 0, 2);
    const after = useProjectsStore.getState().projects.find((x) => x.id === p.id)!.screenshots.map((s) => s.id);
    expect(after).toEqual([before[1], before[2], before[0]]);
  });

  it("addLocale adds locale to activeLocales", () => {
    const p = useProjectsStore.getState().createProject("Locales");
    useProjectsStore.getState().addLocale(p.id, "en");
    const proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales).toContain("en");
  });

  it("addLocale is idempotent", () => {
    const p = useProjectsStore.getState().createProject("Locales");
    useProjectsStore.getState().addLocale(p.id, "en");
    useProjectsStore.getState().addLocale(p.id, "en");
    const proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales.filter((l) => l === "en").length).toBe(1);
  });

  it("removeLocale removes but never lets activeLocales become empty", () => {
    const p = useProjectsStore.getState().createProject("Locales");
    useProjectsStore.getState().addLocale(p.id, "en");
    useProjectsStore.getState().removeLocale(p.id, "tr");
    let proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales).toEqual(["en"]);

    useProjectsStore.getState().removeLocale(p.id, "en");
    proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales.length).toBe(1);
  });

  it("setCurrentLocale persists in project.currentLocale", () => {
    const p = useProjectsStore.getState().createProject("CurrentLocale");
    useProjectsStore.getState().addLocale(p.id, "en");
    useProjectsStore.getState().setCurrentLocale(p.id, "en");
    const proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.currentLocale).toBe("en");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

- [ ] **Step 3: `store/projectsStore.ts` güncelle**

`ProjectsState` interface'ine ekle:

```ts
duplicateProject: (id: string, name?: string) => Project | null;
reorderScreenshots: (projectId: string, fromIdx: number, toIdx: number) => void;
addLocale: (projectId: string, locale: Locale) => void;
removeLocale: (projectId: string, locale: Locale) => void;
setCurrentLocale: (projectId: string, locale: Locale) => void;
```

`Locale` import'unu ekle: `import type { Project, Screenshot, Locale } from "@/lib/types/project";`

Implementation:

```ts
duplicateProject: (id, name) => {
  const src = get().projects.find((p) => p.id === id);
  if (!src) return null;
  const cloned = structuredClone(src);
  cloned.id = uid("p_");
  cloned.name = name ?? `${src.name} (kopya)`;
  cloned.createdAt = nowIso();
  cloned.updatedAt = nowIso();
  for (const s of cloned.screenshots) {
    s.id = uid("s_");
  }
  const projects = [...get().projects, cloned];
  persist(projects);
  saveActiveProjectId(cloned.id);
  set({ projects, activeProjectId: cloned.id });
  return cloned;
},

reorderScreenshots: (projectId, fromIdx, toIdx) => {
  get().updateProject(projectId, (p) => {
    if (
      fromIdx < 0 || fromIdx >= p.screenshots.length ||
      toIdx < 0 || toIdx >= p.screenshots.length || fromIdx === toIdx
    ) return;
    const [moved] = p.screenshots.splice(fromIdx, 1);
    p.screenshots.splice(toIdx, 0, moved);
  });
},

addLocale: (projectId, locale) => {
  get().updateProject(projectId, (p) => {
    if (!p.activeLocales.includes(locale)) {
      p.activeLocales = [...p.activeLocales, locale];
    }
  });
},

removeLocale: (projectId, locale) => {
  get().updateProject(projectId, (p) => {
    if (p.activeLocales.length <= 1) return;
    p.activeLocales = p.activeLocales.filter((l) => l !== locale);
    if (p.currentLocale === locale) {
      p.currentLocale = p.activeLocales[0];
    }
  });
},

setCurrentLocale: (projectId, locale) => {
  get().updateProject(projectId, (p) => {
    if (p.activeLocales.includes(locale)) {
      p.currentLocale = locale;
    }
  });
},
```

- [ ] **Step 4: Run test → PASS**

Run: `pnpm test store/projectsStore.test.ts`  
Beklenen: 9 passed (3 önceki + 6 yeni)

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors

- [ ] **Step 6: Commit**

```bash
git add store/projectsStore.ts store/projectsStore.test.ts
git commit -m "feat(projects): add duplicate/reorder/addLocale/removeLocale/setCurrentLocale"
```

---

## Task 15: `EditorShell` settingsStore hydrate çağrısı

**Files:**
- Modify: `components/editor/EditorShell.tsx`

- [ ] **Step 1: `EditorShell.tsx`'i oku**

```bash
cat /Users/tacettinsertkaya/Desktop/frame-launch-fe/components/editor/EditorShell.tsx
```

`useProjectsStore.getState().hydrate()` çağrısı zaten `useEffect` içinde olmalı. Aynı yere `useSettingsStore` hydrate eklenir.

- [ ] **Step 2: `useSettingsStore` hydrate ekle**

```tsx
import { useSettingsStore } from "@/store/settingsStore";

// Component içinde
useEffect(() => {
  useProjectsStore.getState().hydrate();
  useSettingsStore.getState().hydrate();
}, []);
```

- [ ] **Step 3: Typecheck + dev server**

Run: `pnpm typecheck`  
Beklenen: 0 errors

Run: `pnpm dev` (background)  
Tarayıcıda `http://localhost:3000/editor` aç → console'da hata yok, mevcut tek proje yüklenir.

- [ ] **Step 4: Commit**

```bash
git add components/editor/EditorShell.tsx
git commit -m "feat(editor): hydrate settingsStore on EditorShell mount"
```

---

## Task 16: Final entegrasyon kontrolü

**Files:**
- (yalnızca verification)

- [ ] **Step 1: Tüm test paketini çalıştır**

Run: `pnpm test`  
Beklenen: tüm test'ler PASS, hiç FAIL yok

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`  
Beklenen: 0 errors

- [ ] **Step 3: Lint**

Run: `pnpm lint`  
Beklenen: 0 errors (yeni warning kabul edilebilir)

- [ ] **Step 4: Build**

Run: `pnpm build`  
Beklenen: başarılı build, hiç error yok

- [ ] **Step 5: Manuel kontrol**

`pnpm dev` çalıştır:
- `/editor`'a git
- Console'da hata yok
- "İlk Proje" yüklenir
- Background panelinde değişiklik yap → kaydedilir → tarayıcıyı yenile → değişiklik korunur
- LocalStorage'da `framelaunch:projects:v2` mevcut, içeriği yeni schemaVersion 3 ile (decompress et)

- [ ] **Step 6: Eski format migration testi (manuel)**

DevTools console:

```js
const oldData = JSON.stringify([{
  id: "p_old", name: "Eski", createdAt: "2026-01-01", updatedAt: "2026-01-01",
  schemaVersion: 2, defaultLocale: "tr", activeLocales: ["tr"],
  screenshots: [{ id: "s_old", name: "Old S", deviceSizeId: "iphone-6.9",
    uploads: {}, background: {}, device: {}, text: { headline: {}, subheadline: {} },
    elements: [], popouts: [] }]
}]);
const lz = await import("https://cdn.skypack.dev/lz-string");
localStorage.setItem("framelaunch:projects:v2", lz.compressToUTF16(oldData));
location.reload();
```

Beklenen: editör açılır, eski proje sorunsuz görünür, `iphone-6.9` → `iphone-69` dönüşmüş.

- [ ] **Step 7: Final commit (varsa)**

Eğer hiçbir ek değişiklik yoksa, atla.

```bash
git status
```

Eğer staged değişiklik yoksa: hazırız.

---

## Self-Review

**Spec coverage check** (`2026-04-23-00-foundation-schema-design.md`):

| Spec bölümü | Karşılayan task |
|---|---|
| §2.1 Project (currentLocale, defaultDeviceSizeId) | Task 7 |
| §2.2 DeviceConfig (perspective, frameColorPresetId) | Task 4 |
| §2.3 TextConfig (italic/underline/strikethrough) | Task 2 |
| §2.3 ScreenshotTextBundle (perLanguageLayout, languageLayouts) | Task 3 |
| §2.4 UploadMeta | Task 6 |
| §2.5 SceneElement (frameOffsetY, tint) | Task 5 |
| §2.6 Popout (sourceUploadLocale) | **DEFERRED** — alt-proje 12'ye bırakıldı çünkü Popout panel henüz yok |
| §2.7 editorStore genişletme | Task 13 |
| §2.8 settingsStore | Task 11 + 12 |
| §2.9 projectsStore yeni aksiyonlar | Task 14 |
| §2.10 Persistence migration | Task 9 + 10 |
| §3 Yeni tipler | Task 2 + 3 + 4 + 6 + 7 |
| §4 Migration stratejisi | Task 9 |
| §5 Devices registry alias | Task 8 |
| §6 Templates registry | Task 7 (no-op + helper güncelleme) |
| §7 Settings store şema | Task 11 + 12 |
| §10 Test planı | Task 1 (vitest) + her task'ın test'leri + Task 16 |

`Popout.sourceUploadLocale` alanını Task 6'ya eklemek de mümkün, ama §2.6'da "küçük genişletme" olarak işaretlendi ve hâlâ kullanan kod yok. Şimdilik **deferred** (alt-proje 12'de eklenecek). Spec'in §2.6 satırına da not düşülmesi gerekebilir; bu plan dosyasında not edildi.

**Placeholder scan:** Tüm step'lerde gerçek kod ve gerçek shell komutu var. "TBD"/"TODO"/"benzer şekilde" yok.

**Type consistency:** `ScreenshotTextBundle`, `TextConfig`, `DeviceConfig`, `Project`, `Screenshot`, `UploadMeta`, `LanguageLayoutSettings` adları her task'ta tutarlı. `AiProvider` sadece Task 11+12'de kullanıldı, isim aynı. `RightPanelTab` Task 13'te `"popouts"` eklenip `"export"` çıkarıldı — bu spec'teki §2.7 ile uyumlu.

---

## Plan complete and saved to `docs/superpowers/plans/2026-04-23-00-foundation-schema-plan.md`.

İki yürütme seçeneği:

**1. Subagent-Driven (recommended)** — her task için fresh subagent dispatch, taskler arası review, hızlı iterasyon
**2. Inline Execution** — bu session içinde sırayla yürütme, checkpoint'lerle batch

Hangisini tercih edersiniz?
