import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import type { Project } from "@/lib/types/project";
import { migrateLegacyProject } from "./migrate";

const KEY_PROJECTS = "framelaunch:projects:v2";
const KEY_ACTIVE = "framelaunch:activeProjectId";

const isClient = () => typeof window !== "undefined";

export function loadProjects(): Project[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(KEY_PROJECTS);
    if (!raw) return [];
    const decompressed = decompressFromUTF16(raw);
    if (!decompressed) return [];
    const parsed = JSON.parse(decompressed) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const out: Project[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) {
        console.warn("loadProjects: skipping non-object entry");
        continue;
      }
      try {
        out.push(migrateLegacyProject(item));
      } catch (err) {
        console.warn("loadProjects: skipping corrupted project", err);
      }
    }
    return out;
  } catch (err) {
    console.warn("loadProjects failed", err);
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (!isClient()) return;
  try {
    const compressed = compressToUTF16(JSON.stringify(projects));
    window.localStorage.setItem(KEY_PROJECTS, compressed);
  } catch (err) {
    console.warn("saveProjects failed", err);
  }
}

export function loadActiveProjectId(): string | null {
  if (!isClient()) return null;
  return window.localStorage.getItem(KEY_ACTIVE);
}

export function saveActiveProjectId(id: string | null): void {
  if (!isClient()) return;
  if (id) window.localStorage.setItem(KEY_ACTIVE, id);
  else window.localStorage.removeItem(KEY_ACTIVE);
}
