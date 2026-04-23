# 03 — Side Preview Carousel + Sliding Animation

**Tarih:** 2026-04-23  
**Üst spec:** `2026-04-23-appscreen-parity-overview.md`  
**Bağımlılık:** `00 — Foundation`, `01`, `02` (✅)  
**Karmaşıklık:** M (layout + animasyon senkronu)  
**Risk:** Orta (yan önizlemelerde performans; animasyon sırasında titreme)

---

## 1. Amaç

`appscreen` ana canvas alanındaki **yan önizleme şeridi** davranışını `frame-launch-fe` içinde yeniden üretmek:

- Aktif screenshot’ın **hemen solunda** bir önceki, **hemen sağında** bir sonraki ekranın küçük önizlemesi.
- İsteğe bağlı olarak **bir adım daha uzağa** (index ±2) “far” önizlemeleri (appscreen’de 4 yan slot: far-left, left, right, far-right).
- Yan önizlemeye tıklayınca ilgili ekran **seçilsin** ve geçişte **yatay kayma animasyonu** oynasın (0.3s ease-out, appscreen ile aynı his).
- `frame-launch-fe` zaten `activeScreenshotId` + `Canvas` bileşenini kullanıyor; bu spec, **CanvasStage** içinde görsel düzeni ve animasyonu tanımlar.

**Kapsamda olmayan (başka alt-projeler):**

- **3D cihaz** (`device.mode === "3d"`, Three.js): alt-proje **#13**. Bu spec’te yan önizlemeler, mevcut **2D `Canvas`** pipeline’ını kullanır (appscreen’de 3D screenshot’lar için ayrı `renderThreeJSForScreenshot` vardı; burada 2D yol yeterli kabul edilir, 3D gelene kadar yan önizleme 2D görünür).
- **Elements / Popouts** tam çizimi: `Canvas` şu an arka plan + cihaz + metin; ileride #11/#12 ile genişlerse yan önizlemeler de otomatik kapsanır, ek iş yok.
- **ZIP / export** veya **sidebar** ile tekrarlayan navigasyon: mevcut davranış aynı kalır.

---

## 2. Referans: appscreen

### 2.1 DOM ve CSS

- Kök: `.preview-strip` — `display: flex`, `align-items: center`, `justify-content: center`, `width: 100%`, `transition: transform 0.3s ease-out`.
- Slid sırasında: `.preview-strip.sliding` → `pointer-events: none`.
- Yan kartlar: `.side-preview` — `position: absolute`, `top: 50%`, `translateY(-50%)`, `opacity: 0.6`, gölge, yuvarlatma; hover’da `opacity: 0.85`.
- Sol taraftaki canvas’lar için `direction: rtl` + içeride `direction: ltr` (layout quirk; React tarafında aynı etki gerekmezse sadece konumlandırma yeterli).

### 2.2 Boyutlandırma

- `getCanvasDimensions()` ile çıktı boyutu; önizleme ölçeği:  
  `previewScale = min(400 / width, 700 / height, 1)` (piksel sınırları).
- Ana canvas görünen genişlik ≈ `width * previewScale` (aslında main de aynı scale ile çiziliyor).
- Boşluk: **10px** (`gap`).

### 2.3 `slideToScreenshot(newIndex, direction)`

1. `isSliding = true`, strip’e `sliding` sınıfı.  
2. `slideDistance = mainCanvasDisplayWidth + 10` (px).  
3. `direction === 'right'` → `transform: translateX(-slideDistance)`; `'left'` → `translateX(+slideDistance)`.  
4. `Promise.all(animation 300ms, 3D model preload varsa)` sonrası:  
   - Geçici canvas’lara komşu önizlemeleri önceden çiz (flicker önleme) — **imperatif canvas** dünyası.  
   - `selectedIndex` güncelle, UI senkron, `updateCanvas()`.  
   - Strip `transform` sıfırla, `transition: none` ile anlık reset, sonra rAF ile transition geri.  
5. `isSliding = false`.

**React notu:** Önceden canvas kopyalama yerine, state güncellemesinden önce/sonra **aynı `Canvas` bileşenleri** ile React render kullanılabilir; titreme riski varsa: animasyon bitene kadar komşu `Canvas`’ları aynı `key`/`scale` ile sabit tut, veya kısa süre `skip` bayrağı (appscreen’deki `skipSidePreviewRender` benzeri) — uygulama planda netleştirilecek.

---

## 3. Mevcut kod: frame-launch-fe

| Parça | Durum |
|--------|--------|
| `CanvasStage` | Sadece ortada tek `Canvas` (aktif); gizli tam çözünürlük kopyaları export için. |
| `editorStore` | `isSliding`, `slidingDirection`, `setSliding` **zaten tanımlı** — bu spec bunları **kullanmayı** öngörür (animasyon süresi boyunca strip kilit, isteğe bağlı ok ikonu / erişilebilirlik). |
| `Canvas` | `scale` prop ile ölçeklenir; yan önizleme için `sidePreviewScale` aynı formülle hesaplanır. |

---

## 4. Hedef UX (parite)

1. **≥2 screenshot** varken: **left** (index−1) ve **right** (index+1) görünür; tıklanınca o ekran aktif olur.  
2. **≥3 screenshot** varken: **far-left** (index−2) ve **far-right** (index+2) ekstra görünür (daha sol/sağa “sıra” hissi).  
3. Sınırda: yoksa ilgili slot gizli (`display: none` / `hidden`).  
4. Tıklama + animasyon sırasında **çift tıklama / ardışık geçiş** engellenir (`isSliding`).  
5. Animasyon süresi **300ms**, **ease-out** (Tailwind: `duration-300 ease-out`).  
6. Yan kartlar, appscreen gibi **düşük opaklık** (ör. 0.6) ve **hover** ile artış (0.85).

**İsteğe bağlı (bu spec’te zorunlu değil):** Klavye ←/→ ile önceki/sonraki (appscreen’de aranmadı; eklenebilir).

---

## 5. Mimari öneri

### 5.1 Bileşen ayrımı

- `CanvasStage` içinde (veya yanında) yeni: **`SidePreviewStrip`** (veya `EditorPreviewArea`).  
- Sorumluluk:  
  - `project.screenshots` + `activeId` → komşu index’ler.  
  - `getEffectiveDimensions` + `sidePreviewScale` (max 400×700 sınırı).  
  - Orta hücre: mevcut ana `Canvas` (zoom ile).  
  - Dört mutlak konumlu küçük `Canvas` (sadece ilgili `screenshot` + aynı `activeLocale`).

### 5.2 Animasyon mekanizması

- **Dış sarmalayıcı** (overflow `hidden` — taşan strip kırpılsın): `relative w-full h-full min-h-0 flex items-center justify-center`.  
- **İç strip** (flex veya `relative` + children): `transition-transform duration-300 ease-out` + `translateX` animasyonu.  
- `slideDistance`: DOM’dan veya `ref` ile ölçülen **ana canvas’ın dış (scaled) genişliği + 10**.

**Hedef id seçimi (tıklama):**  
- Left tık → `setActiveScreenshot(id at index-1)`  
- `slide` yönü: hedef mevcuttan **küçük index** ise `direction: 'left'` (strip sağa kayar — appscreen ile tutarlı: “sağdakine tıkla” → `translateX(-distance)`).

**Index bulma:** `const activeIndex = screenshots.findIndex(s => s.id === activeId)`.

### 5.3 Store

- `slide` başlarken: `setSliding(true, 'left' | 'right')`.  
- Bittiğinde: `setSliding(false, null)`.

---

## 6. Performans

- 4 ek `Canvas` ağır olabilir; `React.memo` ile `SidePreviewCanvas` sarmalayıcı.  
- `scale` düşük olduğundan (≤400px genişlik) kabul edilebilir.  
- Gerekirse **sadece adjacent** (left/right) önce, far yok — **parite için far da istenir**; başta hepsi, sonra profil.

---

## 7. Test stratejisi

- **Pure helper** (varsa `getNeighborIndices(n, total)` veya `computeSlideTransform`) → vitest.  
- **Bileşen:** anlamsal test zor; manuel smoke: 3+ ekran projede yan tıkla, animasyon, aktif ekran ve sağ panel senkronu.  
- **E2E:** yok (bu repo henüz Playwright kullanmıyorsa atlanır).

---

## 8. Açık noktalar (plan aşamasında kapatılır)

1. **Far önizlemeler** her zaman mı, yoksa `>=4` ekranda mı? — Öneri: `appscreen` ile aynı: index mevcut ise göster.  
2. Gizli export alanı (`left: -99999`) — **değiştirilmeden** kalmalı; strip sadece **görünen** alanı etkiler.  
3. `zoom` kontrolü ana canvas’ı büyütüyor; `slideDistance` **görünen** genişliğe mi bağlı? — Evet, `ref` ile ölçülmeli (zoom değişince yeniden layout).

---

## 9. Kabul kriterleri

- [ ] En az 2 ekranlı projede sol/sağ önizlemeler ve tıklama ile geçiş.  
- [ ] 3+ ekranda far sol/sağ (uygun index varsa) görünür.  
- [ ] Geçişte 300ms yatay kayma ve geçiş sırasında etkileşim kilidi.  
- [ ] `isSliding` / `setSliding` store ile uyumlu kullanım.  
- [ ] `tsc` + `vitest` + `next build` yeşil.

---

## 10. Sonraki adım

Onay sonrası: `docs/superpowers/plans/2026-04-23-03-side-preview-carousel-plan.md`.
