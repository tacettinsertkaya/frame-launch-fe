import Link from "next/link";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { guides } from "@/lib/guides";
import { buildMetadata } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  path: "/guides",
  title: "Launch guides for app store screenshots — Frame Launch",
  description:
    "Practical guides on App Store and Google Play screenshot sizes, localization, design layouts, and export workflow.",
  locale: "en",
});

export default function GuidesIndexPage() {
  return (
    <ContentLayout>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        Launch guides
      </p>
      <Prose>
        <h1>Learn the screenshot rules before you export.</h1>
        <p>
          Useful, original launch content for founders, marketers, and indie app teams. Each guide is
          a short, practical read you can apply directly in the editor.
        </p>
      </Prose>

      <ul className="mt-8 grid gap-4">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="block rounded-xl border border-[var(--color-surface-2)] p-5 transition-colors hover:border-[var(--color-brand-primary)]"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                {g.eyebrow}
              </span>
              <h2 className="mt-1 text-lg font-semibold text-[var(--color-ink-strong)]">
                {g.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{g.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </ContentLayout>
  );
}
