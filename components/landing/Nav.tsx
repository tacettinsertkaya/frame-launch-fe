import Link from "next/link";

export function Nav() {
  return (
    <nav className="absolute left-0 right-0 top-0 z-20">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-bold text-white">
          Frame<span className="text-[var(--color-brand-primary)]">launch</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <Link href="#features" className="hidden hover:text-white sm:inline">
            Özellikler
          </Link>
          <Link
            href="/editor"
            className="rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] px-4 py-2 font-semibold text-black transition-colors hover:bg-[var(--color-brand-primary-hover)]"
          >
            Editörü aç
          </Link>
        </div>
      </div>
    </nav>
  );
}
