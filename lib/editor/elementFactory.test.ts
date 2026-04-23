import { describe, it, expect } from "vitest";
import {
  makeEmojiElement,
  makeGraphicElement,
  makeIconElement,
  makeTextElement,
} from "./elementFactory";

describe("elementFactory", () => {
  it("makeEmojiElement sets kind and layer", () => {
    const e = makeEmojiElement("🎉");
    expect(e.kind).toBe("emoji");
    if (e.kind !== "emoji") throw new Error("expected emoji");
    expect(e.emoji).toBe("🎉");
    expect(e.layer).toBe("aboveScreenshot");
  });

  it("makeTextElement includes locale text", () => {
    const e = makeTextElement();
    expect(e.kind).toBe("text");
    if (e.kind !== "text") throw new Error("expected text");
    expect(e.text.tr).toBe("Yeni metin");
  });

  it("makeGraphicElement references blob", () => {
    const e = makeGraphicElement("blob_1");
    expect(e.kind).toBe("graphic");
    if (e.kind !== "graphic") throw new Error("expected graphic");
    expect(e.blobId).toBe("blob_1");
  });

  it("makeIconElement disables shadow by default", () => {
    const e = makeIconElement("Star");
    expect(e.kind).toBe("icon");
    if (e.kind !== "icon") throw new Error("expected icon");
    expect(e.iconName).toBe("Star");
    expect(e.shadow.enabled).toBe(false);
  });
});
