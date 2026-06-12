import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { SITE_URL } from "@/lib/i18n";

/**
 * Generates a static /sitemap.xml at build time (works with `output: "export"`).
 * New content routes are picked up automatically from the guides data.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/editor", priority: 0.9, changeFrequency: "monthly" },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
    { path: "/templates", priority: 0.7, changeFrequency: "monthly" },
    { path: "/alternatives", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.3, changeFrequency: "yearly" },
  ];

  const guideRoutes = guides.map((g) => ({
    path: `/guides/${g.slug}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  return [...staticRoutes, ...guideRoutes].map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
