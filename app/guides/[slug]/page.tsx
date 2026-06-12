import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { guides, guideMap } from "@/lib/guides";
import { buildMetadata, SITE_URL } from "@/lib/i18n";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) return {};
  return buildMetadata({
    path: `/guides/${guide.slug}`,
    title: `${guide.title} — Frame Launch`,
    description: guide.description,
    type: "article",
    locale: "en",
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) notFound();

  const others = guides.filter((g) => g.slug !== guide.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    inLanguage: "en",
    image: `${SITE_URL}/og-image.png`,
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Frame Launch",
      url: SITE_URL,
    },
  };

  return (
    <ContentLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        {guide.eyebrow}
      </p>
      <Prose>
        <h1>{guide.heading}.</h1>
        {guide.body}
      </Prose>

      <nav aria-label="More guides" className="mt-12 border-t border-[var(--color-surface-2)] pt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          More guides
        </h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {others.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="text-[var(--color-ink-strong)] underline underline-offset-2"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </ContentLayout>
  );
}
