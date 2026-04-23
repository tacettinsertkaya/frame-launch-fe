import type { Locale } from "@/lib/types/project";

/** Tüm desteklenen dil kodları (en uzun eşleşme önce) */
export const ALL_LOCALES: readonly Locale[] = [
  "tr",
  "en",
  "de",
  "es",
  "fr",
  "ja",
  "pt",
] as const;

function sortedByCodeLengthDesc(locales: readonly string[]): string[] {
  return [...locales].sort((a, b) => b.length - a.length);
}

/**
 * Dosya adından dil sonekini çıkarıp "base" isim döndürür (appscreen `getBaseFilename`).
 */
export function getBaseFilename(
  filename: string,
  supportedLocales: readonly Locale[] = ALL_LOCALES,
): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const sorted = sortedByCodeLengthDesc(supportedLocales);
  for (const lang of sorted) {
    const escapedLang = lang.replace("-", "[-_]?");
    const pattern = new RegExp(`[_-]${escapedLang}(?:[_-][a-z]{2})?$`, "i");
    if (pattern.test(withoutExt)) {
      return withoutExt.replace(pattern, "");
    }
  }
  return withoutExt;
}

/**
 * Dosya adından dil kodu (appscreen `detectLanguageFromFilename`).
 * Eşleşme yoksa `fallback` döner.
 */
export function detectLocaleFromFilename(
  filename: string,
  supportedLocales: readonly Locale[] = ALL_LOCALES,
  fallback: Locale = "tr",
): Locale {
  const lower = filename.toLowerCase();
  const sorted = sortedByCodeLengthDesc(supportedLocales);
  for (const lang of sorted) {
    const escapedLang = lang.replace("-", "[-_]?");
    const pattern = new RegExp(
      `[_-]${escapedLang}(?:[_-][a-z]{2})?\\.`,
      "i",
    );
    if (pattern.test(lower)) {
      return lang as Locale;
    }
  }
  return fallback;
}
