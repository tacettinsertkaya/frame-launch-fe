"use client";

import { create } from "zustand";
import type { Project, Screenshot } from "@/lib/types/project";
import {
  defaultBackground,
  defaultDevice,
  defaultText,
} from "@/lib/types/project";
import {
  loadProjects,
  saveProjects,
  loadActiveProjectId,
  saveActiveProjectId,
} from "@/lib/persistence/localProjects";
import { uid, nowIso } from "@/lib/utils";

interface ProjectsState {
  projects: Project[];
  activeProjectId: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setActiveProject: (id: string | null) => void;
  createProject: (name?: string, fromTemplate?: Project) => Project;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  updateProject: (id: string, updater: (p: Project) => void) => void;
  /** screenshot ekle / sil / güncelle helper'ları */
  addScreenshot: (projectId: string, screenshot: Screenshot) => void;
  removeScreenshot: (projectId: string, screenshotId: string) => void;
  updateScreenshot: (
    projectId: string,
    screenshotId: string,
    updater: (s: Screenshot) => void,
  ) => void;
}

function persist(projects: Project[]): void {
  saveProjects(projects);
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const projects = loadProjects();
    let activeProjectId = loadActiveProjectId();
    if (projects.length === 0) {
      // ilk açılışta default proje oluştur
      const p = makeBlankProject("İlk Proje");
      projects.push(p);
      activeProjectId = p.id;
      saveProjects(projects);
      saveActiveProjectId(activeProjectId);
    } else if (!activeProjectId || !projects.find((p) => p.id === activeProjectId)) {
      activeProjectId = projects[0].id;
      saveActiveProjectId(activeProjectId);
    }
    set({ projects, activeProjectId, hydrated: true });
  },

  setActiveProject: (id) => {
    saveActiveProjectId(id);
    set({ activeProjectId: id });
  },

  createProject: (name = "Yeni Proje", fromTemplate) => {
    const project = fromTemplate
      ? cloneTemplateProject(fromTemplate, name)
      : makeBlankProject(name);
    const projects = [...get().projects, project];
    persist(projects);
    saveActiveProjectId(project.id);
    set({ projects, activeProjectId: project.id });
    return project;
  },

  deleteProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id);
    let activeProjectId = get().activeProjectId;
    if (activeProjectId === id) {
      activeProjectId = projects[0]?.id ?? null;
    }
    persist(projects);
    saveActiveProjectId(activeProjectId);
    set({ projects, activeProjectId });
  },

  renameProject: (id, name) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, name, updatedAt: nowIso() } : p,
    );
    persist(projects);
    set({ projects });
  },

  updateProject: (id, updater) => {
    const projects = get().projects.map((p) => {
      if (p.id !== id) return p;
      const next = structuredClone(p);
      updater(next);
      next.updatedAt = nowIso();
      return next;
    });
    persist(projects);
    set({ projects });
  },

  addScreenshot: (projectId, screenshot) => {
    get().updateProject(projectId, (p) => {
      p.screenshots.push(screenshot);
    });
  },

  removeScreenshot: (projectId, screenshotId) => {
    get().updateProject(projectId, (p) => {
      p.screenshots = p.screenshots.filter((s) => s.id !== screenshotId);
    });
  },

  updateScreenshot: (projectId, screenshotId, updater) => {
    get().updateProject(projectId, (p) => {
      const idx = p.screenshots.findIndex((s) => s.id === screenshotId);
      if (idx === -1) return;
      const next = structuredClone(p.screenshots[idx]);
      updater(next);
      p.screenshots[idx] = next;
    });
  },
}));

export function makeBlankProject(name: string): Project {
  const id = uid("p_");
  const now = nowIso();
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    schemaVersion: 2,
    defaultLocale: "tr",
    activeLocales: ["tr"],
    screenshots: [makeBlankScreenshot("Ekran 1")],
  };
}

export function makeBlankScreenshot(name: string): Screenshot {
  return {
    id: uid("s_"),
    name,
    deviceSizeId: "iphone-69",
    uploads: {},
    background: defaultBackground(),
    device: defaultDevice(),
    text: {
      headline: defaultText("top", true),
      subheadline: { ...defaultText("top", false), enabled: false },
    },
    elements: [],
    popouts: [],
  };
}

function cloneTemplateProject(template: Project, name: string): Project {
  const cloned = structuredClone(template);
  cloned.id = uid("p_");
  cloned.name = name;
  cloned.createdAt = nowIso();
  cloned.updatedAt = nowIso();
  for (const s of cloned.screenshots) {
    s.id = uid("s_");
  }
  return cloned;
}

/** Helper: aktif projeyi seç */
export const useActiveProject = () => {
  return useProjectsStore((s) =>
    s.activeProjectId ? s.projects.find((p) => p.id === s.activeProjectId) ?? null : null,
  );
};
