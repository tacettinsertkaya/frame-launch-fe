import { describe, expect, it } from "vitest";
import { makeBlankScreenshot } from "@/store/projectsStore";
import { copyScreenshotStyleFromTo } from "./styleTransfer";

describe("copyScreenshotStyleFromTo", () => {
  it("copies device and background but keeps target headline text", () => {
    const src = makeBlankScreenshot("Kaynak");
    src.device.scale = 42;
    src.background.type = "solid";
    src.background.solidColor = "#ff0000";
    src.text.headline.text = { en: "Src EN" };

    const tgt = makeBlankScreenshot("Hedef");
    tgt.text.headline.text = { tr: "Hedef TR", en: "Tgt EN" };
    tgt.device.scale = 10;

    copyScreenshotStyleFromTo(src, tgt);

    expect(tgt.device.scale).toBe(42);
    expect(tgt.background.type).toBe("solid");
    expect(tgt.background.solidColor).toBe("#ff0000");
    expect(tgt.text.headline.text).toEqual({ tr: "Hedef TR", en: "Tgt EN" });
  });

  it("does not copy uploads from source", () => {
    const src = makeBlankScreenshot("A");
    src.uploads = { tr: "blob-x" };
    const tgt = makeBlankScreenshot("B");
    tgt.uploads = { tr: "blob-y" };

    copyScreenshotStyleFromTo(src, tgt);

    expect(tgt.uploads.tr).toBe("blob-y");
  });
});
