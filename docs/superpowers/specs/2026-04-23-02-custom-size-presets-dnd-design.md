# 02 — Custom Output Size + Position Presets + Drag&Drop Sort

**Tarih:** 2026-04-23
**Üst spec:** `2026-04-23-appscreen-parity-overview.md`
**Bağımlılık:** `00 — Foundation` (✅), `01 — Project Management UI` (✅)
**Karmaşıklık:** S
**Risk:** Düşük (foundation'da gerekli store/tip alanları zaten var)

---

## 1. Amaç

Üç bağımsız ama küçük UX boşluğunu kapatmak:

1. **Custom output size**: appscreen'de "Custom Size" seçimi width × height input'larıyla geliyor. `frame-launch-fe`'de `Screenshot.customDimensions` foundation'da eklendi ama **UI yok** → "Custom" seçilince inline input'lar açılmıyor.
2. **Position presets**: appscreen'de cihaz panelinin alt kısmında 8 hazır pozisyon kart-buton var (Centered, Bleed Bottom/Top, Float Center/Bottom, Tilt Left/Right, Perspective). `frame-launch-fe`'de hiç yok — kullanıcı sliderlarla manuel ayarlamak zorunda.
3. **Drag & drop sort**: `ScreenshotsSidebar`'da screenshot'ları yeniden sıralayabilmek. Store action'ı `reorderScreenshots(projectId, fromIdx, toIdx)` foundation'da eklendi ama UI yok.

**Kapsamda olmayan:**

- Custom width/height için preset listesi (sadece serbest sayı)
- Preset thumbnail'larını canlı render etmek (SVG ikonlarla yeterli — appscreen de SVG kullanıyor)
- Drag & drop için sıkı snap-guides veya çoklu seçim
- Çoklu screenshot toplu reorder

---

## 2. appscreen → frame-launch-fe Parite Haritası

| appscreen öğesi | Konum | frame-launch-fe karşılığı (bu spec) |
|---|---|---|
| `#custom-size-inputs` (output size dropdown'ında "Custom Size" seçilince beliren width × height input'ları) | sidebar footer | DevicePanel "Boyut" section içinde inline `<CustomSizeInputs />` |
| `#position-presets` (8 preset kart-butonu, dropdown içinde) | sağ sidebar | DevicePanel'de yeni `<PanelSection title="Pozisyon Presetleri">` + `<PositionPresetGrid />` |
| `applyPositionPreset(preset)` (fonksiyon: scale + x + y + rotation + perspective set eder) | app.js | `lib/devices/positionPresets.ts` (pure helper, test edilir) |
| Sidebar screenshot listesi sürüklenmiyor (appscreen'de drag&drop yok!) | — | **Yeni eklenir**: `<ScreenshotsSidebar>` içinde HTML5 native drag & drop ile reorder |

> Not: Drag & drop appscreen'de yok; **frame-launch-fe için iyileştirme** olarak ekliyoruz çünkü modern UX için standart.

---

## 3. Veri / State

### 3.1 `Screenshot.customDimensions`

Tip foundation'da eklendi:

```ts
customDimensions?: { width: number; height: number };
```

`getEffectiveDimensions(deviceSizeId, customDimensions)` zaten doğru çalışıyor (`registry.ts`).

### 3.2 `device.perspective`

Foundation'da eklendi:

```ts
device: {
  // ...
  perspective: number; // 0–30 önerilen aralık
}
```

Ancak şu an bu alan render pipeline'ında **kullanılmıyor**. Bu spec'te:

- `applyPositionPreset` perspective alanını set eder
- DevicePanel slider'ı eklenir (manuel ayar için)
- Render pipeline (`DeviceLayer`) perspective uygulamasını **bu spec'te yapmıyoruz** (alt-proje **13 — 3D** kapsamında daha kapsamlı ele alınacak). Şimdilik perspective değer state'te tutulur ama görsel etkisi minimum (CSS `transform: perspective() rotateX()`'in kapsamlı entegrasyonu sonraya).
- **Kompromis:** Perspective değişikliği görsel olarak hissedilir olsun diye basit bir CSS transform ekleyelim: `transform: perspective(1200px) rotateY(${perspective * 0.6}deg)`. Bu appscreen davranışına yakın bir görsel verir, daha sonra 3D'de zenginleştirilir.

### 3.3 `reorderScreenshots`

Store action'ı foundation'da eklendi:

```ts
reorderScreenshots: (projectId: string, fromIdx: number, toIdx: number) => void;
```

Test'leri zaten yazıldı.

---

## 4. UI Tasarımı

### 4.1 Custom Size Inputs (DevicePanel "Boyut" section)

```
[Boyut select: iPhone 6.9" — 1320×2868 ▾]

(eğer "Custom Size" seçildiyse:)
┌─────────────┬───┬─────────────┐
│ Width 1200  │ × │ Height 800  │
└─────────────┴───┴─────────────┘
[!] Geçerli aralık: 100–6000 px
```

- İki number input, label yok (placeholder + visible × ayırıcısı)
- Min: 100, Max: 6000, default: 1200×800 (registry'deki "custom" entry değerleri)
- Debounce: kullanıcı yazarken `customDimensions`'ı her keystroke'ta güncelleme yerine, `onBlur` veya 300 ms throttle ile (yoksa canvas her keystroke yeniden render → ağır)
- Karar: **inline güncelleme + her ikisi sayı olduğunda**, `parseInt` NaN ise eski değer korunur

### 4.2 Position Preset Grid (DevicePanel)

`<PanelSection title="Pozisyon Presetleri">` içinde:

```
┌─────────┬─────────┬─────────┬─────────┐
│ [icon]  │ [icon]  │ [icon]  │ [icon]  │
│Centered │ Bleed↓  │ Bleed↑  │ Float ● │
├─────────┼─────────┼─────────┼─────────┤
│ [icon]  │ [icon]  │ [icon]  │ [icon]  │
│ Tilt ◀  │ Tilt ▶  │ Persp.  │ Float↓  │
└─────────┴─────────┴─────────┴─────────┘
```

- 4×2 grid (4 kolonlu, küçük ekranda 2-kolonlu)
- Her preset: SVG ikon (appscreen'in SVG'leri — basit dikdörtgen + transformlar) + 1-2 kelime label
- Tıklama → `applyPositionPreset(presetId, screenshot.device)` helper'ı çağrılır → `scale, horizontalPos, verticalPos, tiltRotation, perspective` güncellenir
- "Aktif preset" işareti yok (appscreen'de var ama state karmaşası getirir; herhangi bir slider değişince preset kalkar). Kullanıcı isterse her zaman tekrar tıklayabilir.
- Hover'da hafif scale + border vurgusu

### 4.3 Drag & Drop Sort (ScreenshotsSidebar)

Her screenshot satırı `draggable="true"` olur. Görsel cue:

- Satır hover'da sol kenarda küçük `GripVertical` ikon (lucide-react'tan)
- Sürükleme sırasında satır `opacity-50`
- Drop hedefi gösterimi: hedef satırın üstünde 2px yukarı/aşağı highlight çizgisi

API:

```ts
// HTML5 drag and drop with native events
onDragStart(e, idx) → e.dataTransfer.setData("text/plain", String(idx))
onDragOver(e, idx) → e.preventDefault() + setHoveredIdx(idx) + computeDropPosition (above/below)
onDragLeave → clearHover
onDrop(e, idx) → const fromIdx = Number(e.dataTransfer.getData("text/plain"));
              const toIdx = dropPosition === "above" ? idx : idx + 1;
              // toIdx > fromIdx olduğunda -1 ayarı yapılır
              reorderScreenshots(projectId, fromIdx, finalIdx);
              setActive(reorderedScreenshot.id) // aktif kalsın
```

**Edge case'ler:**

- Aynı yere bırakma (no-op): store action zaten `fromIdx === toIdx` kontrolü yapıyor
- Yanlış element bırakma (e.g. dış dosya): `dataTransfer.types.includes("text/plain")` ve sayı parse kontrolü
- Mobile (touch): native HTML5 DnD touch'ta zayıf; bu spec sadece masaüstü-mouse hedefliyor. Mobile için ileride pointer events ile özel implementasyon

---

## 5. Yeni Dosyalar / Değişiklikler

| Dosya | Değişiklik |
|---|---|
| `lib/devices/positionPresets.ts` | **YENİ** — `POSITION_PRESETS` map + `applyPositionPreset` pure helper |
| `lib/devices/positionPresets.test.ts` | **YENİ** — birim testler |
| `components/editor/panels/DevicePanel.tsx` | "Boyut" section'a `<CustomSizeInputs />` + yeni `<PanelSection>` "Pozisyon Presetleri" + `<PositionPresetGrid />` + perspective slider eklenir |
| `components/editor/panels/CustomSizeInputs.tsx` | **YENİ** |
| `components/editor/panels/PositionPresetGrid.tsx` | **YENİ** (8 preset, SVG ikonlar inline) |
| `components/editor/ScreenshotsSidebar.tsx` | drag & drop event handler'ları + visual cue (drop indicator + grip icon) |
| `components/editor/canvas/DeviceLayer.tsx` | perspective değerini CSS transform'a uygula (basit yorum: `perspective(1200px) rotateY(...)`) |

Toplam: 4 yeni dosya, 3 güncellenen.

---

## 6. `positionPresets.ts` Detayı

### 6.1 Veri yapısı

```ts
export type PositionPresetId =
  | "centered"
  | "bleed-bottom"
  | "bleed-top"
  | "float-center"
  | "tilt-left"
  | "tilt-right"
  | "perspective"
  | "float-bottom";

export interface PositionPreset {
  id: PositionPresetId;
  label: string; // i18n için Türkçe
  scale: number;        // 0–120 (DevicePanel slider aralığı)
  horizontalPos: number; // 0–100
  verticalPos: number;  // 0–100 (appscreen'de >100 veya <0 olabiliyor; biz clamp ediyoruz ama y=120 gibi değerleri kabul edeceğiz çünkü slider max 100 ama state >100 da tutar; UI'da clamp gösterilir)
  tiltRotation: number; // -45–45 (DevicePanel slider aralığı)
  perspective: number;  // 0–30 önerilen
}
```

### 6.2 Preset değerleri

appscreen'den birebir alınır (sadece anahtar isimleri uyumlanır: `x→horizontalPos`, `y→verticalPos`, `rotation→tiltRotation`):

```ts
export const POSITION_PRESETS: Record<PositionPresetId, PositionPreset> = {
  "centered":     { id: "centered",     label: "Ortalı",       scale: 70, horizontalPos: 50, verticalPos: 50,  tiltRotation: 0,  perspective: 0  },
  "bleed-bottom": { id: "bleed-bottom", label: "Alt Kayma",    scale: 85, horizontalPos: 50, verticalPos: 100, tiltRotation: 0,  perspective: 0  },
  "bleed-top":    { id: "bleed-top",    label: "Üst Kayma",    scale: 85, horizontalPos: 50, verticalPos: 0,   tiltRotation: 0,  perspective: 0  },
  "float-center": { id: "float-center", label: "Yüzen Orta",   scale: 60, horizontalPos: 50, verticalPos: 50,  tiltRotation: 0,  perspective: 0  },
  "tilt-left":    { id: "tilt-left",    label: "Sol Eğik",     scale: 65, horizontalPos: 50, verticalPos: 60,  tiltRotation: -8, perspective: 0  },
  "tilt-right":   { id: "tilt-right",   label: "Sağ Eğik",     scale: 65, horizontalPos: 50, verticalPos: 60,  tiltRotation: 8,  perspective: 0  },
  "perspective":  { id: "perspective",  label: "Perspektif",   scale: 65, horizontalPos: 50, verticalPos: 50,  tiltRotation: 0,  perspective: 15 },
  "float-bottom": { id: "float-bottom", label: "Yüzen Alt",    scale: 55, horizontalPos: 50, verticalPos: 70,  tiltRotation: 0,  perspective: 0  },
};
```

> **Karar:** appscreen'de `bleed-bottom` y=120, `bleed-top` y=-20 değerleri var. Bizim slider 0–100. **İki seçenek:** (a) clamp et (yumuşak ama bleed efekti gider); (b) state'te ham değer tut, slider'da gösterirken clamp et. **Karar: (b) — bleed-bottom y=100, bleed-top y=0** (clamp edilmiş ama görsel olarak hâlâ bleed etkisi vardır çünkü scale 85 büyük).
> Eğer kullanıcı tam bleed efekti isterse manuel olarak slider'ı override edebilir; gelecekte slider aralığı `-20…120` yapılarak iyileştirilebilir (alt-proje 15 polish).

### 6.3 Helper

```ts
export function applyPositionPreset(
  presetId: PositionPresetId,
  device: DeviceConfig,
): DeviceConfig {
  const p = POSITION_PRESETS[presetId];
  return {
    ...device,
    scale: p.scale,
    horizontalPos: p.horizontalPos,
    verticalPos: p.verticalPos,
    tiltRotation: p.tiltRotation,
    perspective: p.perspective,
  };
}
```

Pure → test edilebilir.

---

## 7. Edge Case'ler

| Durum | Davranış |
|---|---|
| Custom width/height boş bırakılırsa | input boş, state değişmez (NaN yakala) |
| Custom width/height < 100 veya > 6000 | input min/max attribute ile sınırlanır; programatik invalid değer state'te kabul edilse de canvas render limit içinde kalır |
| Custom Size seçilmesi ama dimensions undefined | `getEffectiveDimensions` zaten fallback `1200×800` |
| Drop kendi üstüne | no-op (store kontrolü) |
| Drag & drop sırasında screenshot silinirse | active screenshot kontrolü mevcut |
| Preset uygulanırken aktif slider değişmiş | helper sadece set eder, slider next render'da güncellenir |

---

## 8. Test Stratejisi

### 8.1 Birim test (vitest)

`lib/devices/positionPresets.test.ts`:

- Tüm 8 preset için `applyPositionPreset` döndürdüğü değerin doğru olduğunu doğrula
- `device` objesinin başka alanları (frameColor, cornerRadius, shadow, border) **dokunulmadan** kalır
- Bilinmeyen preset id throw etmez (TS guard yeterli) — runtime için: defensive `if (!preset) return device`

### 8.2 Manuel test checklist

- [ ] DevicePanel "Boyut" select'inden "Custom Size" seç → width/height input'ları görünür
- [ ] Width/Height değiştir → canvas yeni boyutta render edilir
- [ ] Tekrar iPhone 6.9" seç → input'lar gizlenir
- [ ] Pozisyon Presetleri grid'inde 8 kart görünür
- [ ] Her preset'e tıkla → device sliderları yeni değerlere geçer, canvas güncellenir
- [ ] Slider'ı manuel değiştir → preset deselected (zaten state senkron, aktif preset göstergesi yok)
- [ ] Sidebar'da bir screenshot'ı sürükle, başka bir konuma bırak → liste yeniden sıralanır
- [ ] Sürüklenmekte olan satır opaklığı azalır, drop hedefi göstergesi görünür
- [ ] Sürüklemeyi sidebar dışına bırak → no-op, görsel temizlenir

---

## 9. Kararlar (kullanıcı onaylı, 2026-04-23)

1. **Perspective render**: Basit CSS `transform: perspective(1200px) rotateY(perspective * 0.6deg)` `DeviceLayer`'a eklenir. Görsel etki minimal ama hissedilir; daha gelişmiş 3D camera projection alt-proje 13'te ele alınır.
2. **Custom size aralığı**: 100–4000 px (appscreen ile birebir). Input `min/max` attribute'leri ile sınırlanır.
3. **Drag & drop kütüphanesi**: `@dnd-kit/core` + `@dnd-kit/sortable` (resmi React DnD lib, smooth animasyon, touch + a11y). Bağımlılık olarak eklenecek.

---

## 10. Sıradaki Adım

Spec onaylanınca → `docs/superpowers/plans/2026-04-23-02-custom-size-presets-dnd-plan.md` (TDD workflow).
