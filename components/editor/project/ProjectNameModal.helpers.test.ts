import { describe, it, expect, vi } from "vitest";
import { executeProjectCreate } from "./ProjectNameModal.helpers";
import type { Project } from "@/lib/types/project";

function mkProject(id: string, name: string): Project {
  return {
    id,
    name,
    createdAt: "",
    updatedAt: "",
    schemaVersion: 3,
    defaultLocale: "tr",
    activeLocales: ["tr"],
    currentLocale: "tr",
    defaultDeviceSizeId: "iphone-69",
    screenshots: [],
  };
}

describe("executeProjectCreate", () => {
  it("mode=blank → createProject(name, undefined)", () => {
    const createProject = vi.fn().mockReturnValue(mkProject("new", "X"));
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "blank",
      name: "X",
      activeProjectId: "p1",
      templateBuild: undefined,
      createProject,
      duplicateProject,
    });
    expect(createProject).toHaveBeenCalledWith("X", undefined);
    expect(duplicateProject).not.toHaveBeenCalled();
    expect(res?.id).toBe("new");
  });

  it("mode=duplicate → duplicateProject(activeId, name)", () => {
    const createProject = vi.fn();
    const duplicateProject = vi
      .fn()
      .mockReturnValue(mkProject("dup", "X kopya"));
    const res = executeProjectCreate({
      mode: "duplicate",
      name: "X kopya",
      activeProjectId: "p1",
      templateBuild: undefined,
      createProject,
      duplicateProject,
    });
    expect(duplicateProject).toHaveBeenCalledWith("p1", "X kopya");
    expect(createProject).not.toHaveBeenCalled();
    expect(res?.id).toBe("dup");
  });

  it("mode=template → createProject(name, built)", () => {
    const built = mkProject("tmpl_raw", "Tmpl");
    const createProject = vi
      .fn()
      .mockReturnValue(mkProject("tmpl_final", "Benim"));
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "template",
      name: "Benim",
      activeProjectId: "p1",
      templateBuild: () => built,
      createProject,
      duplicateProject,
    });
    expect(createProject).toHaveBeenCalledWith("Benim", built);
    expect(res?.id).toBe("tmpl_final");
  });

  it("mode=duplicate with no activeProjectId returns null", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "duplicate",
      name: "X",
      activeProjectId: null,
      templateBuild: undefined,
      createProject,
      duplicateProject,
    });
    expect(res).toBeNull();
    expect(duplicateProject).not.toHaveBeenCalled();
  });

  it("mode=template with no templateBuild returns null", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "template",
      name: "X",
      activeProjectId: "p1",
      templateBuild: undefined,
      createProject,
      duplicateProject,
    });
    expect(res).toBeNull();
    expect(createProject).not.toHaveBeenCalled();
  });

  it("empty/whitespace name returns null", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "blank",
      name: "   ",
      activeProjectId: "p1",
      templateBuild: undefined,
      createProject,
      duplicateProject,
    });
    expect(res).toBeNull();
    expect(createProject).not.toHaveBeenCalled();
  });

  it("trims name before calling actions", () => {
    const createProject = vi.fn().mockReturnValue(mkProject("n", "Trimmed"));
    const duplicateProject = vi.fn();
    executeProjectCreate({
      mode: "blank",
      name: "  Trimmed  ",
      activeProjectId: null,
      templateBuild: undefined,
      createProject,
      duplicateProject,
    });
    expect(createProject).toHaveBeenCalledWith("Trimmed", undefined);
  });
});
