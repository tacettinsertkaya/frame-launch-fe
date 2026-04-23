# 00 — Foundation & Schema Genişletmeleri

**Tarih:** 2026-04-23  
**Üst spec:** `2026-04-23-appscreen-parity-overview.md`  
**Bağımlılık:** Yok (tüm sonraki alt-projelerin önkoşulu)  
**Karmaşıklık:** M  
**Risk:** Düşük (UI yok, sadece tip + state altyapısı)

---

## 1. Amaç

Tüm sonraki port işleri için **veri modeli** ve **state altyapısını** appscreen ile uyumlu hale getirmek. Bu spec'te **hiç UI yapılmaz**, sadece:

- `lib/types/project.ts` genişletilir
- `store/editorStore.ts` genişletilir
- `store/projectsStore.ts` genişletilir
- Yeni: `store/settingsStore.ts` (provider/key/tema persistance)
- `lib/persistence/localProjects.ts`'e migration mantığı
- `lib/templates/registry.ts` ve `lib/devices/registry.ts` küçük uyarlamalar
- Mevcut UI ve render katmanları **değiştirilmez** (yeni alanların hepsi opsiyonel/varsayılan-değerli geriye dönük uyumlu)

**Kapsamda olmayan:**

- Yeni panel, modal, buton vb. UI elemanları (sonraki alt-projelerde)
- Render pipeline değişiklikleri (sonraki alt-projelerde)
- AI çağrıları, 3D entegrasyonu (sonraki alt-projelerde)

---

## 2. appscreen ile Mevcut Şema Farkları

### 2.1 `Project` (proje seviyesi)

| Alan | appscreen | frame-launch-fe (mevcut) | Aksiyon |
|---|---|---|---|
| `screenshots[]` | var | var | — |
| `selectedIndex` | runtime state (state.selectedIndex) | editorStore `activeScreenshotId` | — (zaten farklı pattern) |
| `outputDevice` | proje seviyesi (`state.outputDevice`) | screenshot seviyesi (`Screenshot.deviceSizeId`) | **Karar (farklı pattern):** her screenshot kendi boyutunu tutar (mevcut pattern korunur). appscreen'de tüm screenshot'lar aynı boyut paylaşır → port ederken her screenshot'a yayılır. **Project'e `defaultDeviceSizeId: DeviceSizeId` eklenir** (yeni screenshot oluştururken kullanılır). |
| `customWidth` / `customHeight` | proje seviyesi (tek değer) | `Screenshot.customDimensions` | mevcut pattern korunur (per-screenshot) + `Project.defaultCustomDimensions?` eklenir |
| `currentLanguage` | runtime + persisted | editorStore `activeLocale` (sadece runtime) | **`Project.currentLocale: Locale`** alanı eklenir (proje yüklenince hangi dil aktifti) |
| `projectLanguages` | array | `activeLocales` | adı zaten doğru, sadece tip aynı |
| `defaults` | per-property defaults | yok | **EKLENMEZ** — `makeBlankScreenshot()` zaten varsayılanları üretir; appscreen'in `defaults` mantığı UI'a "bir önceki screenshot ayarlarını miras al" özelliği vermek içindi → bunu store'da `defaultsFromLastScreenshot` flag'i ile geçici çözeriz, runtime kararı |
| `lastStyleSource` | runtime state | var (kullanılmıyor) | korunur, alt-proje 05'te kullanılır |
| `aiSettings` | yok (localStorage globalde) | yok | **EKLENMEZ** proje seviyesinde — settingsStore'a |
| `theme` | localStorage globalde | yok | **EKLENMEZ** proje seviyesinde — settingsStore'a |

### 2.2 `Screenshot.device` (cihaz/mockup ayarları)

appscreen `screenshot.screenshot` alanı çok daha geniş:

| appscreen alan | mevcut karşılık | Aksiyon |
|---|---|---|
| `scale` | `device.scale` | aynı (0–100) |
| `x`, `y` | `device.horizontalPos`, `device.verticalPos` | aynı |
| `rotation` | `device.tiltRotation` | aynı (2D z-rotation) |
| `perspective` | yok | **`device.perspective: number` ekle** (0–100, 2D'de shear/perspektif) |
| `cornerRadius` | `device.cornerRadius` | aynı |
| `use3D` | `device.mode === "3d"` | aynı |
| `device3D` | `device.model` | aynı |
| `rotation3D.{x,y,z}` | `device.rotation.{x,y,z}` | aynı (sadece 3D'de kullanılır) |
| `frameColor` | `device.frameColor` | **anlam farkı**: appscreen'de bu 3D model preset id'si (string id, ör. `"natural"`); mevcut `frame-launch-fe`'de hex renk. **Çözüm:** `device.frameColor: Hex \| string` (3D mode'da preset id, 2D mode'da hex). Tip için literal union dar ifade etmek zor; **`device.frameColorPresetId?: string`** ayrı alan eklenir, `frameColor` 2D'de hex kalır |
| `shadow.{enabled,color,blur,opacity,x,y}` | `device.shadow.{enabled,color,blur,opacity,offsetX,offsetY}` | aynı (yeniden adlandırma OK) |
| `frame.{enabled,color,width,opacity}` (2D border) | `device.border.{enabled,color,width,opacity}` | aynı |
| `positionPreset` | var | mevcut korunur (alt-proje 02 kullanır) |

### 2.3 `Screenshot.text` (metin ayarları)

appscreen text yapısı çok daha kompleks:

| appscreen alan | mevcut karşılık | Aksiyon |
|---|---|---|
| `headlineEnabled` | `text.headline.enabled` | aynı |
| `headlines{lang: string}` | `text.headline.text` (Partial Record) | aynı |
| `headlineLanguages[]` | `Project.activeLocales` | proje seviyesinde tutulur (mevcut pattern korunur) |
| `currentHeadlineLang` | `editorStore.activeLocale` | aynı |
| `headlineFont` | `text.headline.font` | aynı (string) |
| `headlineSize` | `text.headline.fontSize` | aynı |
| `headlineWeight` | `text.headline.weight` | aynı (TextWeight enum) |
| `headlineItalic` | yok | **`text.headline.italic: boolean`** ekle |
| `headlineUnderline` | yok | **`text.headline.underline: boolean`** ekle |
| `headlineStrikethrough` | yok | **`text.headline.strikethrough: boolean`** ekle |
| `headlineColor` | `text.headline.color` | aynı |
| `perLanguageLayout` | `text.headline.perLanguageLayout` | mevcut tek text-config içinde, **proje seviyesine taşı** (`Screenshot.text.perLanguageLayout: boolean`) — appscreen'de bu screenshot seviyesinde tek flag, headline + sub için ortak |
| `languageSettings{lang: {headlineSize, subheadlineSize, position, offsetY, lineHeight}}` | yok | **`Screenshot.text.languageLayouts: Partial<Record<Locale, LanguageLayoutSettings>>`** ekle |
| `currentLayoutLang` | yok | runtime, editorStore'a eklenmez (activeLocale'den türetilir) |
| `position` | `text.headline.position` | aynı |
| `offsetY` | `text.headline.verticalOffset` | aynı |
| `lineHeight` | `text.headline.lineHeight` | aynı |
| Subheadline alanları | `text.subheadline.*` | aynı pattern |
| `subheadlineOpacity` | `text.subheadline.opacity` | aynı |

### 2.4 `Screenshot.uploads` ve lokalize görseller

appscreen: `screenshot.localizedImages = { [lang]: { image, src, name } }`  
mevcut: `Screenshot.uploads: Partial<Record<Locale, string>>` (sadece blobId)

| Alan | Aksiyon |
|---|---|
| Image binary/base64 | mevcut: blob ID, IndexedDB'de saklanıyor → korunur |
| Original filename | yok | **`Screenshot.uploadMeta?: Partial<Record<Locale, { filename: string; baseFilename: string; uploadedAt: string }>>`** ekle (duplicate detection ve dil tespiti için) |

### 2.5 `Screenshot.elements` (Elements katmanı)

Mevcut tip mantıken doğru, **küçük genişletme** gerekli:

| Eksiklik | Aksiyon |
|---|---|
| `elements.kind = "text"` için `frameOffsetY: number` (çelenk dengelemesi) | ekle |
| `elements` `kind = "graphic"` için `tint?: Hex` opsiyonel renk filtresi | ekle (appscreen'de var) |
| `Layer` enum (`behindScreenshot`, `aboveScreenshot`, `aboveText`) | mevcut, doğru |

### 2.6 `Screenshot.popouts`

Mevcut tip uyumlu. **Tek ekleme:** `Popout.sourceUploadLocale?: Locale` — popout hangi yüklü görseli kestiğini bilmeli (lokalize için).

### 2.7 `editorStore`

| Eksik | Aksiyon |
|---|---|
| `transferTarget: string \| null` (style transfer hedefi) | ekle |
| `selectedElementId: string \| null` | ekle (Elements panel için) |
| `selectedPopoutId: string \| null` | ekle (Popouts panel için) |
| `slidingDirection: "left" \| "right" \| null` | ekle (carousel için) |
| `isSliding: boolean` | ekle |
| `settingsModalOpen: boolean` | ekle |
| `aboutModalOpen: boolean` | ekle |
| `magicalTitlesModalOpen: boolean` | ekle |
| `languagesModalOpen: boolean` | ekle |
| `translateModalState: { open: boolean; field: "headline" \| "subheadline" \| "element"; elementId?: string } \| null` | ekle |
| `applyStyleModalOpen: boolean` | ekle |
| `duplicateUploadDialog: { open: boolean; matches: ... } \| null` | ekle (alt-proje 04) |
| `exportLanguageDialogOpen: boolean` | ekle (alt-proje 07) |
| `RightPanelTab` türünü genişlet: `"background" \| "device" \| "text" \| "elements" \| "popouts"` (export butonu zaten ayrı) | güncelle |
| `showSafeArea` | mevcut, korunur (gerçek kullanım sonra eklenecek) |

### 2.8 Yeni store: `settingsStore`

Persisted (localStorage), proje-bağımsız:

```ts
interface SettingsState {
  theme: "auto" | "light" | "dark";
  aiProvider: "anthropic" | "openai" | "google";
  apiKeys: { anthropic: string; openai: string; google: string };
  selectedModels: { anthropic: string; openai: string; google: string };
  hasSeenMagicalTitlesTooltip: boolean;
  hydrate: () => void;
  setTheme(t): void;
  setAiProvider(p): void;
  setApiKey(provider, key): void;
  setSelectedModel(provider, modelId): void;
  markMagicalTitlesTooltipSeen(): void;
}
```

Persistence: `localStorage` anahtarları appscreen ile birebir aynı (geçiş uyumluluğu için):
- `themePreference`, `aiProvider`, `claudeApiKey`, `openaiApiKey`, `googleApiKey`, `anthropicModel`, `openaiModel`, `googleModel`, `magicalTitlesTooltipDismissed`.

### 2.9 `projectsStore`

| Eksik aksiyon | Aksiyon |
|---|---|
| `duplicateProject(id, newName?)` | ekle |
| `reorderScreenshots(projectId, fromIdx, toIdx)` | ekle |
| `addLocale(projectId, locale: Locale)` | ekle |
| `removeLocale(projectId, locale: Locale)` | ekle (≥1 dil koruması) |
| `setCurrentLocale(projectId, locale)` | ekle (`Project.currentLocale` yazar) |
| `migrateLegacyProject(legacy: unknown): Project` | ekle (eski format → schemaVersion 2) |
| `setActiveProject` çağrısı | mevcut (UI yok ama sonraki için hazır) |

`makeBlankScreenshot` ve `makeBlankProject` yeni alan defaultlarıyla güncellenir.

### 2.10 Persistence

`localProjects.ts`:
- `loadProjects()` içinde her proje için `migrateLegacyProject()` çalıştır
- Anahtar: `framelaunch:projects:v2` korunur, dahili `schemaVersion` artar (3'e — geriye dönük loader var)
- LZ-String pattern korunur

---

## 3. Yeni / Genişletilmiş Tipler (özet)

```ts
export interface LanguageLayoutSettings {
  headlineSize: number;
  subheadlineSize: number;
  position: "top" | "bottom";
  verticalOffset: number;
  lineHeight: number;
}

export interface TextConfig {
  enabled: boolean;
  text: Partial<Record<Locale, string>>;
  font: string;
  weight: TextWeight;
  italic: boolean;          // YENİ
  underline: boolean;       // YENİ
  strikethrough: boolean;   // YENİ
  position: "top" | "bottom";
  verticalOffset: number;
  lineHeight: number;
  color: Hex;
  align: "left" | "center" | "right";
  fontSize: number;
  opacity?: number;
}

export interface ScreenshotTextBundle {
  headline: TextConfig;
  subheadline: TextConfig;
  perLanguageLayout: boolean;                                             // YENİ (tek flag, ikisi için ortak)
  languageLayouts: Partial<Record<Locale, LanguageLayoutSettings>>;       // YENİ
}

export interface DeviceConfig {
  mode: "2d" | "3d";
  model: "iphone" | "samsung";
  rotation: { x: number; y: number; z: number };
  positionPreset: DevicePositionPreset;
  scale: number;
  verticalPos: number;
  horizontalPos: number;
  perspective: number;             // YENİ (2D shear)
  frameColor: Hex;                 // 2D mode için
  frameColorPresetId?: string;     // YENİ — 3D mode preset id
  cornerRadius: number;
  tiltRotation: number;
  shadow: ShadowConfig;
  border: BorderConfig;
}

export interface UploadMeta {
  filename: string;
  baseFilename: string;
  uploadedAt: string;
}

export interface Screenshot {
  id: string;
  name: string;
  deviceSizeId: DeviceSizeId;
  customDimensions?: { width: number; height: number };
  uploads: Partial<Record<Locale, string>>;
  uploadMeta?: Partial<Record<Locale, UploadMeta>>;        // YENİ
  background: BackgroundConfig;
  device: DeviceConfig;
  text: ScreenshotTextBundle;                              // GÜNCELLENDİ
  elements: SceneElement[];
  popouts: Popout[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 3;                                         // GÜNCELLENDİ (eskiden 2)
  defaultLocale: Locale;
  activeLocales: Locale[];
  currentLocale: Locale;                                    // YENİ (persisted)
  defaultDeviceSizeId: DeviceSizeId;                        // YENİ
  defaultCustomDimensions?: { width: number; height: number }; // YENİ
  screenshots: Screenshot[];
  lastStyleSource?: string;                                 // mevcut, korunur
}

// SceneElement içinde:
// - kind: "text" → frameOffsetY: number ekle
// - kind: "graphic" → tint?: Hex ekle
```

`Locale` union'ı **genişletilmez** (mevcut 7 dil yeterli; appscreen 26 dil destekliyor ama ürün konuşlanmasına göre Türkçe + 6 büyük dil kâfi). Daha fazla dil eklenirse sonraki spec'te.

---

## 4. Migration Stratejisi (`migrateLegacyProject`)

Persistance'tan okunan her proje JSON'u şu şekilde dönüştürülür:

```ts
function migrateLegacyProject(raw: unknown): Project {
  const p = raw as Partial<Project>;
  const v = (p as { schemaVersion?: number }).schemaVersion ?? 1;

  let next = p as Project;

  if (v < 2) {
    // şu an gerçek bir v1 yok, defansif
  }

  if (v < 3) {
    // v2 → v3 dönüşümleri:
    next = {
      ...(next as Project),
      schemaVersion: 3,
      currentLocale: next.currentLocale ?? next.defaultLocale ?? "tr",
      defaultDeviceSizeId:
        (next as { defaultDeviceSizeId?: DeviceSizeId }).defaultDeviceSizeId
        ?? next.screenshots?.[0]?.deviceSizeId
        ?? "iphone-69",
      screenshots: (next.screenshots ?? []).map(migrateScreenshot),
    };
  }
  return next;
}

function migrateScreenshot(s: any): Screenshot {
  // text bundle'ı eski yapıya bak, perLanguageLayout/languageLayouts eklenir
  const headline = migrateText(s?.text?.headline ?? {}, "top", true);
  const subheadline = migrateText(s?.text?.subheadline ?? {}, "top", false);
  return {
    ...s,
    device: {
      ...defaultDevice(),
      ...(s.device ?? {}),
      perspective: s.device?.perspective ?? 0,
      frameColorPresetId: s.device?.frameColorPresetId,
    },
    text: {
      headline,
      subheadline,
      perLanguageLayout: s.text?.perLanguageLayout ?? false,
      languageLayouts: s.text?.languageLayouts ?? {},
    },
    uploadMeta: s.uploadMeta ?? {},
  };
}
function migrateText(t: any, pos, isHeadline): TextConfig {
  return {
    ...defaultText(pos, isHeadline),
    ...t,
    italic: t.italic ?? false,
    underline: t.underline ?? false,
    strikethrough: t.strikethrough ?? false,
  };
}
```

Eski `text.headline.perLanguageLayout` flag'i varsa screenshot seviyesindeki `perLanguageLayout`'a aktarılır.

**Dummy guard:** `loadProjects()` migration sırasında hata atarsa proje atılır (console.warn) — kullanıcıyı kaybetmez (diğer projeler yüklenir).

---

## 5. Devices Registry Güncellemeleri

`lib/devices/registry.ts` zaten 11 cihaz + custom listeliyor. **Aksiyon: appscreen ile birebir id eşleşmesi sağla:**

| appscreen id | frame-launch-fe id | Aksiyon |
|---|---|---|
| `iphone-6.9` | `iphone-69` | (id farklılığı kabul, mevcut korunur) |
| `iphone-6.7` | `iphone-67` | aynı |
| `iphone-6.5` | `iphone-65` | aynı |
| `iphone-5.5` | `iphone-55` | aynı |
| `ipad-12.9` | `ipad-129` | aynı |
| `ipad-11` | `ipad-11` | aynı |
| `android-phone` | `android-phone` | aynı |
| `android-phone-hd` | `android-phone-hd` | aynı |
| `android-tablet-7` | `android-tablet-7` | aynı |
| `android-tablet-10` | `android-tablet-10` | aynı |
| `web-og` | `og` | (id farklı, isim aynı) — alias eklenir |
| `web-twitter` | `twitter-card` | alias |
| — | `website-hero`, `feature-graphic` | yeni, korunur |

`getDeviceSize` zaten boyut tablosu döndürür; `migrateLegacyProject` eski id'leri (eğer varsa) yenilere haritalar:

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
```

---

## 6. Templates Registry — Hiçbir Değişiklik

5 mevcut şablon korunur. `makeProject` ve `screenshot` helper'ları yeni alanları otomatik default ile alır (defaults bool/number).

---

## 7. Settings Store — Detaylı Şema

`store/settingsStore.ts` (yeni dosya):

```ts
"use client";
import { create } from "zustand";

export type AiProvider = "anthropic" | "openai" | "google";
export type Theme = "auto" | "light" | "dark";

export const AI_PROVIDERS = {
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
  openai: { /* benzer */ },
  google: { /* benzer */ },
} as const;

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
```

`hydrate()` localStorage'dan yükler. Setter'lar her değişiklikte tek tek yazar.

`useEffect` `hydrate()` çağrısı `app/editor/page.tsx` veya `EditorShell` içinde tetiklenir.

`theme` değişince `document.documentElement.dataset.theme` güncellenir (alt-proje 08'de `applyTheme()` helper'ı yazılır, burada hazırlık).

---

## 8. Geriye Dönük Uyumluluk Garantileri

- Mevcut `localStorage` anahtar ismi (`framelaunch:projects:v2`) korunur — kullanıcı projeleri kaybolmaz
- Eski kayıtlar load edilince otomatik migrate (in-memory) + ilk kayıtta v3 olarak kaydedilir
- Yeni alanların hepsi opsiyonel veya varsayılanı ayarlanmış → mevcut UI bileşenleri çalışmaya devam eder
- `RightPanelTab` türü genişletildiği için panel butonları mevcut hâliyle çalışır (sonraki alt-projelerde "popouts", "elements" eklenir)

---

## 9. Dosya Değişiklik Listesi

| Dosya | Değişiklik tipi |
|---|---|
| `lib/types/project.ts` | Genişletme (yeni alanlar, default'lar) |
| `store/editorStore.ts` | Yeni state alanları + setter'lar |
| `store/projectsStore.ts` | Yeni aksiyonlar + makeBlankProject güncelle + migration çağrısı |
| `store/settingsStore.ts` | **YENİ** dosya |
| `lib/persistence/localProjects.ts` | `migrateLegacyProject` import ve çağrı |
| `lib/persistence/migrate.ts` | **YENİ** dosya — migration mantığı |
| `lib/devices/registry.ts` | `LEGACY_DEVICE_SIZE_ALIASES` ve resolver |
| `lib/templates/registry.ts` | (no-op — defaults otomatik alır) |

---

## 10. Test Planı

### 10.1 Birim testleri (yazılacak)

- `migrate.test.ts`:
  - v2 proje → v3 dönüşüm doğru
  - eksik alanlar default'larla doldurulur
  - eski device size id'leri (`iphone-6.9` vb.) yeni id'ye dönüşür
  - text bundle'ında `perLanguageLayout` doğru taşınır
- `settingsStore.test.ts`:
  - hydrate localStorage'tan okur
  - `setApiKey` localStorage'a yazar
  - `validateKey` provider prefix kontrolü doğru

> Şu an projede `vitest`/`jest` kurulumu yok. Bu spec sırasında **vitest** kurulumu yapılır (`pnpm add -D vitest @testing-library/react jsdom`).

### 10.2 Manuel kontroller

- `pnpm dev` → editor açılır, mevcut tek proje yüklenir, hiçbir breaking error yok
- LocalStorage'da `framelaunch:projects:v2` mevcut bir kayıtla başla → migrate edilir, schemaVersion 3 olur, kaydedilir
- `pnpm typecheck` temiz
- `pnpm lint` temiz

---

## 11. Çıktılar

1. Tüm değişiklikler tek bir feature branch (`feat/foundation-schema`) altında
2. Birim test sonuçları
3. `docs/superpowers/specs/2026-04-23-00-foundation-schema-design.md` (bu dosya)
4. Sonraki adım: `docs/superpowers/plans/2026-04-23-00-foundation-schema-plan.md` (writing-plans skill ile)

---

## 12. Açık Sorular (bu spec'e özel)

1. **Test framework:** vitest yeterli mi, yoksa playwright + vitest combo mu? — **Önerilen: sadece vitest birim için**, e2e gerekirse alt-proje 15'te.
2. **Locale union:** appscreen'de 26 dil var. v1 için 7 dil yeterli mi? — **Önerilen: evet**, daha sonra genişletilebilir.
3. **Migration stratejisi:** eski projeler bozuksa kullanıcıya görünür uyarı mı, sessiz silme mi? — **Önerilen: console.warn + atlama** (kullanıcı kaybetmez)
4. **`appscreen.outputDevice` vs per-screenshot:** mevcut frame-launch-fe pattern (per-screenshot) korunsun mu, yoksa proje seviyesine taşınsın mı (appscreen ile birebir)? — **Önerilen: per-screenshot** (daha esnek, modern app'lerde standart)
