"use client";

import { create } from "zustand";
import {
  AI_PROVIDERS,
  type AiProvider,
  validateApiKeyFormat as validateKeyFormat,
} from "@/lib/ai/providers";

export type Theme = "auto" | "light" | "dark";

const GOOGLE_FONTS_API_STORAGE_KEY = "googleFontsApiKey";

interface SettingsState {
  hydrated: boolean;
  theme: Theme;
  aiProvider: AiProvider;
  apiKeys: Record<AiProvider, string>;
  selectedModels: Record<AiProvider, string>;
  /** Google Web Fonts API (optional; higher quota for font catalog). */
  googleFontsApiKey: string;

  hydrate(): void;
  setTheme(t: Theme): void;
  setAiProvider(p: AiProvider): void;
  setApiKey(provider: AiProvider, key: string): void;
  setSelectedModel(provider: AiProvider, modelId: string): void;
  setGoogleFontsApiKey(key: string): void;
  validateKey(provider: AiProvider, key: string): boolean;
}

const isClient = () => typeof window !== "undefined";

function readLs(key: string, fallback = ""): string {
  if (!isClient()) return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function writeLs(key: string, value: string): void {
  if (!isClient()) return;
  window.localStorage.setItem(key, value);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  theme: "auto",
  aiProvider: "anthropic",
  apiKeys: { anthropic: "", openai: "", google: "" },
  selectedModels: {
    anthropic: AI_PROVIDERS.anthropic.defaultModel,
    openai: AI_PROVIDERS.openai.defaultModel,
    google: AI_PROVIDERS.google.defaultModel,
  },
  googleFontsApiKey: "",

  hydrate: () => {
    if (get().hydrated) return;
    const theme = (readLs("themePreference", "auto") as Theme) ?? "auto";
    const aiProvider = (readLs("aiProvider", "anthropic") as AiProvider) ?? "anthropic";
    const apiKeys = {
      anthropic: readLs(AI_PROVIDERS.anthropic.storageKey),
      openai: readLs(AI_PROVIDERS.openai.storageKey),
      google: readLs(AI_PROVIDERS.google.storageKey),
    };
    const selectedModels = {
      anthropic: readLs(
        AI_PROVIDERS.anthropic.modelStorageKey,
        AI_PROVIDERS.anthropic.defaultModel,
      ),
      openai: readLs(AI_PROVIDERS.openai.modelStorageKey, AI_PROVIDERS.openai.defaultModel),
      google: readLs(AI_PROVIDERS.google.modelStorageKey, AI_PROVIDERS.google.defaultModel),
    };
    const googleFontsApiKey = readLs(GOOGLE_FONTS_API_STORAGE_KEY);
    set({
      hydrated: true,
      theme,
      aiProvider,
      apiKeys,
      selectedModels,
      googleFontsApiKey,
    });
  },

  setTheme: (t) => {
    writeLs("themePreference", t);
    set({ theme: t });
  },

  setAiProvider: (p) => {
    writeLs("aiProvider", p);
    set({ aiProvider: p });
  },

  setApiKey: (provider, key) => {
    writeLs(AI_PROVIDERS[provider].storageKey, key);
    set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } }));
  },

  setSelectedModel: (provider, modelId) => {
    writeLs(AI_PROVIDERS[provider].modelStorageKey, modelId);
    set((s) => ({ selectedModels: { ...s.selectedModels, [provider]: modelId } }));
  },

  setGoogleFontsApiKey: (key) => {
    writeLs(GOOGLE_FONTS_API_STORAGE_KEY, key);
    set({ googleFontsApiKey: key });
  },

  validateKey: (provider, key) => validateKeyFormat(provider, key),
}));
