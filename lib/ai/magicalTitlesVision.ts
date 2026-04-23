import type { AiProvider } from "@/lib/ai/providers";

export type VisionImagePart = { mimeType: string; base64: string };

export function parseMagicalTitlesResponse(raw: string): Record<string, { headline?: string; subheadline?: string }> {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const jsonStr = match ? match[0] : cleaned;
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
  const out: Record<string, { headline?: string; subheadline?: string }> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v as Record<string, unknown>;
      out[k] = {
        headline: typeof o.headline === "string" ? o.headline : undefined,
        subheadline: typeof o.subheadline === "string" ? o.subheadline : undefined,
      };
    }
  }
  return out;
}

export async function generateMagicalTitlesAnthropic(opts: {
  apiKey: string;
  model: string;
  images: VisionImagePart[];
  prompt: string;
}): Promise<string> {
  const content: unknown[] = [];
  for (const img of opts.images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mimeType,
        data: img.base64,
      },
    });
  }
  content.push({ type: "text", text: opts.prompt });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new Error("AI_UNAVAILABLE");
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error?: { message?: string } }).error?.message ?? res.status)
        : `Anthropic ${res.status}`,
    );
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Anthropic yanıtı boş");
  return text;
}

export async function generateMagicalTitlesOpenAI(opts: {
  apiKey: string;
  model: string;
  images: VisionImagePart[];
  prompt: string;
}): Promise<string> {
  const content: unknown[] = [];
  for (const img of opts.images) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    });
  }
  content.push({ type: "text", text: opts.prompt });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_completion_tokens: 4096,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new Error("AI_UNAVAILABLE");
    const msg =
      typeof errBody === "object" &&
      errBody &&
      "error" in errBody &&
      typeof (errBody as { error?: { message?: string } }).error?.message === "string"
        ? (errBody as { error: { message: string } }).error.message
        : res.statusText;
    throw new Error(`OpenAI ${res.status}: ${msg}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI yanıtı boş");
  return text;
}

export async function generateMagicalTitlesGoogle(opts: {
  apiKey: string;
  model: string;
  images: VisionImagePart[];
  prompt: string;
}): Promise<string> {
  const parts: unknown[] = [];
  for (const img of opts.images) {
    parts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    });
  }
  parts.push({ text: opts.prompt });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403 || res.status === 400) throw new Error("AI_UNAVAILABLE");
    throw new Error(`Google ${res.status}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini yanıtı boş");
  return text;
}

export async function generateMagicalTitlesVision(opts: {
  provider: AiProvider;
  apiKey: string;
  model: string;
  images: VisionImagePart[];
  prompt: string;
}): Promise<string> {
  switch (opts.provider) {
    case "anthropic":
      return generateMagicalTitlesAnthropic(opts);
    case "openai":
      return generateMagicalTitlesOpenAI(opts);
    case "google":
      return generateMagicalTitlesGoogle(opts);
    default:
      throw new Error("Bilinmeyen sağlayıcı");
  }
}
