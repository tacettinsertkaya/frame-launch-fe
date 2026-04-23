/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { compressToUTF16 } from "lz-string";
import { loadProjects } from "./localProjects";

const KEY = "framelaunch:projects:v2";

describe("loadProjects migration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("migrates a stored v2 project to v3", () => {
    const v2 = [
      {
        id: "p1",
        name: "Old",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        schemaVersion: 2,
        defaultLocale: "tr",
        activeLocales: ["tr"],
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
      },
    ];
    window.localStorage.setItem(KEY, compressToUTF16(JSON.stringify(v2)));

    const loaded = loadProjects();

    expect(loaded[0].schemaVersion).toBe(3);
    expect(loaded[0].screenshots[0].deviceSizeId).toBe("iphone-69");
    expect(loaded[0].currentLocale).toBe("tr");
  });

  it("returns empty array if storage is empty", () => {
    expect(loadProjects()).toEqual([]);
  });

  it("skips a corrupted (non-object) project but keeps the rest", () => {
    const mixed = [
      { schemaVersion: 2, screenshots: [], defaultLocale: "tr", activeLocales: ["tr"], id: "p1", name: "Ok", createdAt: "x", updatedAt: "x" },
      "not a project",
      null,
    ];
    window.localStorage.setItem(KEY, compressToUTF16(JSON.stringify(mixed)));
    const loaded = loadProjects();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("p1");
    expect(loaded[0].schemaVersion).toBe(3);
  });
});
