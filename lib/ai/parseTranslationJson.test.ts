import { describe, it, expect } from "vitest";
import { parseTranslationJsonResponse } from "./parseTranslationJson";

describe("parseTranslationJsonResponse", () => {
  it("parses fenced JSON", () => {
    const r = parseTranslationJsonResponse('```json\n{"en":"Hi","de":"Hallo"}\n```');
    expect(r).toEqual({ en: "Hi", de: "Hallo" });
  });

  it("extracts object from surrounding text", () => {
    const r = parseTranslationJsonResponse('Here:\n{"fr": "Salut"}');
    expect(r.fr).toBe("Salut");
  });

  it("throws when no object", () => {
    expect(() => parseTranslationJsonResponse("no json")).toThrow("JSON");
  });
});
