/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSettingsStore.setState({
      hydrated: false,
      theme: "auto",
      aiProvider: "anthropic",
      apiKeys: { anthropic: "", openai: "", google: "" },
      selectedModels: {
        anthropic: "claude-sonnet-4-5-20250929",
        openai: "gpt-5-mini-2025-08-07",
        google: "gemini-2.5-flash",
      },
      googleFontsApiKey: "",
      hasSeenMagicalTitlesTooltip: false,
    });
  });

  it("hydrate reads theme from localStorage", () => {
    window.localStorage.setItem("themePreference", "dark");
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("hydrate reads api keys with appscreen-compatible storage keys", () => {
    window.localStorage.setItem("claudeApiKey", "sk-ant-test");
    window.localStorage.setItem("openaiApiKey", "sk-openai");
    window.localStorage.setItem("googleApiKey", "AIzaG");
    useSettingsStore.getState().hydrate();
    const s = useSettingsStore.getState();
    expect(s.apiKeys.anthropic).toBe("sk-ant-test");
    expect(s.apiKeys.openai).toBe("sk-openai");
    expect(s.apiKeys.google).toBe("AIzaG");
  });

  it("setTheme persists to localStorage", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().setTheme("light");
    expect(window.localStorage.getItem("themePreference")).toBe("light");
    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("setApiKey persists with appscreen-compatible key", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().setApiKey("anthropic", "sk-ant-x");
    expect(window.localStorage.getItem("claudeApiKey")).toBe("sk-ant-x");
  });

  it("hydrate and setGoogleFontsApiKey persist googleFontsApiKey", () => {
    window.localStorage.setItem("googleFontsApiKey", "AIza_test_fonts");
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().googleFontsApiKey).toBe("AIza_test_fonts");
    useSettingsStore.getState().setGoogleFontsApiKey("key2");
    expect(window.localStorage.getItem("googleFontsApiKey")).toBe("key2");
  });

  it("setSelectedModel persists", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().setSelectedModel("openai", "gpt-5-nano-2025-08-07");
    expect(window.localStorage.getItem("openaiModel")).toBe("gpt-5-nano-2025-08-07");
  });

  it("markMagicalTitlesTooltipSeen persists", () => {
    useSettingsStore.getState().hydrate();
    useSettingsStore.getState().markMagicalTitlesTooltipSeen();
    expect(window.localStorage.getItem("magicalTitlesTooltipDismissed")).toBe("1");
    expect(useSettingsStore.getState().hasSeenMagicalTitlesTooltip).toBe(true);
  });

  it("hydrate is idempotent", () => {
    window.localStorage.setItem("themePreference", "dark");
    useSettingsStore.getState().hydrate();
    window.localStorage.setItem("themePreference", "light");
    useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().theme).toBe("dark");
  });
});
