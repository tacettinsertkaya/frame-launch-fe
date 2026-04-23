# 02 — Custom Size + Position Presets + Drag&Drop Sort — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-04-23-02-custom-size-presets-dnd-design.md`
**Tarih:** 2026-04-23
**Yöntem:** TDD (helper'lar için unit test öncelikli)

---

## Görev Listesi

### Task 1 — Bağımlılık ekle: `@dnd-kit/core` + `@dnd-kit/sortable`

```bash
npx --yes pnpm@10.33.2 add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Doğrulama:** `package.json` üç yeni dependency içerir; `pnpm install` hatasız tamamlanır.

---

### Task 2 — `lib/devices/positionPresets.ts` (helper) — RED

`positionPresets.test.ts` yaz:

- Tüm 8 preset için `applyPositionPreset(id, defaultDevice)` doğru `scale, horizontalPos, verticalPos, tiltRotation, perspective` üretir
- Helper, `device.frameColor`, `device.cornerRadius`, `device.shadow`, `device.border` alanlarını **değiştirmez**
- Bilinmeyen id verilirse `device` aynen döner (defensive)

`./node_modules/.bin/vitest run lib/devices/positionPresets.test.ts` → RED.

---

### Task 3 — `positionPresets.ts` implementasyonu — GREEN

Spec'teki `POSITION_PRESETS` ve `applyPositionPreset` ekle. Test → GREEN.

---

### Task 4 — `CustomSizeInputs` bileşeni

`components/editor/panels/CustomSizeInputs.tsx`:

- Props: `value: { width: number; height: number }`, `onChange: (next) => void`
- İki number input (`min={100}`, `max={4000}`), aralarında `×` ayırıcı
- `parseInt` NaN ise update yapma

DevicePanel "Boyut" section'a `screenshot.deviceSizeId === "custom"` ise göster.

---

### Task 5 — `PositionPresetGrid` bileşeni

`components/editor/panels/PositionPresetGrid.tsx`:

- 4×2 (sm:2×4) grid
- Her preset: SVG ikon (appscreen'den uyarlanmış inline SVG'ler) + label
- Tıklama → `onApply(presetId)`
- Hover: `border-[var(--color-accent)]`, `scale-[1.02]`

DevicePanel'e yeni `<PanelSection title="Pozisyon Presetleri">` ekle, içine grid yerleştir; tıklamada:

```ts
update((s) => {
  s.device = applyPositionPreset(presetId, s.device);
});
```

---

### Task 6 — DevicePanel: perspective slider

"Boyut & Konum" section'ına yeni slider:

- Label: "Perspektif", min: 0, max: 30, unit: ""
- `dev.perspective` → `s.device.perspective`

---

### Task 7 — `DeviceLayer` perspective uygulaması

`components/editor/canvas/DeviceLayer.tsx` içinde transform'a perspective ekle:

- Mevcut `transform` string'ine `perspective(1200px) rotateY(${perspective * 0.6}deg)` prepend et (perspective > 0 ise)

---

### Task 8 — `ScreenshotsSidebar` drag & drop entegrasyonu

`components/editor/ScreenshotsSidebar.tsx`:

- `DndContext` + `SortableContext` (vertical list strategy) ile sarmala
- Her satır → `useSortable({ id: screenshot.id })`; `transform`, `transition`, `attributes`, `listeners` uygulanır
- Sol kenarda `GripVertical` ikon (drag handle) — sadece hover'da görünür
- `onDragEnd` callback'inde:

```ts
const oldIndex = items.findIndex(s => s.id === active.id);
const newIndex = items.findIndex(s => s.id === over.id);
reorderScreenshots(project.id, oldIndex, newIndex);
```

- Sürükleme sırasında satır `opacity-50` + ring

---

### Task 9 — `pnpm tsc --noEmit` + `pnpm vitest run` + `pnpm build`

- Tip hatası yok
- Tüm testler geçer
- Production build başarıyla derlenir

---

### Task 10 — Manuel smoke test (dev server)

Browser üzerinden checklist:

- [ ] "Custom Size" seçince width/height input'ları görünür ve canvas yeni boyuta geçer
- [ ] Pozisyon Presetleri grid'inde 8 buton görünür
- [ ] Her preset → device değerleri ve canvas güncellenir
- [ ] Perspektif slider çalışır (canvas'ta hafif 3D etki görünür)
- [ ] Sidebar'da screenshot sürükle-bırak ile yeniden sıralanır
- [ ] Sürükleme sırasında görsel cue (opaklık + drop hedefi) çalışır

---

### Task 11 — Commit + sonraki sub-projeyi öner

`feat(editor): #02 custom size, position presets, sortable screenshots`
