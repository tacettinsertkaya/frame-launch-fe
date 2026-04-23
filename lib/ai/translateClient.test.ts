/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import { translateWithAnthropic, callLlmForText } from "./translateClient";

describe("translateWithAnthropic", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns assistant text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ type: "text", text: '{"en":"x"}' }] }),
      }),
    );
    const t = await translateWithAnthropic({
      apiKey: "sk-ant-test",
      model: "claude-3-5-haiku-latest",
      prompt: "p",
    });
    expect(t).toBe('{"en":"x"}');
  });

  it("throws AI_UNAVAILABLE on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );
    await expect(
      translateWithAnthropic({ apiKey: "bad", model: "m", prompt: "p" }),
    ).rejects.toThrow("AI_UNAVAILABLE");
  });
});

describe("callLlmForText", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("dispatches google", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "{}" }] } }],
        }),
      }),
    );
    const t = await callLlmForText({
      provider: "google",
      apiKey: "AIzax",
      model: "gemini-2.5-flash",
      prompt: "p",
    });
    expect(t).toBe("{}");
    expect(fetch).toHaveBeenCalled();
  });
});
