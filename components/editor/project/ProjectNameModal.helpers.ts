import type { Project } from "@/lib/types/project";

export type CreateMode = "blank" | "duplicate" | "template";

export interface ExecuteCreateArgs {
  mode: CreateMode;
  name: string;
  activeProjectId: string | null;
  templateBuild: (() => Project) | undefined;
  createProject: (name?: string, fromTemplate?: Project) => Project;
  duplicateProject: (id: string, name?: string) => Project | null;
}

export function executeProjectCreate(args: ExecuteCreateArgs): Project | null {
  const name = args.name.trim();
  if (!name) return null;
  if (args.mode === "blank") {
    return args.createProject(name, undefined);
  }
  if (args.mode === "duplicate") {
    if (!args.activeProjectId) return null;
    return args.duplicateProject(args.activeProjectId, name);
  }
  if (args.mode === "template") {
    if (!args.templateBuild) return null;
    const built = args.templateBuild();
    return args.createProject(name, built);
  }
  return null;
}
