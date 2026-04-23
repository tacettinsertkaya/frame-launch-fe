import type { AiProvider } from "@/lib/ai/providers";

export async function translateWithAnthropic(opts: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
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
      messages: [{ role: "user", content: opts.prompt }],
    }),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("AI_UNAVAILABLE");
    throw new Error(`Anthropic ${res.status}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Anthropic yanıtı boş");
  return text;
}

export async function translateWithOpenAI(opts: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_completion_tokens: 16384,
      messages: [{ role: "user", content: opts.prompt }],
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

export async function translateWithGoogle(opts: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: opts.prompt }] }],
    }),
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

export async function callLlmForText(opts: {
  provider: AiProvider;
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
  switch (opts.provider) {
    case "anthropic":
      return translateWithAnthropic(opts);
    case "openai":
      return translateWithOpenAI(opts);
    case "google":
      return translateWithGoogle(opts);
    default:
      throw new Error("Bilinmeyen sağlayıcı");
  }
}
