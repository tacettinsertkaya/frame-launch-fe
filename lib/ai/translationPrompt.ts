import type { Locale } from "@/lib/types/project";
import { LOCALE_LABELS } from "@/lib/i18n/localeLabels";

export function buildMarketingTranslationPrompt(opts: {
  sourceLang: Locale;
  targetLangs: Locale[];
  sourceText: string;
}): string {
  const srcName = LOCALE_LABELS[opts.sourceLang] ?? opts.sourceLang;
  const targetNames = opts.targetLangs
    .map((l) => `${LOCALE_LABELS[l] ?? l} (${l})`)
    .join(", ");

  return `You are a professional translator for App Store screenshot marketing copy. Translate the following text from ${srcName} to these languages: ${targetNames}.

The text is a short marketing headline/tagline for an app that must fit on a screenshot, so keep translations:
- SIMILAR LENGTH to the original - do NOT make it longer, as it must fit on screen
- Concise and punchy
- Marketing-focused and compelling
- Culturally appropriate for each target market
- Natural-sounding in each language

IMPORTANT: The translated text will be displayed on app screenshots with limited space. If the source text is short, the translation MUST also be short. Prioritize brevity over literal accuracy.

Source text (${srcName}):
"${opts.sourceText}"

Respond ONLY with a valid JSON object mapping language codes to translations. Do not include any other text.
Example format:
{"de": "German translation", "fr": "French translation"}

Translate to these language codes: ${opts.targetLangs.join(", ")}`;
}
