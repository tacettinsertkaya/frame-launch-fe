import { describe, expect, it } from "vitest";
import type { Project } from "@/lib/types/project";
import { makeBlankScreenshot } from "@/store/projectsStore";
import { findScreenshotIdByUploadBaseName } from "./findDuplicateUpload";

function proj(screenshots: ReturnType<typeof makeBlankScreenshot>[]): Project {
  return {
    id: "p1",
    name: "P",
    createdAt: "",
    updatedAt: "",
    schemaVersion: 3,
    defaultLocale: "tr",
    activeLocales: ["tr", "en"],
    currentLocale: "tr",
    defaultDeviceSizeId: "iphone-69",
    screenshots,
  };
}

describe("findScreenshotIdByUploadBaseName", () => {
  it("returns null when no uploads", () => {
    const a = makeBlankScreenshot("A");
    const b = makeBlankScreenshot("B");
    const p = proj([a, b]);
    expect(findScreenshotIdByUploadBaseName(p, "foo")).toBeNull();
  });

  it("matches uploadMeta.baseFilename", () => {
    const s1 = makeBlankScreenshot("S1");
    s1.id = "s1";
    s1.uploads = { tr: "blob1" };
    s1.uploadMeta = {
      tr: { filename: "x.png", baseFilename: "app", uploadedAt: "t" },
    };
    const p = proj([s1]);
    expect(findScreenshotIdByUploadBaseName(p, "app")).toBe("s1");
  });

  it("returns first screenshot in list order", () => {
    const first = makeBlankScreenshot("A");
    first.id = "first";
    first.uploads = { en: "b1" };
    first.uploadMeta = {
      en: { filename: "a_en.png", baseFilename: "a", uploadedAt: "t" },
    };
    const second = makeBlankScreenshot("B");
    second.id = "second";
    second.uploads = { en: "b2" };
    second.uploadMeta = {
      en: { filename: "a_en.png", baseFilename: "a", uploadedAt: "t" },
    };
    const p = proj([first, second]);
    expect(findScreenshotIdByUploadBaseName(p, "a")).toBe("first");
  });
});
