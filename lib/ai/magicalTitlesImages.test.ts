import { describe, it, expect } from "vitest";
import type { Locale } from "@/lib/types/project";
import { resolveUploadBlobId } from "./magicalTitlesImages";

describe("resolveUploadBlobId", () => {
  const fallbacks: Locale[] = ["en", "tr"];

  it("prefers requested locale", () => {
    expect(resolveUploadBlobId({ tr: "a", en: "b" }, "tr", fallbacks)).toBe("a");
  });

  it("falls back in order", () => {
    expect(resolveUploadBlobId({ en: "b" }, "tr", fallbacks)).toBe("b");
  });

  it("returns undefined when empty", () => {
    expect(resolveUploadBlobId({}, "tr", fallbacks)).toBeUndefined();
  });
});
