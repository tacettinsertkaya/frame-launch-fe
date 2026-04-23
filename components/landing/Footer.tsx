"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-[var(--color-surface-2)] bg-[var(--color-surface-0)] py-12"
    >
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left">
        <Link
          href="/"
          aria-label="Framelaunch ana sayfası"
          className="group rounded-md text-lg font-bold text-black transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
        >
          Frame
          <span className="bg-gradient-to-r from-[var(--color-brand-primary)] to-[#fff066] bg-clip-text text-transparent transition-all group-hover:tracking-wide">
            launch
          </span>
        </Link>
        <p className="text-xs text-[var(--color-ink-muted)]">
          © {new Date().getFullYear()} Framelaunch · Tarayıcıda %100 ücretsiz
        </p>
        <div className="flex items-center gap-6 text-xs text-[var(--color-ink-body)]">
          <FooterLink href="/editor">Editör</FooterLink>
          <FooterLink href="#features">Özellikler</FooterLink>
        </div>
      </div>
    </motion.footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
    >
      <span className="text-[var(--color-ink-body)] transition-colors group-hover:text-black">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-[var(--color-brand-primary)] transition-transform duration-300 group-hover:scale-x-100"
      />
    </Link>
  );
}
