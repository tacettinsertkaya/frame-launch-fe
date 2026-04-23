# Framelaunch

> App Store ve Play Store ekran görüntüleri için **%100 ücretsiz, tarayıcı tabanlı**
> screenshot generator. Hesap yok, watermark yok, sınır yok.

[framelaunch.store](https://framelaunch.store) için frontend.

## Özellikler

- **14+ cihaz / marketing boyutu** — iPhone 6.5"–6.9", iPad, Android phone/tablet,
  OG, Twitter Card, Website Hero, Feature Graphic, Custom.
- **3 arka plan tipi** — gradient (hazır preset'ler), düz renk, görsel (cover/contain/stretch + blur).
  Overlay rengi/opaklık ve noise efekti.
- **Cihaz çerçevesi** — 2D iPhone şu an, 3D mode roadmap'te (Phase 4). Ölçek, konum,
  yatay/dikey, döndürme, gölge, kenarlık.
- **Çok dilli metin** — headline + subheadline, dil başına farklı içerik (TR, EN, DE,
  ES, FR, JA, PT). Font, ağırlık, boyut, hizalama, satır yüksekliği, opaklık.
- **PNG export** — aktif ekran veya tüm proje, marketler için doğru pixel-perfect çözünürlük.
- **Lokal persistence** — projeler localStorage'da (LZ-String sıkıştırma), uploads
  IndexedDB'de. Hiçbir veri sunucuya gitmez.
- **5 hazır şablon** — SaaS Dashboard, E-commerce, Fitness, AI Tool, Marketing OG.


## Teknoloji

- [Next.js 15](https://nextjs.org/) (App Router, React 19) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (`@theme` token sistemi)
- [Zustand](https://zustand-demo.pmnd.rs/) — editör state yönetimi
- [html-to-image](https://github.com/bubkoo/html-to-image) — PNG export
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) — IndexedDB blob store
- [lucide-react](https://lucide.dev/) — ikon kitaplığı

`output: "export"` ile **statik build**: Vercel, Cloudflare Pages, Netlify ya da
herhangi bir CDN'de host edilebilir. Sunucu, veritabanı, API gerekmez.

## Geliştirme

Gereksinimler: Node.js ≥ 20 ve `pnpm` (≥ 9).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm build        # statik export → out/
```

`pnpm build` sonrası `out/` klasörü dağıtıma hazırdır.

## Klasör Yapısı

```
app/
  layout.tsx
  page.tsx                  # landing (hero + features + cta + footer)
  editor/page.tsx           # editör (3-pane shell)
  globals.css
components/
  landing/                  # Nav, Hero, Features, CtaStrip, Footer
  editor/                   # EditorShell, Topbar, ScreenshotsSidebar,
                            # CanvasStage, RightPanel, Canvas, ExportModal
    canvas/                 # BackgroundLayer, DeviceLayer, TextLayer
    panels/                 # BackgroundPanel, DevicePanel, TextPanel
  ui/                       # Button, Slider, Dialog, Segment, ColorInput, TextInput
lib/
  types/project.ts          # Project / Screenshot / Background / Device / Text
  devices/registry.ts       # 14 cihaz/marketing boyutu
  persistence/
    localProjects.ts        # LZ-String sıkıştırmalı localStorage
    blobStore.ts            # IndexedDB (idb-keyval)
  export/render.ts          # html-to-image PNG export
  templates/registry.ts     # 5 hazır şablon
  utils.ts                  # cn(), uid(), nowIso()
store/
  projectsStore.ts          # projeler + aktif proje (Zustand)
  editorStore.ts            # editör UI state
docs/specs/
  framelaunch-build-prompt.md   # tam ürün/teknik spec
```

## Yol Haritası

- [x] **Phase 1 — Walking Skeleton** _(burası)_
      Landing, editör shell, 2D iPhone, gradient/solid/image arka plan, text overlay,
      PNG export, 5 şablon, statik build.
- [ ] Phase 2 — Element kütüphanesi (icon/emoji/text/graphic), pop-out, tüm cihazlar
- [ ] Phase 3 — i18n (TR/EN), template galerisi UI, çoklu proje yönetimi
- [ ] Phase 4 — 3D cihaz çerçeveleri, JSON proje export/import, klavye kısayolları, A11y son düzlük

Detaylı spec için: [`docs/specs/framelaunch-build-prompt.md`](docs/specs/framelaunch-build-prompt.md).

## Lisans

MIT.
