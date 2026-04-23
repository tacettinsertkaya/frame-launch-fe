/** Strips optional markdown fences and parses the outermost `{...}` as JSON. */
export function parseTranslationJsonResponse(raw: string): Record<string, string> {
  const cleaned = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Yanıtta JSON nesnesi bulunamadı");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Geçersiz çeviri JSON'u");
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
