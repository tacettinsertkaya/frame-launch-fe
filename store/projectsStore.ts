"use client";

import { create } from "zustand";
import type { Project, Screenshot, Locale } from "@/lib/types/project";
import {
  defaultBackground,
  defaultDevice,
  defaultScreenshotTextBundle,
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
  duplicateProject: (id: string, name?: string) => Project | null;
  reorderScreenshots: (projectId: string, fromIdx: number, toIdx: number) => void;
  addLocale: (projectId: string, locale: Locale) => void;
  removeLocale: (projectId: string, locale: Locale) => void;
  setCurrentLocale: (projectId: string, locale: Locale) => void;
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

  duplicateProject: (id, name) => {
    const src = get().projects.find((p) => p.id === id);
    if (!src) return null;
    const cloned = structuredClone(src);
    cloned.id = uid("p_");
    cloned.name = name ?? `${src.name} (kopya)`;
    cloned.createdAt = nowIso();
    cloned.updatedAt = nowIso();
    for (const s of cloned.screenshots) {
      s.id = uid("s_");
    }
    const projects = [...get().projects, cloned];
    persist(projects);
    saveActiveProjectId(cloned.id);
    set({ projects, activeProjectId: cloned.id });
    return cloned;
  },

  reorderScreenshots: (projectId, fromIdx, toIdx) => {
    get().updateProject(projectId, (p) => {
      if (
        fromIdx < 0 ||
        fromIdx >= p.screenshots.length ||
        toIdx < 0 ||
        toIdx >= p.screenshots.length ||
        fromIdx === toIdx
      ) {
        return;
      }
      const [moved] = p.screenshots.splice(fromIdx, 1);
      p.screenshots.splice(toIdx, 0, moved);
    });
  },

  addLocale: (projectId, locale) => {
    get().updateProject(projectId, (p) => {
      if (!p.activeLocales.includes(locale)) {
        p.activeLocales = [...p.activeLocales, locale];
      }
    });
  },

  removeLocale: (projectId, locale) => {
    get().updateProject(projectId, (p) => {
      if (p.activeLocales.length <= 1) return;
      p.activeLocales = p.activeLocales.filter((l) => l !== locale);
      if (p.currentLocale === locale) {
        p.currentLocale = p.activeLocales[0];
      }
      for (const s of p.screenshots) {
        if (s.uploads?.[locale]) {
          const nextU = { ...s.uploads };
          delete nextU[locale];
          s.uploads = nextU;
        }
        if (s.uploadMeta?.[locale]) {
          const nextM = { ...s.uploadMeta };
          delete nextM[locale];
          s.uploadMeta = Object.keys(nextM).length ? nextM : undefined;
        }
      }
    });
  },

  setCurrentLocale: (projectId, locale) => {
    get().updateProject(projectId, (p) => {
      if (p.activeLocales.includes(locale)) {
        p.currentLocale = locale;
      }
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
    schemaVersion: 3,
    defaultLocale: "tr",
    activeLocales: ["tr"],
    currentLocale: "tr",
    defaultDeviceSizeId: "iphone-69",
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
    text: defaultScreenshotTextBundle(),
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
