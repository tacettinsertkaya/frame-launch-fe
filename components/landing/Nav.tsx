"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-3 pt-3">
        <div
          className={[
            "flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500",
            scrolled
              ? "glass-dark border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
              : "border border-transparent",
          ].join(" ")}
        >
          <Link
            href="/"
            aria-label="Framelaunch ana sayfası"
            className="group relative rounded-full text-base font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="relative z-10">
              Frame
              <span className="text-[var(--color-brand-primary)]">launch</span>
            </span>
            <motion.span
              aria-hidden
              className="absolute -inset-x-2 -inset-y-1 rounded-full bg-[var(--color-brand-primary)]/0"
              whileHover={{ backgroundColor: "rgba(232, 198, 16, 0.10)" }}
              transition={{ duration: 0.25 }}
            />
          </Link>

          <div className="flex items-center gap-1 text-sm">
            <Link
              href="#features"
              className="hidden rounded-full px-4 py-1.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-block"
            >
              Özellikler
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/editor"
                className="btn-shimmer group inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-primary)] px-4 py-2 font-semibold text-black shadow-[0_4px_20px_rgba(232,198,16,0.35)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Editörü aç
                <motion.span
                  className="inline-flex"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <ArrowRight size={14} />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
