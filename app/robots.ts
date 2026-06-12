import type { MetadataRoute } from "next";

const SITE_URL = "https://framelaunch.store";

/**
 * Generates a static /robots.txt at build time (works with `output: "export"`).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
