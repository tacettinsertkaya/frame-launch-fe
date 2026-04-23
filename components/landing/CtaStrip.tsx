"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaStrip() {
  const reduce = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden bg-black py-24 text-white">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-50"
      />
      <motion.div
        aria-hidden
        className="aurora-blob left-[15%] top-[-10%] h-[40vw] w-[40vw] max-h-[520px] max-w-[520px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--aurora-1)_0%,transparent_60%)]" />
      </motion.div>
      <motion.div
        aria-hidden
        className="aurora-blob right-[5%] bottom-[-30%] h-[44vw] w-[44vw] max-h-[560px] max-w-[560px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.2 }}
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--aurora-2)_0%,transparent_60%)]" />
      </motion.div>

      <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-7 px-4 text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-yellow inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--color-brand-primary)]"
        >
          <Sparkles size={14} />
          <span>60 saniye • 0 ücret</span>
        </motion.div>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
        >
          İlk screenshot'ınızı{" "}
          <span className="bg-gradient-to-br from-[var(--color-brand-primary)] via-[#fff066] to-[var(--color-brand-primary)] bg-clip-text text-transparent">
            60 saniyede
          </span>{" "}
          yapın
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl text-base text-white/65 sm:text-lg"
        >
          Hesap açmadan, kart bilgisi vermeden. Doğrudan editöre geçin.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/editor"
            className="btn-shimmer animate-pulse-glow group inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)] px-9 py-4 text-base font-semibold text-black shadow-[0_12px_40px_rgba(232,198,16,0.5)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Editörü aç
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
      </div>
    </section>
  );
}
