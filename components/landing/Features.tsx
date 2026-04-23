"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Smartphone,
    title: '14+ cihaz ve marketing boyutu',
    desc: 'iPhone 6.5"–6.9", iPad, Android telefon/tablet, OG, Twitter Card, Website Hero ve fazlası.',
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

const grid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const card: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Features() {
  const reduce = useReducedMotion();

  return (
    <section
      id="features"
      className="relative isolate overflow-hidden bg-[var(--color-surface-1)] py-28"
    >
      {/* Soft ambient color wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(232,198,16,0.08),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(232,198,16,0.06),transparent_45%)]"
      />

      <div className="container relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-[var(--color-brand-primary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black shadow-[0_4px_18px_rgba(232,198,16,0.35)]">
            Neler sunuyor
          </span>
          <h2 className="mt-4 text-balance text-[1.75rem] font-bold tracking-tight text-[var(--color-ink-strong)] sm:text-4xl md:text-5xl">
            Profesyonel screenshot için ihtiyacınız olan{" "}
            <span className="bg-gradient-to-br from-black via-[#3a3a3a] to-black bg-clip-text text-transparent">
              her şey
            </span>
          </h2>
          <p className="mt-4 text-balance text-base text-[var(--color-ink-body)]">
            Tasarımcı olmadan, kod yazmadan, hesap açmadan. Tüm araçlar bir
            tıkla erişiminizde.
          </p>
        </motion.div>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={card}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="gradient-border group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.18)]"
    >
      {/* Gradient hover wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_var(--mx,0%)_var(--my,0%),rgba(232,198,16,0.10),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <motion.div
        whileHover={reduce ? undefined : { rotate: -8, scale: 1.08 }}
        transition={{ type: "spring", stiffness: 360, damping: 16 }}
        className="relative grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-brand-primary)] to-[#fff066] text-black shadow-[0_8px_22px_rgba(232,198,16,0.35)]"
      >
        <Icon size={20} aria-hidden />
        <span
          aria-hidden
          className="absolute inset-0 rounded-[var(--radius-md)] bg-white opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-30"
        />
      </motion.div>

      <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink-strong)]">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-body)]">
        {feature.desc}
      </p>

      {/* Subtle index marker */}
      <span
        aria-hidden
        className="absolute right-5 top-5 text-[10px] font-mono font-medium tracking-wider text-[var(--color-ink-muted)]/60 transition-colors group-hover:text-[var(--color-ink-muted)]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.div>
  );
}
