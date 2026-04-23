"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const STATS: Array<{ value: number; suffix: string; label: string }> = [
  { value: 14, suffix: "+", label: "Cihaz boyutu" },
  { value: 5, suffix: "+", label: "Hazır şablon" },
  { value: 100, suffix: "%", label: "Tarayıcıda" },
  { value: 0, suffix: "₺", label: "Ücretsiz" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yBlob1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-black text-white"
    >
      {/* Aurora / mesh blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          style={reduce ? undefined : { y: yBlob1 }}
          className="aurora-blob animate-drift-1 left-[-10%] top-[-15%] h-[55vw] w-[55vw] max-h-[700px] max-w-[700px]"
          aria-hidden
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--aurora-1)_0%,transparent_60%)]" />
        </motion.div>
        <motion.div
          style={reduce ? undefined : { y: yBlob2 }}
          className="aurora-blob animate-drift-2 right-[-15%] top-[20%] h-[60vw] w-[60vw] max-h-[760px] max-w-[760px]"
          aria-hidden
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--aurora-2)_0%,transparent_60%)]" />
        </motion.div>
        <div
          className="aurora-blob animate-drift-3 left-[35%] bottom-[-25%] h-[50vw] w-[50vw] max-h-[640px] max-w-[640px]"
          aria-hidden
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--aurora-3)_0%,transparent_60%)]" />
        </div>
      </div>

      {/* Subtle background grid overlay */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      />

      {/* Faint top gradient bleed */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />

      <motion.div
        style={reduce ? undefined : { y: yContent, opacity: opacityContent }}
        className="container relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center justify-center gap-10 px-4 py-24 text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={item}
          whileHover={{ scale: 1.03 }}
          className="glass-yellow inline-flex max-w-full items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium leading-snug text-[var(--color-brand-primary)] shadow-[0_0_30px_rgba(232,198,16,0.18)] sm:text-xs"
        >
          <motion.span
            aria-hidden
            animate={
              reduce
                ? undefined
                : { rotate: [0, 14, -8, 0], scale: [1, 1.15, 1] }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex shrink-0"
          >
            <Sparkles size={14} />
          </motion.span>
          <span className="text-balance">
            Hesap yok · Watermark yok · Sınır yok · Veriniz tarayıcınızda kalır
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-4xl text-balance text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          App Store ekran görüntülerinizi{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-br from-[var(--color-brand-primary)] via-[#fff066] to-[var(--color-brand-primary)] bg-clip-text text-transparent">
              saniyeler içinde
            </span>
            <motion.span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-[var(--color-brand-primary)]/20 blur-md"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "left center" }}
            />
          </span>{" "}
          oluşturun
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-2xl text-base text-white/65 sm:text-lg md:text-xl"
        >
          Framelaunch, App Store ve Play Store başvuruları için profesyonel
          ekran görüntüleri tasarlamanın en hızlı, en ücretsiz ve en gizlilik
          dostu yolu. İndirme yok, hesap yok, watermark yok.
        </motion.p>

        <motion.div
          variants={item}
          className="flex w-full max-w-md flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <Link
              href="/editor"
              className="btn-shimmer animate-pulse-glow group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-primary)] px-8 py-4 text-base font-semibold text-black shadow-[0_10px_36px_rgba(232,198,16,0.45)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              Hemen oluşturmaya başla
              <motion.span
                aria-hidden
                className="inline-flex"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#features"
              className="glass-dark inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              Özellikleri keşfet
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-2 gap-6 pt-8 text-left sm:grid-cols-4 sm:gap-12"
        >
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} delay={0.6 + i * 0.12} />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--color-surface-1)]"
        aria-hidden
      />
    </section>
  );
}

interface StatProps {
  stat: { value: number; suffix: string; label: string };
  delay: number;
}

function StatCard({ stat, delay }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? stat.value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(Math.round(stat.value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-2xl font-bold text-[var(--color-brand-primary)] sm:text-3xl">
        {stat.value === 0 ? "0" : val}
        {stat.suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-white/50">
        {stat.label}
      </div>
    </motion.div>
  );
}
