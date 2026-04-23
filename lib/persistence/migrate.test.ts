import { describe, it, expect } from "vitest";
import { migrateLegacyProject } from "./migrate";

describe("migrateLegacyProject", () => {
  it("upgrades v2 project to v3 with currentLocale + defaultDeviceSizeId", () => {
    const v2 = {
      id: "p1",
      name: "Old",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      schemaVersion: 2,
      defaultLocale: "tr",
      activeLocales: ["tr", "en"],
      screenshots: [
        {
          id: "s1",
          name: "S",
          deviceSizeId: "iphone-69",
          uploads: {},
          background: {},
          device: {},
          text: { headline: {}, subheadline: {} },
          elements: [],
          popouts: [],
        },
      ],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.schemaVersion).toBe(3);
    expect(v3.currentLocale).toBe("tr");
    expect(v3.defaultDeviceSizeId).toBe("iphone-69");
  });

  it("maps legacy device size ids", () => {
    const v2 = {
      schemaVersion: 2,
      defaultLocale: "tr",
      activeLocales: ["tr"],
      id: "p",
      name: "x",
      createdAt: "x",
      updatedAt: "x",
      screenshots: [
        {
          id: "s1",
          name: "S",
          deviceSizeId: "iphone-6.9",
          uploads: {},
          background: {},
          device: {},
          text: { headline: {}, subheadline: {} },
          elements: [],
          popouts: [],
        },
      ],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].deviceSizeId).toBe("iphone-69");
    expect(v3.defaultDeviceSizeId).toBe("iphone-69");
  });

  it("adds italic/underline/strikethrough false to text configs", () => {
    const v2 = {
      schemaVersion: 2,
      defaultLocale: "tr",
      activeLocales: ["tr"],
      id: "p",
      name: "x",
      createdAt: "x",
      updatedAt: "x",
      screenshots: [
        {
          id: "s1",
          name: "S",
          deviceSizeId: "iphone-69",
          uploads: {},
          background: {},
          device: {},
          text: {
            headline: { enabled: true, text: { tr: "Hi" } },
            subheadline: { enabled: false },
          },
          elements: [],
          popouts: [],
        },
      ],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].text.headline.italic).toBe(false);
    expect(v3.screenshots[0].text.headline.underline).toBe(false);
    expect(v3.screenshots[0].text.headline.strikethrough).toBe(false);
    expect(v3.screenshots[0].text.headline.text).toEqual({ tr: "Hi" });
  });

  it("preserves perLanguageLayout from legacy headline if present", () => {
    const v2 = {
      schemaVersion: 2,
      defaultLocale: "tr",
      activeLocales: ["tr"],
      id: "p",
      name: "x",
      createdAt: "x",
      updatedAt: "x",
      screenshots: [
        {
          id: "s1",
          name: "S",
          deviceSizeId: "iphone-69",
          uploads: {},
          background: {},
          device: {},
          text: {
            headline: { enabled: true, perLanguageLayout: true },
            subheadline: { enabled: false },
          },
          elements: [],
          popouts: [],
        },
      ],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].text.perLanguageLayout).toBe(true);
  });

  it("adds device.perspective default 0", () => {
    const v2 = {
      schemaVersion: 2,
      defaultLocale: "tr",
      activeLocales: ["tr"],
      id: "p",
      name: "x",
      createdAt: "x",
      updatedAt: "x",
      screenshots: [
        {
          id: "s1",
          name: "S",
          deviceSizeId: "iphone-69",
          uploads: {},
          background: {},
          device: { scale: 80 },
          text: { headline: {}, subheadline: {} },
          elements: [],
          popouts: [],
        },
      ],
    };
    const v3 = migrateLegacyProject(v2);
    expect(v3.screenshots[0].device.perspective).toBe(0);
    expect(v3.screenshots[0].device.scale).toBe(80);
  });

  it("returns v3 project unchanged", () => {
    const v3in = {
      schemaVersion: 3,
      defaultLocale: "tr",
      activeLocales: ["tr"],
      currentLocale: "tr",
      defaultDeviceSizeId: "iphone-69",
      id: "p",
      name: "x",
      createdAt: "x",
      updatedAt: "x",
      screenshots: [],
    };
    const v3 = migrateLegacyProject(v3in);
    expect(v3.schemaVersion).toBe(3);
    expect(v3.screenshots).toEqual([]);
  });
});
