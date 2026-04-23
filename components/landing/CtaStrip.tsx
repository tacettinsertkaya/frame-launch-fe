import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaStrip() {
  return (
    <section className="relative overflow-hidden bg-black py-20 text-white">
      <div className="absolute inset-0 [background:radial-gradient(circle_at_30%_50%,rgba(232,198,16,0.18),transparent_55%)]" />
      <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center">
        <h2 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          İlk screenshot'ınızı{" "}
          <span className="text-[var(--color-brand-primary)]">60 saniyede</span> yapın
        </h2>
        <p className="max-w-xl text-base text-white/65 sm:text-lg">
          Hesap açmadan, kart bilgisi vermeden. Doğrudan editöre geçin.
        </p>
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-primary)] px-8 py-4 text-base font-semibold text-black shadow-[0_8px_24px_rgba(232,198,16,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-brand-primary-hover)]"
        >
          Editörü aç
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
