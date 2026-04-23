import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[image:var(--background-image-hero-gradient)]" />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_120%,rgba(232,198,16,0.2),transparent_55%)]" />
      <div className="container relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center gap-10 px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 px-4 py-1.5 text-xs font-medium text-[var(--color-brand-primary)]">
          <Sparkles size={14} />
          <span>Hesap yok · Watermark yok · Sınır yok · Veriniz tarayıcınızda kalır</span>
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          App Store ekran görüntülerinizi{" "}
          <span className="text-[var(--color-brand-primary)]">saniyeler içinde</span>{" "}
          oluşturun
        </h1>

        <p className="max-w-2xl text-base text-white/65 sm:text-lg md:text-xl">
          Framelaunch, App Store ve Play Store başvuruları için profesyonel ekran görüntüleri
          tasarlamanın en hızlı, en ücretsiz ve en gizlilik dostu yolu. İndirme yok, hesap
          yok, watermark yok.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-primary)] px-8 py-4 text-base font-semibold text-black shadow-[0_8px_24px_rgba(232,198,16,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-brand-primary-hover)]"
          >
            Hemen oluşturmaya başla
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10"
          >
            Özellikleri keşfet
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 text-left sm:grid-cols-4 sm:gap-12">
          {[
            { value: "14+", label: "Cihaz boyutu" },
            { value: "5+", label: "Hazır şablon" },
            { value: "%100", label: "Tarayıcıda" },
            { value: "0₺", label: "Ücretsiz" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-[var(--color-brand-primary)] sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/50">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
