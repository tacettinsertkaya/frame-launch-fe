# 04 — Çoklu Dil Yönetimi UI (AI hariç)

**Tarih:** 2026-04-23  
**Üst spec:** `2026-04-23-appscreen-parity-overview.md`  
**Bağımlılık:** `00 — Foundation` (✅)  
**Karmaşıklık:** M  
**Risk:** Düşük (çoğu store alanı hazır; asıl iş UI + dosya adı yardımcıları)

**Bu spec’in dışında:** AI ile çeviri (#09), export dil seçimi modal’ı (#07), API anahtarları (#08).

---

## 1. Amaç

`appscreen`’deki **çoklu dil + yerelleştirilmiş ekran görüntüsü** akışını `frame-launch-fe` ile hizalamak:

1. Projede **aktif diller** listesi (`activeLocales`) ve **şu an düzenlenen dil** (`currentLocale`).
2. Dosya adından **dil kodu tespiti** (`screenshot_de.png`, `foo-pt-br.png` vb.) ve **base filename** eşlemesi.
3. Aynı base isimle yüklenen dosya için **Duplicate** modal: **Değiştir / Yeni ekran oluştur / Yoksay** (appscreen: Replace / Create New / Skip).
4. Bir screenshot için **Çeviriler** modal’ı: projedeki her dil için görsel yükle / kaldır (appscreen `screenshot-translations-modal` + `updateScreenshotTranslationsList`).
5. Topbar veya editörde **dilleri yönet** modal’ı: dil ekle / çıkar (en az bir dil kalmalı).

**Parite notu:** `appscreen` `languageFlags` ile çok sayıda dil kullanır; `frame-launch-fe` şu an `Locale` union’ı ile **7 dil** (`tr | en | de | es | fr | ja | pt`). Bu spec yalnızca bu union içinde çalışır; union genişletmesi ayrı bir karar.

---

## 2. Mevcut durum (frame-launch-fe)

| Alan | Durum |
|------|--------|
| `Project.activeLocales`, `currentLocale`, `defaultLocale` | Şema + `projectsStore.addLocale` / `removeLocale` / `setCurrentLocale` |
| `Screenshot.uploads[locale]` (blobId) + `uploadMeta` | Var |
| `editorStore.activeLocale` | Var; **projedeki `currentLocale` ile senkron değil** |
| Topbar dil `<select>` | Sadece `activeLocales.length > 1` iken; `setActiveLocale` **yalnızca editor store**’u güncelliyor → `setCurrentLocale` çağrılmıyor |
| `languagesModalOpen` / `openLanguagesModal` | Store’da var, **UI yok** |
| `DuplicateUploadDialogState` + `setDuplicateUploadDialog` | Store’da var, **modal yok**, yükleme akışına **bağlı değil** |
| Dosya adı tespiti | Yok (appscreen: `language-utils.js`) |

---

## 3. appscreen → hedef eşleme

| appscreen | frame-launch-fe |
|-----------|-----------------|
| `state.projectLanguages` | `project.activeLocales` |
| `state.currentLanguage` | `project.currentLocale` + UI’da `editorStore.activeLocale` ile **tek kaynak** (aşağıda) |
| `getBaseFilename` / `detectLanguageFromFilename` | `lib/i18n/filenameLocale.ts` + vitest |
| `findScreenshotByBaseFilename` | `findScreenshotIdByUploadBaseName(project, baseName)` (uploadMeta.name veya mevcut blob meta) |
| `showDuplicateDialog` → Replace / Create / Skip | `DuplicateUploadModal` + mevcut `DuplicateUploadAction` |
| `openScreenshotTranslationsModal` | `ScreenshotTranslationsModal` + ScreenshotsSidebar veya satır menüsünden aç |
| Dil ekleme (`addProjectLanguage`) | `LanguagesModal` → `addLocale` + gerekirse `setCurrentLocale` |
| `removeLocalizedImage` | `updateScreenshot` ile `uploads[locale]` sil + `uploadMeta` temizliği |

---

## 4. Tek kaynak: “aktif düzenleme dili”

**Karar:** Kullanıcı dil değiştirdiğinde hem proje persist edilsin hem UI tutarlı olsun.

- `editorStore.activeLocale` **yansıma** olarak kalabilir veya kaldırılıp bileşenlerde doğrudan `project.currentLocale` okunur. **Öneri:** `setActiveLocale` çağrıldığında `useProjectsStore.getState().setCurrentLocale(activeProjectId, locale)` tetiklensin; proje yükleme / aktif proje değişince `EditorShell` veya `Topbar` içinde `useEffect`: `setActiveLocale(project.currentLocale)` (veya proje `currentLocale`’i tek doğruluk kabul edilip selector ile okunur).

**Minimum:** Topbar `select` `onChange` → `setCurrentLocale` + `setActiveLocale`.

---

## 5. Dosya adı yardımcıları

`lib/i18n/filenameLocale.ts`:

- `getBaseFilename(filename: string, supportedLocales: readonly Locale[]): string`  
  - Uzantıyı çıkar; desteklenen locale kodlarını **uzun olandan kısaya** sıralayıp `_xx` / `-xx` / `_pt-br` eşleşmesi (appscreen ile aynı mantık, `pt` vs `pt-br` için sıra önemli — union’da yalnızca `pt` varsa `pt-br` dosyası **eşleşmez** ve fallback `defaultLocale` veya `en` kullanılır; spec bunu kabul eder).
- `detectLocaleFromFilename(filename: string, supportedLocales: readonly Locale[], fallback: Locale): Locale`

**Testler:** `filenameLocale.test.ts` — bilinen örnekler + false positive yok.

---

## 6. Duplicate yükleme akışı

**Tetikleyici:** `DevicePanel` (ve ileride toplu import) dosya seçildiğinde:

1. `detectLocaleFromFilename` → hedef locale `L`.
2. `getBaseFilename` → `base`.
3. `findScreenshotIdByUploadBaseName(project, base)` → `matchId` (kendisi hariç veya tümü — mevcut screenshot’a aynı dosya “replace” ise ayrı kural: sadece **başka** satırda eşleşme duplicate sayılır).
4. Eşleşme yoksa: mevcut mantık (`saveBlob` + `uploads[L]`).
5. Eşleşme varsa: `setDuplicateUploadDialog({ open, baseFilename, matchedScreenshotId, locale: L, resolve })` ve `await new Promise` ile kullanıcı seçimi bekle:
   - **replace:** eşleşen screenshot’ta `uploads[L]` güncelle (ve gerekirse aktif ekranı o satıra geçir — appscreen davranışına göre).
   - **create:** yeni `makeBlankScreenshot` veya mevcut “yeni ekran” ile aynı isimlendirme kuralı + `uploads[L]`.
   - **ignore:** no-op.

**UI:** Radix `Dialog` (mevcut `Dialog` bileşeni), iki küçük önizleme (varsa `getBlobUrl`), üç buton.

---

## 7. Çeviriler modal’ı (screenshot başına)

- Girdi: `projectId`, `screenshotId`.
- İçerik: `project.activeLocales` için satır — bayrak/etiket (mevcut `LOCALE_LABELS` + isteğe emoji bayrak), `uploads[lang]` varsa küçük önizleme + “Kaldır”, yoksa “Yükle”.
- Yükleme: gizli `<input type="file" accept="image/*">` + `saveBlob` + `updateScreenshot` ile `uploads[lang]` atama; duplicate kontrolü bu akışta da çalışır (aynı base başka ekranda → dialog).
- `addLocale` ile projeye yeni dil eklendiğinde modal listesi güncellenir.

**Açma yeri:** `ScreenshotsSidebar` satırında “⋯” menü veya doğrudan “Çeviriler” ikonu (appscreen: `.screenshot-translations`).

---

## 8. Dilleri yönet modal’ı

- `openLanguagesModal` / `closeLanguagesModal` ile aç/kapa.
- Liste: `activeLocales` — her satırda “Kaldır” (guard: `length > 1`).
- “Dil ekle”: açılır liste = `ALL_LOCALES.filter(l => !activeLocales.includes(l))`; seçim → `addLocale`.
- Son dil kaldırılamaz; toast ile bilgi.
- **removeLocale** sonrası: tüm screenshot’larda `delete uploads[removed]` ve `uploadMeta[removed]` (blob silme #00’da isteğe bağlı — spec: **yalnızca referansı kaldır**, GC ayrı).

**Topbar:** `Languages` ikonuna tıkla → modal (şu an select yanında ikon var — ikonu modal tetikleyiciye bağla veya ayrı “Ayarlar” menüsü; **öneri:** mevcut `Languages` ikonunu `openLanguagesModal` yap, dil **seçimi** için küçük select ayrı kalabilir veya modal içinde de seçilebilir).

---

## 9. Kabul kriterleri

- [ ] Dil değişimi `project.currentLocale` ile persist ve yeniden yüklemede korunur.  
- [ ] `filenameLocale` testleri appscreen örnekleriyle uyumlu (desteklenen locale seti içinde).  
- [ ] Duplicate modal üç eylemi doğru uygular.  
- [ ] Çeviriler modal’ından dil başına yükle / kaldır.  
- [ ] Diller modal’ından dil ekle / çıkar; son dil korunur.  
- [ ] `tsc` + `vitest` + `next build` yeşil.

---

## 10. Sonraki adım

Onay sonrası: `docs/superpowers/plans/2026-04-23-04-multilingual-ui-plan.md`.
