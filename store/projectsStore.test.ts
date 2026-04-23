/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { makeBlankProject, useProjectsStore } from "./projectsStore";

describe("makeBlankProject", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("sets schemaVersion to 3", () => {
    const p = makeBlankProject("Test");
    expect(p.schemaVersion).toBe(3);
  });

  it("sets currentLocale equal to defaultLocale", () => {
    const p = makeBlankProject("Test");
    expect(p.currentLocale).toBe(p.defaultLocale);
  });

  it("sets defaultDeviceSizeId to iphone-69", () => {
    const p = makeBlankProject("Test");
    expect(p.defaultDeviceSizeId).toBe("iphone-69");
  });
});

function resetStore() {
  useProjectsStore.setState({
    projects: [],
    activeProjectId: null,
    hydrated: false,
  });
  window.localStorage.clear();
}

describe("projectsStore actions", () => {
  beforeEach(() => {
    resetStore();
    useProjectsStore.getState().hydrate();
  });

  it("duplicateProject creates a new project with same screenshots and new ids", () => {
    const original = useProjectsStore.getState().createProject("Orig");
    const dup = useProjectsStore.getState().duplicateProject(original.id);
    expect(dup).not.toBeNull();
    expect(dup!.id).not.toBe(original.id);
    expect(dup!.screenshots.length).toBe(original.screenshots.length);
    expect(dup!.screenshots[0].id).not.toBe(original.screenshots[0].id);
  });

  it("reorderScreenshots moves an item from index 0 to index 2", () => {
    const p = useProjectsStore.getState().createProject("Reorder");
    useProjectsStore.getState().updateProject(p.id, (proj) => {
      const base = proj.screenshots[0];
      proj.screenshots.push({ ...structuredClone(base), id: "s2", name: "Ekran 2" });
      proj.screenshots.push({ ...structuredClone(base), id: "s3", name: "Ekran 3" });
    });
    const before = useProjectsStore
      .getState()
      .projects.find((x) => x.id === p.id)!.screenshots.map((s) => s.id);
    useProjectsStore.getState().reorderScreenshots(p.id, 0, 2);
    const after = useProjectsStore
      .getState()
      .projects.find((x) => x.id === p.id)!.screenshots.map((s) => s.id);
    expect(after).toEqual([before[1], before[2], before[0]]);
  });

  it("addLocale adds locale to activeLocales", () => {
    const p = useProjectsStore.getState().createProject("Locales");
    useProjectsStore.getState().addLocale(p.id, "en");
    const proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales).toContain("en");
  });

  it("addLocale is idempotent", () => {
    const p = useProjectsStore.getState().createProject("Locales");
    useProjectsStore.getState().addLocale(p.id, "en");
    useProjectsStore.getState().addLocale(p.id, "en");
    const proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales.filter((l) => l === "en").length).toBe(1);
  });

  it("removeLocale removes but never lets activeLocales become empty", () => {
    const p = useProjectsStore.getState().createProject("Locales");
    useProjectsStore.getState().addLocale(p.id, "en");
    useProjectsStore.getState().removeLocale(p.id, "tr");
    let proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales).toEqual(["en"]);

    useProjectsStore.getState().removeLocale(p.id, "en");
    proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.activeLocales.length).toBe(1);
  });

  it("setCurrentLocale persists in project.currentLocale", () => {
    const p = useProjectsStore.getState().createProject("CurrentLocale");
    useProjectsStore.getState().addLocale(p.id, "en");
    useProjectsStore.getState().setCurrentLocale(p.id, "en");
    const proj = useProjectsStore.getState().projects.find((x) => x.id === p.id)!;
    expect(proj.currentLocale).toBe("en");
  });
});
