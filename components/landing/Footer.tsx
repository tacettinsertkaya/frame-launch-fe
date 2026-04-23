import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-surface-2)] bg-[var(--color-surface-0)] py-10">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <Link href="/" className="text-lg font-bold text-black">
          Frame<span className="text-[var(--color-brand-primary)]">launch</span>
        </Link>
        <p className="text-xs text-[var(--color-ink-muted)]">
          © {new Date().getFullYear()} Framelaunch · Tarayıcıda %100 ücretsiz
        </p>
        <div className="flex items-center gap-6 text-xs text-[var(--color-ink-body)]">
          <Link
            href="/editor"
            className="hover:text-black hover:underline hover:underline-offset-4 hover:decoration-[var(--color-brand-primary)] hover:decoration-2"
          >
            Editör
          </Link>
          <Link
            href="#features"
            className="hover:text-black hover:underline hover:underline-offset-4 hover:decoration-[var(--color-brand-primary)] hover:decoration-2"
          >
            Özellikler
          </Link>
        </div>
      </div>
    </footer>
  );
}
