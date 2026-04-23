export type AiProvider = "anthropic" | "openai" | "google";

export interface AiModel {
  id: string;
  name: string;
}

export interface AiProviderConfig {
  name: string;
  keyPrefix: string;
  storageKey: string;
  modelStorageKey: string;
  models: AiModel[];
  defaultModel: string;
}

export const AI_PROVIDERS: Record<AiProvider, AiProviderConfig> = {
  anthropic: {
    name: "Anthropic (Claude)",
    keyPrefix: "sk-ant-",
    storageKey: "claudeApiKey",
    modelStorageKey: "anthropicModel",
    models: [
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 ($)" },
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5 ($$)" },
      { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5 ($$$)" },
    ],
    defaultModel: "claude-sonnet-4-5-20250929",
  },
  openai: {
    name: "OpenAI (GPT)",
    keyPrefix: "sk-",
    storageKey: "openaiApiKey",
    modelStorageKey: "openaiModel",
    models: [
      { id: "gpt-5.1-2025-11-13", name: "GPT-5.1 ($$$)" },
      { id: "gpt-5-mini-2025-08-07", name: "GPT-5 Mini ($$)" },
      { id: "gpt-5-nano-2025-08-07", name: "GPT-5 Nano ($)" },
    ],
    defaultModel: "gpt-5-mini-2025-08-07",
  },
  google: {
    name: "Google (Gemini)",
    keyPrefix: "AIza",
    storageKey: "googleApiKey",
    modelStorageKey: "googleModel",
    models: [
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview) ($$)" },
      { id: "gemini-3-pro-preview", name: "Gemini 3 Pro (Preview) ($$$)" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite ($)" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash ($$)" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro ($$$)" },
    ],
    defaultModel: "gemini-2.5-flash",
  },
};

export const AI_PROVIDER_IDS: AiProvider[] = ["anthropic", "openai", "google"];

export function validateApiKeyFormat(provider: AiProvider, key: string): boolean {
  return key.startsWith(AI_PROVIDERS[provider].keyPrefix);
}

export function getDefaultModel(provider: AiProvider): string {
  return AI_PROVIDERS[provider].defaultModel;
}
