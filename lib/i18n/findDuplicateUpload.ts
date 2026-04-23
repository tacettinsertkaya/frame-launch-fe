import type { Project, Screenshot, Locale } from "@/lib/types/project";
import { getBaseFilename } from "./filenameLocale";

function baseForUploadedLocale(s: Screenshot, loc: Locale): string | undefined {
  const m = s.uploadMeta?.[loc];
  if (m?.baseFilename) return m.baseFilename;
  if (m?.filename) return getBaseFilename(m.filename);
  return undefined;
}

/**
 * Projede bu base isimle (dosya adından türetilmiş) en az bir görsel yüklü olan
 * ilk screenshot id'si. Yoksa `null`.
 */
export function findScreenshotIdByUploadBaseName(
  project: Project,
  baseFilename: string,
): string | null {
  for (const s of project.screenshots) {
    const locales = new Set<Locale>([
      ...project.activeLocales,
      ...(Object.keys(s.uploads ?? {}) as Locale[]),
    ]);
    for (const loc of locales) {
      if (!s.uploads?.[loc]) continue;
      const b = baseForUploadedLocale(s, loc);
      if (b === baseFilename) return s.id;
    }
  }
  return null;
}
