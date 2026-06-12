import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

const NAV_LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/templates", label: "Templates" },
  { href: "/alternatives", label: "Alternatives" },
];

const FOOTER_LINKS = [
  { href: "/editor", label: "Editor" },
  { href: "/guides", label: "Guides" },
  { href: "/templates", label: "Templates" },
  { href: "/alternatives", label: "Alternatives" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

/**
 * Static, JS-free shell for content/SEO pages (guides, templates, legal).
 * Server component so the article HTML ships fully rendered for crawlers.
 */
export function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--color-surface-0)] text-[var(--color-ink-body)]">
      <header className="border-b border-[var(--color-surface-2)]">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" aria-label="Frame Launch home" className="min-w-0">
            <BrandLockup variant="on-surface" imageClassName="rounded-md" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hidden text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-strong)] sm:inline"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/editor"
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-1.5 font-semibold text-black transition-colors hover:bg-[var(--color-brand-primary-hover)]"
            >
              Open editor
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">{children}</main>

      <footer className="border-t border-[var(--color-surface-2)] py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-strong)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            © {new Date().getFullYear()} Frame Launch · Free in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Tailwind-only prose wrapper tuned to the brand surface tokens. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <article
      className={[
        "max-w-none",
        "[&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-[var(--color-ink-strong)] sm:[&_h1]:text-4xl",
        "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--color-ink-strong)]",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--color-ink-strong)]",
        "[&_p]:my-4 [&_p]:leading-relaxed",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
        "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-brand-primary)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--color-ink-muted)]",
        "[&_a]:font-medium [&_a]:text-[var(--color-ink-strong)] [&_a]:underline [&_a]:underline-offset-2",
      ].join(" ")}
    >
      {children}
    </article>
  );
}
