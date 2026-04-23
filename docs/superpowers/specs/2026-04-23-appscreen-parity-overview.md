# Appscreen → Frame-launch-fe Parity — Overview Spec

**Tarih:** 2026-04-23  
**Durum:** Taslak (kullanıcı onayı bekliyor)  
**Hedef:** `frame-launch-fe` (Next.js + TS + Zustand) projesini `appscreen` (vanilla JS, ~16K satır) ile **tam özellik paritesine** ulaştırmak.

---

## 1. Bağlam

İki proje aynı ürünü temsil ediyor:

- **`appscreen/`**: Üretim kalitesinde, vanilla JS App Store ekran görüntüsü oluşturucu. ~16K satır kod, 14+ cihaz boyutu, 3D iPhone mockup, çoklu dil + AI çeviri, AI destekli başlık üretimi (Magical Titles), elements/popouts katmanları, IndexedDB persistance, Tauri masaüstü desteği.
- **`frame-launch-fe/`**: appscreen'in modern stack'e (Next.js 15 + React 19 + TS + Zustand + Tailwind v4) port edilmesi olarak başlamış proje. Şu an temel iskelet hazır (~%30-40 parite), ana eksikler: 3D, AI, çoklu dil yönetimi, elements/popouts, style transfer, ZIP export, settings, Tauri.

Kapsamlı denetim raporu: bu spec'in alt başlıklarında fark tablosu.

---

## 2. Mevcut Durum (Özet)

### Tam olanlar

- Routing (landing + editor)
- Landing page (Hero, Features, CTA, Footer)
- Editor layout iskeleti (Topbar, ScreenshotsSidebar, CanvasStage, RightPanel)
- Background panel (solid, gradient w/ stops & angle, image, fit, blur, overlay, noise)
- Device panel — sadece 2D (scale, x/y, tilt, frame color, corner radius, shadow Y, border)
- Text panel — sadece temel (headline/sub, hizalama, renk, boyut, satır yüksekliği, opacity)
- Cihaz registry, şablon registry (UI yok)
- Single + multi PNG export
- Per-locale text + per-locale upload (`uploads[locale]`)
- LocalStorage (LZ-String) + IndexedDB blob store

### Kısmen olanlar

- `projectsStore` (createProject/deleteProject/cloneTemplateProject store'da var, **UI yok**)
- Topbar (sadece rename + export, proje seçici yok)
- RightPanel (sadece 3 tab, store 5 tab tanımlamış)
- Şablonlar (5 tane kodda, UI yok)

### Eksik olanlar (büyük başlıklar)

26+ spesifik özellik eksik. Bağımlılık sırasına göre 16 alt-projeye ayrıldı (§4).

---

## 3. Hedef

`frame-launch-fe` v1.0:

- appscreen'deki **her özelliği** Next.js + React + TS idiomatik şekilde sunar
- Mevcut React mimarisi ve Zustand pattern'lerine sadık kalır
- Ek olarak: type-safety, daha iyi component encapsulation, lazy loading (3D/font asset'leri için)
- Tauri desteği ile aynı kod tabanından masaüstü dağıtımı

**Kapsamda olmayan:**

- `appscreen`'in kendisini geliştirmek/değiştirmek
- Yeni özellikler eklemek (sadece port)
- Veritabanı/backend entegrasyonu (her şey local kalır)

---

## 4. Decomposition — 16 Alt-Proje

Her satır → kendi spec dosyasına dönüşecek (`docs/superpowers/specs/2026-04-23-NN-<topic>-design.md`). NN = sıra numarası.

| # | Alt-Proje | Bağımlılık | Karmaşıklık | Risk |
|---|---|---|---|---|
| **00** | Foundation & Schema Genişletmeleri | — | M | Düşük |
| **01** | Proje Yönetimi UI (Topbar + modal'lar + şablon picker) | 00 | M | Düşük |
| **02** | Custom Output Size + Position Presets + Drag&Drop Sort | 00 | S | Düşük |
| **03** | Side Preview Carousel + Sliding Animation | 00 | M | Orta (animasyon kontrolü) |
| **04** | Çoklu Dil Yönetimi UI (AI hariç: dil ekle/çıkar, file detection, duplicate dialog, translations modal) | 00 | M | Düşük |
| **05** | Style Transfer (copy from / apply to all) | 00 | S | Düşük |
| **06** | Text Geliştirmeleri + Google Fonts | 00 | L | Orta (font lazy-load) |
| **07** | ZIP Export + Dile Göre Export Dialog | 04 | S | Düşük |
| **08** | Settings + About + Tema + API Keys | 00 | S | Düşük |
| **09** | AI Translation (Anthropic/OpenAI/Google) | 04, 08 | M | Orta (API contract) |
| **10** | Magical Titles (AI Vision) | 08, 09 | L | Orta-Yüksek (vision API + prompt eng) |
| **11** | Elements Katmanı (graphic/text/emoji/icon + drag) | 00 | L | Yüksek (canvas drag-drop, snap guides) |
| **12** | Popouts Katmanı (crop preview + render) | 00, 11 | M | Orta |
| **13** | 3D Device Mockup (Three.js + GLB + drag-rotate) | 00 | XL | Yüksek (asset boyutu, performans) |
| **14** | Tauri Masaüstü Desteği | tüm önceki UI'lar | L | Yüksek (build pipeline + Next 15 static export) |
| **15** | Landing Senkronizasyonu + Final Polish | tüm önceki | S | Düşük |

**Toplam tahmin:** S=küçük, M=orta, L=büyük, XL=devasa. Genel iş yükü: ~40-60 günlük geliştirme (tek geliştirici, yarı zamanlı).

---

## 5. Genel Mimari Prensipler

### 5.1 State yönetimi

- `editorStore` — UI durumu (aktif sekme, zoom, modal'lar, transfer hedefi)
- `projectsStore` — proje verileri (CRUD + persistance)
- Tüm canvas render'ı **declarative React** — vanilla JS gibi `updateCanvas()` imperatif çağrı yok. State değişince React render eder.

### 5.2 Render katmanları

`Canvas.tsx` içinde appscreen'in pipeline'ına benzer sırada:
1. `BackgroundLayer` (solid/gradient/image + overlay + noise)
2. `ElementsLayer` (z-index: behind-screenshot)
3. `DeviceLayer` (2D veya 3D mode)
4. `ElementsLayer` (z-index: above-screenshot)
5. `PopoutsLayer`
6. `TextLayer` (headline + subheadline)
7. `ElementsLayer` (z-index: above-text)

### 5.3 Persistance

- Proje JSON: `localStorage` + LZ-String (zaten var)
- Blob'lar (uploaded images, GLB modelleri, vb.): IndexedDB (`blobStore` zaten var)
- Settings (API key'ler, tema): `localStorage` ayrı namespace

### 5.4 Asset stratejisi

- Lucide icons: `lucide-react` (zaten dependency)
- Google Fonts: dinamik `<link>` enjeksiyonu, kategori listesi cache
- 3D modeller: `public/models/*.glb`, lazy load (`next/dynamic`)
- Tüm AI API çağrıları: client-side (key kullanıcıdan)

### 5.5 i18n

- `Locale` union'ı genişletilebilir (şu an 7 dil)
- Tüm metin alanları `Record<Locale, string>` 
- AI çevirisi için contract: `translate(text, sourceLang, targetLang) → string`

### 5.6 Tauri uyumluluğu

- Tüm dosya I/O ve native özellikler `if (window.__TAURI__)` gate'i altında
- Web ve desktop aynı bundle'dan
- Static export (`next.config.ts` `output: 'export'`)

---

## 6. Test Stratejisi

- **Birim test:** kritik utility'ler (gradient render, dil tespit, transfer style, AI prompt'ları)
- **Integration:** her panel'in store ile etkileşimi
- **E2E (opsiyonel):** Playwright ile ana akışlar (proje oluştur, screenshot ekle, export)
- **Manuel parity test:** her alt-proje sonunda appscreen ile yan-yana karşılaştırma

---

## 7. Çıktılar

Her alt-proje için:
1. `docs/superpowers/specs/2026-04-23-NN-<topic>-design.md` — bu spec'in detaylı versiyonu
2. `docs/superpowers/plans/2026-04-23-NN-<topic>-plan.md` — adım adım uygulama planı
3. PR (veya commit serisi) — kullanıcıya gözden geçirme için
4. Manual test notları (parity check)

---

## 8. Sıra ve Kilometre Taşları

```
M1 (foundation):     00
M2 (UX katmanları):  01 → 02 → 03 → 04 → 05
M3 (text+export):    06 → 07
M4 (AI suite):       08 → 09 → 10
M5 (canvas tam):     11 → 12 → 13
M6 (desktop+polish): 14 → 15
```

Her milestone sonunda kullanıcıya çalışan demo + parity raporu sunulur.

---

## 9. Açık Sorular

(Bu spec onaylanırken cevaplanır.)

1. AI provider key'leri için ek olarak server-side proxy düşünülmeli mi? (Şu an client-side, key tarayıcıda — appscreen ile aynı)
2. 3D modelin (~5-15 MB) bundle'a dahil edilmesi vs. CDN'den çekilmesi?
3. Tauri için minimum desteklenen platformlar? (macOS / Windows / Linux?)
4. Backward compat: `localStorage`'daki eski Framelaunch projeleri korunmalı mı?

---

## 10. Onay

Bu overview spec onaylanınca, sıradaki çıktı: `2026-04-23-00-foundation-schema-design.md`.
