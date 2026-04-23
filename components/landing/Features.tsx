import {
  Smartphone,
  Palette,
  Type,
  Globe,
  Layers,
  Download,
  Lock,
  Zap,
  LayoutTemplate,
} from "lucide-react";

const FEATURES = [
  {
    icon: Smartphone,
    title: "14+ cihaz ve marketing boyutu",
    desc: "iPhone 6.5\"–6.9\", iPad, Android telefon/tablet, OG, Twitter Card, Website Hero ve fazlası.",
  },
  {
    icon: Palette,
    title: "Profesyonel arka planlar",
    desc: "Gradient, düz renk veya kendi görseliniz. Blur, overlay, noise efektleriyle ince ayar.",
  },
  {
    icon: Type,
    title: "Çok dilli metinler",
    desc: "Headline + subheadline. Her dil için farklı metin (TR, EN, DE, ES, FR, JA, PT).",
  },
  {
    icon: Layers,
    title: "Ön plan elementleri",
    desc: "İkon, emoji, metin rozeti ve grafik ekleyin. Pop-out kırpma ile dikkat çekici detaylar.",
  },
  {
    icon: LayoutTemplate,
    title: "Hazır şablon kütüphanesi",
    desc: "SaaS, e-ticaret, fitness, AI ve marketing için saniyeler içinde başlayın.",
  },
  {
    icon: Download,
    title: "Tek tık veya toplu PNG export",
    desc: "Tek bir görsel veya tüm projeyi ZIP olarak indirin. Marketler için doğru çözünürlük.",
  },
  {
    icon: Globe,
    title: "Tarayıcıda %100 çalışır",
    desc: "Yüklediğiniz hiçbir görsel sunucuya gitmez. Tüm işleme cihazınızda olur.",
  },
  {
    icon: Lock,
    title: "Hesap yok, watermark yok",
    desc: "Ne kayıt, ne ücret, ne de filigran. Tamamen ücretsiz, sınırsız kullanım.",
  },
  {
    icon: Zap,
    title: "Anında önizleme",
    desc: "60 fps canvas, pixel-perfect render. Yaptığınız değişikliği anında görün.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-[var(--color-surface-1)] py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[var(--color-brand-primary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
            Neler sunuyor
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-ink-strong)] sm:text-4xl md:text-5xl">
            Profesyonel screenshot için ihtiyacınız olan her şey
          </h2>
          <p className="mt-4 text-base text-[var(--color-ink-body)]">
            Tasarımcı olmadan, kod yazmadan, hesap açmadan. Tüm araçlar bir tıkla erişiminizde.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-[var(--radius-xl)] border border-[var(--color-surface-2)] bg-white p-6 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:border-[var(--color-brand-primary)] hover:shadow-[var(--shadow-lg)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] text-black">
                <f.icon size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink-strong)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-body)]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
