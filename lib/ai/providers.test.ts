import { describe, it, expect } from "vitest";
import {
  AI_PROVIDERS,
  AI_PROVIDER_IDS,
  validateApiKeyFormat,
  getDefaultModel,
} from "./providers";

describe("AI_PROVIDERS", () => {
  it("contains anthropic, openai, google", () => {
    expect(AI_PROVIDER_IDS).toEqual(["anthropic", "openai", "google"]);
  });

  it("each provider has at least one model", () => {
    for (const id of AI_PROVIDER_IDS) {
      expect(AI_PROVIDERS[id].models.length).toBeGreaterThan(0);
    }
  });
});

describe("validateApiKeyFormat", () => {
  it("anthropic keys start with sk-ant-", () => {
    expect(validateApiKeyFormat("anthropic", "sk-ant-abc")).toBe(true);
    expect(validateApiKeyFormat("anthropic", "sk-foo")).toBe(false);
  });
  it("openai keys start with sk-", () => {
    expect(validateApiKeyFormat("openai", "sk-foo")).toBe(true);
  });
  it("google keys start with AIza", () => {
    expect(validateApiKeyFormat("google", "AIzaXyz")).toBe(true);
  });
});

describe("getDefaultModel", () => {
  it("returns the configured default", () => {
    expect(getDefaultModel("anthropic")).toBe("claude-sonnet-4-5-20250929");
    expect(getDefaultModel("openai")).toBe("gpt-5-mini-2025-08-07");
    expect(getDefaultModel("google")).toBe("gemini-2.5-flash");
  });
});
