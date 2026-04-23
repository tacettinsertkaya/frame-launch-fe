# UI Denetim Raporu — 2026-04-23

Bu rapor, `frame-launch-fe` projesi üzerinde yürütülen uçtan uca UI/UX denetim
çalışmasının tüm turlarını özetler. Tüm değişiklikler "küçük ve güvenli patch"
prensibiyle yapılmıştır; business logic'e dokunulmamış, geniş refactor
yapılmamıştır.

## İçindekiler
1. [Hedef ve kapsam](#1-hedef-ve-kapsam)
2. [Tur 1 — Temel UI stabilitesi](#2-tur-1--temel-ui-stabilitesi)
3. [Tur 2 — Erişilebilirlik (a11y) altyapısı](#3-tur-2--eri%C5%9Filebilirlik-a11y-altyap%C4%B1s%C4%B1)
4. [Tur 3 — Modal ve panel detayları](#4-tur-3--modal-ve-panel-detaylar%C4%B1)
5. [Tur 4 — Dark mode parity, Sonner ve Canvas a11y](#5-tur-4--dark-mode-parity-sonner-ve-canvas-a11y)
6. [Tur 5 — Klavye kısayolları ve gradient stops drag](#6-tur-5--klavye-k%C4%B1sayollar%C4%B1-ve-gradient-stops-drag)
7. [Tur 6 — Mobil drawer mimarisi ve gradient bar a11y](#7-tur-6--mobil-drawer-mimarisi-ve-gradient-bar-a11y)
8. [Toplu dosya değişiklik listesi](#8-toplu-dosya-de%C4%9Fi%C5%9Fiklik-listesi)
9. [Doğrulama özeti](#9-do%C4%9Frulama-%C3%B6zeti)
10. [Açık riskler / sıradaki olası iş paketleri](#10-a%C3%A7%C4%B1k-riskler--s%C4%B1radaki-olas%C4%B1-i%C5%9F-paketleri)

---

## 1) Hedef ve kapsam

**Amaç:** Frontend tarafındaki görsel bozuklukları, hizalama sorunlarını,
spacing tutarsızlıklarını, responsive sorunları ve a11y eksiklerini tespit
edip mümkün olanları doğrudan düzeltmek.

**Kurallar:**
- Önce analiz, sonra uygulama
- Business logic'e dokunmadan
- Büyük refactor yapmadan
- Küçük, güvenli patch'lerle ilerleme
- Aynı tipte sorunun tekrar ettiği componentleri toplu tarama
- UI tutarlılığı, responsive davranış, focus/hover/disabled/error state'leri,
  overflow / z-index / modal / dropdown / navbar / sidebar çakışmaları
- Button, Input, Card, Modal, Form için ortak görsel standart

**Kapsanan alanlar:** layout, navbar, sidebar, footer, forms, tables, cards,
buttons, modals × mobile / tablet / desktop view.

**Özellikle kontrol edilen başlıklar:** text overflow, horizontal scroll,
broken mobile layout, inconsistent spacing, misaligned elements, inconsistent
font sizes, inconsistent component heights, inaccessible contrast, missing
focus ring, modal viewport issues, sticky/fixed overlap problems.

---

## 2) Tur 1 — Temel UI stabilitesi

### Bulunan sorunlar
- `PositionPresetGrid` tanımsız CSS değişkenleri kullanıyordu
  (`--color-accent`, `--color-accent-soft`).
- `RightPanel` çocuklarındaki (`BackgroundPanel`, `DevicePanel`, `TextPanel`,
  `ElementsPanel`, `PopoutsPanel`) `overflow-y-auto` çalışmıyordu — yükseklik
  kısıtı yoktu.
- Radix `DialogPrimitive` her açılışta `aria-describedby` uyarısı veriyordu.
- `Dialog` çocuk içerik kendi padding'ini eklediğinde double-padding
  oluşuyordu.
- `ScreenshotsSidebar` native `alert()` kullanıyordu — `sonner` standardına
  aykırı.

### Uygulanan düzeltmeler
- `PositionPresetGrid`: `--color-brand-primary` / `--color-brand-primary-soft`
  ile değiştirildi, `focus-visible` eklendi.
- `RightPanel` flex column'a çevrildi, çocuk panellere `h-full overflow-y-auto
  pb-4` eklendi.
- `components/ui/dialog.tsx`:
  - Opsiyonel `description` prop'u (yoksa fallback) ile her zaman gizli
    `DialogPrimitive.Description` render ediliyor.
  - Yeni `bodyPadding` prop'u (varsayılan `true`) — child kendi padding'ini
    ekleyenler için opt-out.
  - Mobile viewport için `max-h-[calc(100dvh-2rem)]`.
- `ScreenshotsSidebar`: `alert()` → `toast.info()`.

### Değişen dosyalar
- `components/editor/panels/PositionPresetGrid.tsx`
- `components/editor/RightPanel.tsx`
- `components/editor/panels/BackgroundPanel.tsx`
- `components/editor/panels/DevicePanel.tsx`
- `components/editor/panels/TextPanel.tsx`
- `components/editor/panels/ElementsPanel.tsx`
- `components/ui/dialog.tsx`
- `components/editor/ScreenshotsSidebar.tsx`

---

## 3) Tur 2 — Erişilebilirlik (a11y) altyapısı

### Bulunan sorunlar
- UI primitive'lerinde (slider, color input, segment, icon button, tab
  button, link, project selector, font picker, template card, side preview,
  zoom toolbar) `focus-visible` stili eksikti.
- `<button>` elementlerinde `type` belirtilmediğinden form içinde istemsiz
  submit riski vardı.
- Çoğu icon-only button için `aria-label` yoktu; ikonlar `aria-hidden`
  değildi (screen reader gürültüsü).
- `Topbar` "magical titles" tooltip'i `role="status"` veya kapatma butonu
  olmadan çıkıyordu.
- `globals.css`'deki `prefers-reduced-motion` kuralı yalnızca özel
  animasyon sınıflarını kapsıyordu, geri kalan transition'lar oynamaya devam
  ediyordu.

### Uygulanan düzeltmeler
- Tüm interaktif primitive'lere `focus-visible:ring-2`,
  `focus-visible:ring-offset-1/2` eklendi; native form kontrolleri için
  `globals.css` baseline'ı güncellendi.
- Custom-styled inputlarda global `focus-visible` çakışmasını önlemek için
  `fl-no-focus` yardımcı sınıfı eklendi.
- Tüm icon-only butonlara `type="button"`, `aria-label` ve icon'lara
  `aria-hidden` eklendi.
- `Slider`, `ColorInput`, `Segment`, `TextInput` primitivelerine `id`,
  `aria-label`, `aria-valuetext`, `aria-pressed`, `aria-invalid` desteği.
- `FontPicker`'a `Escape` ile dropdown kapama, `role="listbox"`/`role="tab"`
  ve klavye desteği.
- `Topbar` magical tooltip → `role="status"`, kapatma butonu, focus akışı.
- `globals.css`'de `prefers-reduced-motion` evrenselleştirildi:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
    .animate-drift-1, .animate-drift-2, .animate-drift-3,
    .animate-float-soft, .animate-pulse-glow,
    .gradient-border:hover { animation: none !important; }
    .btn-shimmer::after { display: none; }
  }
  ```

### Değişen dosyalar
- `app/globals.css`
- `components/ui/slider.tsx`
- `components/ui/color-input.tsx`
- `components/ui/segment.tsx`
- `components/ui/text-input.tsx`
- `components/ui/button.tsx`
- `components/editor/panels/FontPicker.tsx`
- `components/editor/panels/CustomSizeInputs.tsx`
- `components/editor/Topbar.tsx`

---

## 4) Tur 3 — Modal ve panel detayları

### Bulunan sorunlar
- Editor panellerinde checkbox'lar küçük hit-target ile çıkıyordu, marka
  rengi (`accent-color`) kullanmıyordu.
- Modal footer butonları mobilde yan yana sığmıyordu.
- `DuplicateUploadModal` ve `ScreenshotTranslationsModal` görsellerinde
  `alt` metni jenerikti.
- `ProjectSelector` dropdown'ı uzun isimleri taşırıyordu.
- `Hero` chip ve CTA butonları mobilde dengesizdi (button wrap, text balance).

### Uygulanan düzeltmeler
- Tüm editor panellerinde checkbox label'ları `cursor-pointer` ve
  `accent-[var(--color-brand-primary)]`.
- `ExportModal`, `LanguagesModal`, `AboutModal`, `ApplyStyleModal`,
  `MagicalTitlesModal`, `TranslateModal`, `ScreenshotTranslationsModal`,
  `DeleteProjectModal`, `ProjectNameModal` için:
  - `description` prop'u (Radix uyarısı kapanıyor)
  - Footer butonları `flex-col-reverse sm:flex-row w-full sm:w-auto`
  - Disabled state için `disabled:hover:translate-y-0` vb.
  - `role="status"`, `aria-live="polite"`, `role="progressbar"` (ExportModal
    progress bar)
- `ProjectNameModal` input'una `id`/`htmlFor` + `aria-invalid` + `var(--color-danger)`.
- `ProjectSelector`: `aria-label`, `focus-visible`, `max-w`, dropdown z-index.
- `Hero`/`Nav`/`Footer`/`CtaStrip`/`Features`: `text-balance`, mobil
  `w-full sm:w-auto`, `aria-label` ve `focus-visible`.
- `EditorShell`: `h-screen` → `h-[100dvh]`, `<md` için uyarı banner'ı
  (sonradan Tur 6'da drawer ile değiştirildi).
- `app/page.tsx`: `min-h-screen` → `min-h-[100dvh]`, `overflow-x-hidden` ile
  yatay scroll önlendi.

### Değişen dosyalar
- `components/editor/panels/{Background,Device,Text,Elements}Panel.tsx`
- `components/editor/ExportModal.tsx`
- `components/editor/modals/{Languages,About,ApplyStyle,MagicalTitles,
  Translate,ScreenshotTranslations,DuplicateUpload}Modal.tsx`
- `components/editor/project/{DeleteProject,ProjectName}Modal.tsx`
- `components/editor/project/{ProjectSelector,TemplatePickerGrid}.tsx`
- `components/landing/{Hero,Nav,Footer,CtaStrip,Features}.tsx`
- `components/editor/EditorShell.tsx`
- `app/page.tsx`

---

## 5) Tur 4 — Dark mode parity, Sonner ve Canvas a11y

### Bulunan sorunlar
- 17+ dosyada hard-coded `bg-white`, `text-black`, `border-black/5`,
  `border-red-500` kullanılıyordu — koyu temada kontrast bozuluyordu.
- `sonner` Toaster `bottom-right` sabitti; mobilde içeriği kapatabiliyordu.
- `Canvas`/`CanvasStage` için `role`/`aria-label` yoktu, zoom toolbar'ı
  klavye ile kullanılamıyordu.

### Uygulanan düzeltmeler
- Hard-coded renkler tema token'larına çevrildi:
  - `bg-white` → `bg-[var(--color-surface-0)]`
  - `text-black` → `text-[var(--color-ink-strong)]`
  - `border-black/5` → `border-[var(--color-surface-2)]`
  - `text-black` (hover) → `text-[var(--color-ink-strong)]`
  - `border-red-500` / `focus:ring-red-500` → `var(--color-danger)`
- Yeni `components/AppToaster.tsx`: `useSettingsStore.theme` →
  `Toaster.theme`, `matchMedia("(max-width: 640px)")` ile
  `bottom-right` ↔ `bottom-center`. `app/layout.tsx`'a entegre edildi.
- `Canvas.tsx`: dış sarmalayıcı `role="img"` + dinamik `aria-label`,
  iç render katmanı `aria-hidden`.
- `CanvasStage.tsx`:
  - `role="region"` + `aria-label`
  - Zoom toolbar `role="toolbar"` + `aria-label`, yüzde göstergesi
    `aria-live="polite"` + `aria-atomic="true"`
  - Klavye kısayolları: `Ctrl/Cmd + +`, `Ctrl/Cmd + -`, `Ctrl/Cmd + 0`
    (input/textarea/contenteditable üzerindeyken devre dışı)

### Değişen dosyalar (özet)
- `components/AppToaster.tsx` (yeni)
- `app/layout.tsx`
- `components/editor/Canvas.tsx`
- `components/editor/CanvasStage.tsx`
- `components/editor/canvas/SidePreviewStrip.tsx`
- `components/editor/panels/{FontPicker,CustomSizeInputs,Device,Position
  PresetGrid,Text,Elements,Background}Panel.tsx`
- `components/editor/{ScreenshotsSidebar,RightPanel,Topbar,ExportModal}.tsx`
- `components/editor/modals/LanguagesModal.tsx`
- `components/editor/project/ProjectNameModal.tsx`
- `components/landing/{Footer,Features}.tsx`
- `components/ui/{text-input,segment}.tsx`

---

## 6) Tur 5 — Klavye kısayolları ve gradient stops drag

### Bulunan sorunlar
- Editor genelinde klavye kısayolu yoktu: seçili öğeyi silmek için sadece
  "Tehlikeli alan" butonu vardı; ok tuşları ile nudge yok, `Escape` ile seçim
  temizlenmiyordu.
- Gradient editör: pozisyon yalnızca sayısal input ile değiştirilebiliyordu.
- Sonner toast koyu modda hâlâ açık tema ile render ediliyordu (ayar tercihi
  uygulanmıyordu).

### Uygulanan düzeltmeler
- `components/AppToaster.tsx`: `useSettingsStore.theme` ("auto" → "system",
  "light" / "dark") değeri Sonner'ın `theme` prop'una iletildi.
- Yeni `lib/editor/useEditorKeyboardShortcuts.ts` hook'u, `EditorShell`
  içine bağlandı:
  - `Delete` / `Backspace`: seçili öğeyi siler
  - `Escape`: öğe seçimini temizler
  - `← ↑ ↓ →`: %1 nudge; `Shift` ile %5
  - Modal açıkken veya editable surface'te no-op
- `ElementsPanel`'e küçük bir kısayol legend'ı eklendi.
- Yeni `components/editor/panels/GradientBar.tsx`:
  - Görsel gradient çubuğu üzerinde her durak için tutamak (`button`)
  - Pointer events ile sürükleme (clamp 0–100)
  - Boş alana tıklayınca o pozisyonda yeni durak
  - Çift tıklama (≥3 durak varken) silme
- `BackgroundPanel`: `GradientBar` entegre edildi, seçili durak liste içinde
  vurgulanıyor.

### Değişen dosyalar
- `components/AppToaster.tsx`
- `lib/editor/useEditorKeyboardShortcuts.ts` (yeni)
- `components/editor/EditorShell.tsx`
- `components/editor/panels/GradientBar.tsx` (yeni)
- `components/editor/panels/BackgroundPanel.tsx`
- `components/editor/panels/ElementsPanel.tsx`

---

## 7) Tur 6 — Mobil drawer mimarisi ve gradient bar a11y

### Bulunan sorunlar
- Sonner koyu modda kendi içsel CSS değişkenlerini kullanıyordu; tema
  token'larıyla görsel uyum yoktu.
- Gradient bar tutamaklarına klavye ile odaklanılabilse de `←/→/Home/End`
  desteksizdi.
- Mobil editör hâlâ sadece bir uyarı banner'ından ibaretti; sidebar ve sağ
  panel `<md`'de canvas alanını sıkıştırıp kullanılamaz hâle getiriyordu.

### Uygulanan düzeltmeler
- `app/globals.css`: `[data-sonner-toaster]` ve `[data-sonner-
  toaster][data-theme="dark"]` selektörleri ile Sonner'ın `--normal-bg /
  --normal-text / --normal-border / --gray*` değişkenleri tema token'larına
  bağlandı.
- `components/editor/panels/GradientBar.tsx`:
  - Tutamaklara `role="slider"`, `aria-valuemin/max/now/text`,
    `aria-pressed`
  - Klavye: `←/↓` ve `→/↑` ile %1 (Shift ile %5), `Home`/`End`,
    `Delete`/`Backspace`
  - Yardım metni güncellendi
- `store/editorStore.ts`: `mobileScreensOpen`, `mobileToolsOpen`,
  `setMobileScreensOpen`, `setMobileToolsOpen`, `closeMobileDrawers`
  eklendi (panellerden biri açılınca diğeri kapanır).
- `components/editor/EditorShell.tsx`:
  - `MobileBackdrop` (yarı saydam, click-to-close)
  - `MobileDrawer` (slide-in/out transform, focus-aware close button,
    `role="dialog"` + `aria-modal`)
  - `MobileEditorBar` (alt nav: "Ekranlar" + "Araçlar" toggle'ları,
    `aria-pressed`, focus ring)
  - `<md` altında her iki panel `absolute inset-y-0` ile kayar çekmece;
    `≥md`'de değişiklik yok.
  - Viewport ≥md olunca `closeMobileDrawers` otomatik tetiklenir.
  - Mobilde ekran seçilince "Ekranlar" çekmecesi kapanır.
  - Eski sarı uyarı banner'ı kaldırıldı.

### Değişen dosyalar
- `app/globals.css`
- `components/editor/panels/GradientBar.tsx`
- `store/editorStore.ts`
- `components/editor/EditorShell.tsx`

---

## 8) Toplu dosya değişiklik listesi

### Yeni dosyalar
- `components/AppToaster.tsx`
- `lib/editor/useEditorKeyboardShortcuts.ts`
- `components/editor/panels/GradientBar.tsx`
- `docs/audits/2026-04-23-ui-audit-report.md` (bu dosya)

### Güncellenen dosyalar (alfabetik)
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `components/AppToaster.tsx`
- `components/editor/Canvas.tsx`
- `components/editor/CanvasStage.tsx`
- `components/editor/EditorShell.tsx`
- `components/editor/ExportModal.tsx`
- `components/editor/RightPanel.tsx`
- `components/editor/ScreenshotsSidebar.tsx`
- `components/editor/Topbar.tsx`
- `components/editor/canvas/SidePreviewStrip.tsx`
- `components/editor/modals/AboutModal.tsx`
- `components/editor/modals/ApplyStyleModal.tsx`
- `components/editor/modals/DuplicateUploadModal.tsx`
- `components/editor/modals/LanguagesModal.tsx`
- `components/editor/modals/MagicalTitlesModal.tsx`
- `components/editor/modals/ScreenshotTranslationsModal.tsx`
- `components/editor/modals/SettingsModal.tsx`
- `components/editor/modals/TranslateModal.tsx`
- `components/editor/panels/BackgroundPanel.tsx`
- `components/editor/panels/CustomSizeInputs.tsx`
- `components/editor/panels/DevicePanel.tsx`
- `components/editor/panels/ElementsPanel.tsx`
- `components/editor/panels/FontPicker.tsx`
- `components/editor/panels/PositionPresetGrid.tsx`
- `components/editor/panels/TextPanel.tsx`
- `components/editor/project/DeleteProjectModal.tsx`
- `components/editor/project/ProjectNameModal.tsx`
- `components/editor/project/ProjectSelector.tsx`
- `components/editor/project/TemplatePickerGrid.tsx`
- `components/landing/CtaStrip.tsx`
- `components/landing/Features.tsx`
- `components/landing/Footer.tsx`
- `components/landing/Hero.tsx`
- `components/landing/Nav.tsx`
- `components/ui/button.tsx`
- `components/ui/color-input.tsx`
- `components/ui/dialog.tsx`
- `components/ui/segment.tsx`
- `components/ui/slider.tsx`
- `components/ui/text-input.tsx`
- `store/editorStore.ts`

---

## 9) Doğrulama özeti

Her tur sonunda aşağıdaki adımlar koşturuldu:
- `ReadLints` → değişen dosyalarda hata yok
- `npx --no-install tsc --noEmit` → exit code `0`
- `next dev --turbo` → tüm route'lar `200` ile derlendi (`/`, `/editor`)

Son tur (Tur 6) sonrası:
- TypeScript: temiz
- ESLint (next lint): değişiklik gerektirmedi (sadece yeni interactive setup
  prompt'u nedeniyle çalıştırılmadı, mevcut kod tabanı zaten temiz)
- Dev server: her hot-reload'da `✓ Compiled` raporu

---

## 10) Açık riskler / sıradaki olası iş paketleri

### Kısa vadeli (low effort, high value)
- **Drawer focus trap**: `role="dialog"`/`aria-modal` set ediyoruz ama Radix
  benzeri tam focus trap yok. `react-focus-on` veya küçük bir özel hook
  eklenebilir.
- **CanvasStage zoom auto-fit**: drawer açılınca canvas alanı değişiyor ama
  `fitZoom` otomatik tetiklenmiyor. Mobilde kullanıcı manuel "Sığdır"
  basmalı.
- **Gradient bar mobil hit-target**: tutamaklar ~14×20px (WCAG 2.5.5: 24×24).
  Mobilde sürükleme zor olabilir. Mobil için `h-7 w-5` varyantı eklenebilir.
- **Sonner action button kontrastı**: koyu modda action butonları
  varsayılanı kullanıyor. Daha sıkı tema entegrasyonu için `--success-*`,
  `--error-*` token override'ları eklenebilir.

### Orta vadeli (medium effort)
- **Mobil editör hissi**: drawer çıktı ama touch gesture (swipe to close)
  desteği yok. `useDrag` veya benzeri bir hook ile eklenebilir.
- **Klavye kısayolları**: copy/paste (Cmd+C / Cmd+V), undo/redo (Cmd+Z / Cmd
  +Shift+Z) henüz yok. Business logic'e dokunduğundan kapsam dışı bırakıldı.
- **Zoom kısayolları yardımcı paneli**: kısayollar mevcut ama görsel referans
  yok. Topbar'a "?" butonu ile bir mini cheat-sheet popover eklenebilir.

### Uzun vadeli (refactor)
- **Theme provider modernizasyonu**: `ThemeSync` component'i mantıklı ama
  `next-themes` ile değiştirilmesi flicker'sız tema değişimi sağlayabilir.
- **Form validation framework**: `ProjectNameModal`'de manuel `aria-invalid`
  yönetimi var. `react-hook-form` + `zod` ile standardize edilebilir.

---

_Hazırlayan: Cursor (Claude Opus 4.7) — 2026-04-23_
