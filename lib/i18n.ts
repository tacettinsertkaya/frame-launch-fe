import type { Metadata } from "next";

export const SITE_URL = "https://framelaunch.store";

/**
 * Locales the site is planned to support. `tr` is the current default of the
 * landing page; the others mirror the language switcher shipped on the live
 * site. Add a locale here once translated routes exist for it.
 */
export const locales = ["tr", "en", "de", "fr", "es", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

/**
 * Per-locale routing is not enabled yet: the content pages currently ship in a
 * single language. Flip this to `true` once locale-prefixed routes (e.g.
 * `/en/guides/...`) exist, and `hreflangFor()` will emit a full alternates map.
 *
 * Emitting hreflang URLs that resolve to identical content is an SEO
 * anti-pattern (duplicate content), so we intentionally keep it off until real
 * translations are in place.
 */
export const LOCALE_ROUTING_ENABLED = false;

const ogLocaleMap: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  ja: "ja_JP",
};

/** Builds the `alternates.languages` hreflang map for a given path. */
export function hreflangFor(path: string): Record<string, string> | undefined {
  if (!LOCALE_ROUTING_ENABLED) return undefined;
  const clean = path === "/" ? "" : path;
  const map: Record<string, string> = { "x-default": `${SITE_URL}${clean}` };
  for (const locale of locales) {
    map[locale] = `${SITE_URL}/${locale}${clean}`;
  }
  return map;
}

type BuildMetaArgs = {
  /** Absolute path beginning with "/", e.g. "/guides/app-store-screenshot-sizes". */
  path: string;
  title: string;
  description: string;
  /** Open Graph type. Use "article" for guides, "website" otherwise. */
  type?: "website" | "article";
  locale?: Locale;
};

/**
 * Centralised page metadata: canonical, hreflang, Open Graph, and Twitter.
 * Keeps every content route consistent and DRY.
 */
export function buildMetadata({
  path,
  title,
  description,
  type = "website",
  locale = defaultLocale,
}: BuildMetaArgs): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangFor(path),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Framelaunch",
      locale: ogLocaleMap[locale],
      type,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
