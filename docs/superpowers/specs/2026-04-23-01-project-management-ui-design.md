# 01 — Proje Yönetimi UI (Topbar + Modal'lar + Şablon Picker)

**Tarih:** 2026-04-23
**Üst spec:** `2026-04-23-appscreen-parity-overview.md`
**Bağımlılık:** `00 — Foundation & Schema` (tamamlandı ✅)
**Karmaşıklık:** M
**Risk:** Düşük (yalnızca UI + mevcut store aksiyonları; yeni schema alanı yok)

---

## 1. Amaç

Kullanıcının **birden fazla projeyi** editör içinden yönetebilmesini sağlamak:

- Aktif projeyi seçip başka bir projeye geçiş (switch)
- Yeni proje oluşturma (boş / şablondan / mevcut projeyi çoğaltarak)
- Projeyi yeniden adlandırma
- Projeyi silme (onay modal'ı ile, son projeyi silmek engellenir)
- Var olan **şablon registry**'sini (`TEMPLATES`) kullanıcıya göstermek (kart grid'i ile seçim)

Mevcut `Topbar.tsx` sadece **tek projenin adını rename** ediyor. `projectsStore` tüm CRUD + duplicate + template aksiyonlarını zaten sağlıyor (`createProject(name, fromTemplate?)`, `duplicateProject`, `deleteProject`, `setActiveProject`). Bu alt-proje bu aksiyonların **UI kapılarını** açıyor.

**Kapsamda olmayan:**

- Çoklu dil yönetimi UI (alt-proje **04**)
- Custom output size / position preset (alt-proje **02**)
- Style transfer (alt-proje **05**)
- Export UI'ın yeniden düzenlenmesi (alt-proje **07**)
- Tema / Settings / API key'leri (alt-proje **08**)

---

## 2. appscreen → frame-launch-fe Parite Haritası

| appscreen öğesi | Konum | frame-launch-fe karşılığı (bu spec) |
|---|---|---|
| `#project-dropdown` / `#project-trigger` (isim + count) | sol sidebar üstü | Topbar içinde `<ProjectSelector />` dropdown |
| `#project-menu` (dinamik proje listesi) | dropdown içinde | `<ProjectSelectorMenu />` (popover) |
| `#new-project-btn` (+) | sidebar | Topbar'da `<Button variant="ghost" icon={<Plus/>}>` |
| `#rename-project-btn` (kalem) | sidebar | Topbar'da kalem butonu (**mevcut inline rename input'u kaldır**; modal'a alırız, daha tutarlı) |
| `#delete-project-btn` (çöp) | sidebar | Topbar'da çöp butonu |
| `#project-modal` (yeni/rename) | overlay | `<ProjectNameModal mode="new"|"rename">` |
| `#duplicate-from-select` (new mode içinde) | modal dropdown | modal'ın "Başlangıç noktası" kısmında **seçenekler**: Boş / Bu projeyi çoğalt / Şablon seç |
| `#delete-project-modal` | overlay | `<DeleteProjectModal />` |
| "Duplicate from" dropdown | project-modal içinde | Radio grupları veya kart grid (şablon listesi) |

### Appscreen'de olmayan iyileştirmeler

- **Şablon picker UI**: appscreen'de template registry **kullanılmıyor**; `frame-launch-fe`'de registry vardı ama UI yoktu. Bu spec bunu devreye alır.
- **Proje çoğaltma** appscreen'de "Duplicate from" seçeneği olarak modal'ın içinde; bizde ayrı bir buton da eklenir (proje dropdown öğesinin sağında hover'da beliren **copy** ikonu) — rahatlık için.

---

## 3. Component Mimarisi

Tüm yeni component'ler `components/editor/` altında:

```
components/editor/
├─ Topbar.tsx                     (mevcut — yeniden düzenlenir)
├─ project/
│  ├─ ProjectSelector.tsx         (dropdown trigger + açılır menü)
│  ├─ ProjectSelectorItem.tsx     (tek proje satırı: isim, meta, copy, delete hover)
│  ├─ ProjectNameModal.tsx        (yeni + rename birleşik)
│  ├─ DeleteProjectModal.tsx      (onay)
│  └─ TemplatePickerGrid.tsx      (ProjectNameModal içinde "Başlangıç: Şablon" seçilince)
└─ ui/ (mevcut shadcn/ui primitives kullanılır: Button, Dialog, Input, RadioGroup, ...)
```

**Yeni UI primitive'leri (gerekiyorsa):**
- `<Dialog>` — zaten `components/ui/dialog.tsx` mevcut mu? Değilse minimal bir Radix-less modal yapılır (mevcut landing'de hiç modal yok).

---

## 4. Kullanıcı Akışları

### 4.1 Proje değiştirme

1. Kullanıcı Topbar'daki `<ProjectSelector />` trigger'ına tıklar.
2. Popover açılır, `projects[]` listelenir (isim + `{screenshotCount} ekran` meta).
3. Aktif olan satır `aria-selected`, Check ikonu ile işaretli.
4. Başka bir satıra tıklama → `setActiveProject(id)` → popover kapanır → editör yeni projenin ilk screenshot'ına geçer.
   - `activeScreenshotId` resetlenir (editorStore `setActiveScreenshot(null)`), `EditorShell` `activeProject` değişince ilk screenshot'ı otomatik seçer (mevcut davranış).

### 4.2 Yeni proje oluşturma

1. Topbar `+` butonu → `ProjectNameModal` açılır (`mode="new"`).
2. Modal içeriği:
   - **Proje adı** input (required, default: "Yeni Proje")
   - **Başlangıç noktası** radio seçimi:
     - `[•] Boş proje`
     - `[○] Bu projeyi çoğalt (<activeProjectName>)`
     - `[○] Şablondan başla` → seçilince altında `<TemplatePickerGrid />` açılır (5 şablon kartı, tıklanarak seçilen kart vurgulanır)
3. "Oluştur" butonu:
   - `blank` → `createProject(name)`
   - `duplicate` → `duplicateProject(activeId, name)`
   - `template:<id>` → `createProject(name, fromTemplate)` (registry'den `build()` ile oluşturulur)
4. Başarıyla yaratıldıktan sonra modal kapanır, yeni proje aktif olur.

### 4.3 Rename

1. Topbar'daki kalem butonu → `ProjectNameModal` (`mode="rename"`, input = aktif proje adı).
2. Radio/template seçenekleri **gizlenir** (`mode === "new"` iken görünür).
3. "Yeniden adlandır" → `renameProject(activeId, newName)`.

**Mevcut inline rename kaldırılır**: Topbar içindeki `<input>` (satır 44–49) kaldırılır; yerine Button (proje ismi) + kalem ikon. Tek tıkta modal açılır. Daha az edge case, daha tutarlı UX.

### 4.4 Silme

1. Topbar çöp butonu tıklandığında:
   - `projects.length === 1` ise toast: "En az bir proje olmalı." (silme iptal).
   - Aksi halde `<DeleteProjectModal />` açılır, mesaj: `"<proje adı>" silinecek. Bu işlem geri alınamaz.`
2. "Sil" butonu → `deleteProject(activeId)` → store kendi içinde aktif projeyi değiştirir (`projects[0]`).

### 4.5 Listeden çoğaltma (quick action)

Proje satırına hover → sağda `Copy` ikonu → `duplicateProject(id)` → yeni proje `"<orijinal> (kopya)"` adıyla yaratılır ve aktif olur.

---

## 5. Topbar Yeniden Düzenleme

### 5.1 Mevcut layout

```
[Home] | [Proje adı (inline input)]          [Languages select?] [Dışa aktar]
```

### 5.2 Yeni layout

```
[Home] | [ProjectSelector ▾] [+][✎][🗑]      [Languages select] [Dışa aktar]
           ↑
    trigger "İlk Proje · 3 ekran"
```

- Proje adı + screenshot sayısı `ProjectSelector` trigger'ında.
- `[+]`, `[✎]`, `[🗑]` her biri `Button variant="ghost" size="sm"` 28×28 ikon buton, aralarında 4px gap.
- Tümü `project !== null` kontrolüne tabi (hydrate edilmemişken görünmez, mevcut pattern korunur).
- Dışa aktar + Dil seçici sağda kalır (değişiklik yok).

### 5.3 Responsive

- `< sm`: dropdown trigger'ının meta alt satırı (`3 ekran`) gizlenir, sadece isim kalır.
- İkon butonları her zaman görünür; label'lar (tooltip) Title attribute ile verilir.

---

## 6. Modal Altyapısı

Projede şu an hiç modal yok. İki seçenek:

**(A) Radix `@radix-ui/react-dialog` ekle** (önerilen, shadcn/ui zaten Radix primitive'lerini kullanıyor, Tailwind v4 ile uyumlu).
**(B) Kendi minimal `<Modal>`'ımızı yaz** (portal + backdrop + focus trap).

**Karar:** (A). Ek dep ~8 KB gzip. shadcn/ui `dialog.tsx` snippet'ini projeye ekleriz (mevcut `components/ui/` klasörüne). Bu ilerideki tüm modal'lar için de altyapı olur (Settings, About, Translations, Apply Style vb. — alt-proje **04**, **05**, **08** bu modal'ı kullanacak).

### 6.1 `Dialog` primitive'i

`components/ui/dialog.tsx` — Radix wrapper:

```tsx
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = (...) // portal + backdrop + animated
export const DialogTitle / Description / Footer
```

`package.json`'a: `@radix-ui/react-dialog`.

### 6.2 `ProjectNameModal`

Props:

```ts
interface Props {
  mode: "new" | "rename";
  open: boolean;
  onOpenChange: (o: boolean) => void;
}
```

State (component-local):
- `name: string`
- `startFrom: "blank" | "duplicate" | `template:${string}``
- `selectedTemplateId?: string`

Store:
- `activeProject` (current name, id için)
- `projects` (duplicate seçeneğinde label için)
- aksiyonlar: `createProject`, `duplicateProject`, `renameProject`

Validasyonlar:
- `name.trim().length > 0`
- Enter tuşu "Oluştur/Yeniden adlandır" tetikler
- Escape kapatır

### 6.3 `DeleteProjectModal`

Props: `{ open, onOpenChange }`. Store'dan `activeProject.name` ve `deleteProject(activeId)` aksiyonu okur.

---

## 7. Şablon Picker

### 7.1 UI

`ProjectNameModal` içinde `startFrom === "template"` seçilince `<TemplatePickerGrid />` alanı görünür:

```
┌──────────────────┬──────────────────┐
│ [thumb gradient] │ [thumb gradient] │
│ SaaS Dashboard   │ E-commerce Bold  │
│ SaaS · 2 ekran   │ E-commerce · 1   │
└──────────────────┴──────────────────┘
┌──────────────────┬──────────────────┐
│ [thumb gradient] │ [thumb gradient] │
│ Fitness & Yoga   │ AI Tool Future   │
│ Fitness · 1      │ AI · 1 ekran     │
└──────────────────┴──────────────────┘
┌──────────────────┐
│ [thumb gradient] │
│ Marketing OG     │
│ Marketing · 1    │
└──────────────────┘
```

- Grid `grid-cols-2`, gap 8, modal'ın içinde max-height + scroll.
- Kart: thumbnail — **mini canvas preview** (`<Canvas screenshot={template.screenshots[0]} locale="tr" scale={140/1320} />`, pointer-events-none, aspect-[1320/2868] ama `max-h-[180px]` ile kırpılır) + isim + `{category} · {screenshotCount} ekran`.
- Canvas render maliyeti düşük (aynı component sidebar thumbnail'da da kullanılıyor).
- Seçili kart: 2px `var(--color-brand-primary)` border + subtle shadow.
- Kartı tıklamak `setSelectedTemplateId(id)` set eder; "Oluştur" butonu aktif olur (şablon seçilmeden "Oluştur" disabled).

### 7.2 Template build → Project

`createProject(name, fromTemplate)` imzası:

```ts
createProject: (name?: string, fromTemplate?: Project) => Project;
```

Halihazırda `cloneTemplateProject(template, name)` çağrısı `projectsStore.ts`'de var. `TEMPLATES[x].build()` bir `Project` üretiyor; onu `createProject(name, built)` olarak iletmek yeterli.

**Dikkat:** `TEMPLATES[x].build()` her çağrıda yeni ID'ler üretir; bu proje oluştururken bir kez çağrılır, sonra `cloneTemplateProject` bir daha id atar. Çift ID çakışması riski yok (her ikisi `uid()`).

---

## 8. Store Değişiklikleri

**Eklenecek yeni store alanı:** Yok. Mevcut `projectsStore` aksiyonları yeterli.

**Eklenecek yeni editorStore alanı:** Yok; modal'ların open state'i component-local kalır (parent Topbar'da `useState`). Bu basit ve izole, global state'e gerek yok.

**İstisna:** eğer ileride klavye kısayolu "`⌘N` → yeni proje" eklenirse global state gerekebilir; şimdilik skip.

---

## 9. Edge Case'ler

| Durum | Davranış |
|---|---|
| Son projeyi silme | çöp buton tıklandığında `projects.length <= 1` → toast "En az bir proje olmalı" + modal açılmaz |
| Boş isimle oluştur | Submit butonu disabled + input kenarı kırmızı |
| Aynı isimle iki proje | izin verilir (ID'ler farklı, appscreen de izin veriyor) |
| Template build hatası (catch edilmez) | try/catch yok — build'ler deterministik; hata olursa console |
| Rename sırasında proje değiştirilirse | modal `activeProject`'e bağlı, değişince input default'u eski kalır → modal her açılışta `setName(activeProject.name)` (useEffect `[open, activeProject?.id]`) |
| Hydrate edilmemiş | Topbar `project === null` ise selector + butonlar render edilmez (mevcut pattern) |

---

## 10. Test Stratejisi

### 10.1 Birim testler (vitest + jsdom)

`components/editor/project/` altındaki pure helper'lar için:
- `buildProjectFromMode(mode, name, activeProject?, template?)` yardımcı fonksiyonu yazılacak (`projectNameModal.helpers.ts`), bu fonksiyon testlenir:
  - `mode="blank"` → `createProject(name)` çağrılır
  - `mode="duplicate"` → `duplicateProject(id, name)` çağrılır
  - `mode="template"` → `createProject(name, template)` çağrılır
- ProjectsStore entegrasyonu: mevcut testlerle kapsandı (Task 14).

### 10.2 Component testleri (opsiyonel, bu spec'te yazılmıyor)

React Testing Library ile `<Topbar/>` + Modal interaksiyonları — ayrı bir alt-projeye bırakılabilir.

### 10.3 Manuel kontrol checklist

- [ ] Yeni proje (boş, duplicate, her template için) oluşturma + aktiflenir
- [ ] Rename → input güncellenir, selector trigger'da isim güncellenir, storage güncellenir
- [ ] Silme → onay modal'ı açılır, onay → proje listeden düşer, aktif = ilk proje
- [ ] Son projeyi silmeye çalış → toast + modal açılmaz
- [ ] Dropdown'dan quick duplicate (hover copy ikon)
- [ ] Sayfa yenile → seçili proje ve adı korunur
- [ ] localStorage v2 key'i doğru (migrasyon bozulmamış)

---

## 11. Gerekli Paketler

- `@radix-ui/react-dialog` — modal primitive'i
- (opsiyonel) `sonner` — toast'lar için. Ancak **zaten** `lucide-react` + basit `alert()` mevcut; ileride Settings/Magical Titles'da da toast lazım olacağı için şimdi eklemek mantıklı. `sonner` Tailwind v4 uyumlu.
  - **Karar:** bu spec'te `sonner` eklenir, global `<Toaster />` `app/layout.tsx`'e konur.

```bash
pnpm add @radix-ui/react-dialog sonner
```

---

## 12. Dosya Değişiklik Özeti

| Dosya | Değişiklik |
|---|---|
| `components/ui/dialog.tsx` | **YENİ** — Radix wrapper |
| `app/layout.tsx` | `<Toaster />` eklenir |
| `components/editor/Topbar.tsx` | inline rename kaldırılır, `<ProjectSelector/>` + 3 ikon buton + 2 modal state eklenir |
| `components/editor/project/ProjectSelector.tsx` | **YENİ** |
| `components/editor/project/ProjectSelectorItem.tsx` | **YENİ** |
| `components/editor/project/ProjectNameModal.tsx` | **YENİ** |
| `components/editor/project/ProjectNameModal.helpers.ts` | **YENİ** (testable logic) |
| `components/editor/project/ProjectNameModal.helpers.test.ts` | **YENİ** |
| `components/editor/project/TemplatePickerGrid.tsx` | **YENİ** |
| `components/editor/project/DeleteProjectModal.tsx` | **YENİ** |
| `package.json` | yeni dep'ler |

Toplam: ~10 yeni dosya, 2 güncellenmiş, 0 silinmiş.

---

## 13. Kabul Kriterleri

1. Topbar mevcut inline rename input'unu `<ProjectSelector />` + 3 ikon buton ile değiştirir.
2. Seçiciden başka projeye geçiş çalışır, proje değişince editör state'i doğru güncellenir.
3. Yeni proje modal'ı 3 başlangıç seçeneği ile çalışır (boş/duplicate/şablon).
4. Şablon seçildiğinde 5 mevcut şablon kart olarak görünür, tıklama vurgulu seçim verir.
5. Rename modal'ı aktif proje adını default'la açılır, kaydedince Topbar ve listedeki isim güncellenir.
6. Silme onay modal'ı ile çalışır; son projeyi silmek engellenir.
7. Hover'da quick duplicate ikonu çalışır.
8. Tüm aksiyonlar `localStorage` persistance ile uyumlu (yenileme sonrası korunur).
9. `pnpm test` tüm yeni helper test'leri dahil yeşil.
10. `pnpm build` + `tsc --noEmit` hatasız.

---

## 14. Kararlar (onay sonrası)

1. **Modal primitive**: `@radix-ui/react-dialog` eklenir.
2. **sonner toast**: bu spec'te eklenir, `app/layout.tsx`'e global `<Toaster />` konur.
3. **Template thumbnail**: mini canvas preview (aynı `<Canvas />` component'i scale ile), CSS gradient değil.
4. **`⌘N` kısayolu** bu spec'e dahil değil, alt-proje **15** (polish) içinde.

---

## 15. Sıradaki Adım

Bu spec onaylandığında: `docs/superpowers/plans/2026-04-23-01-project-management-ui-plan.md` yazılır (TDD workflow, ~12–16 adım).
