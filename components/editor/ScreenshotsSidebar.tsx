"use client";

import { Plus, Trash2, Copy } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { useProjectsStore, makeBlankScreenshot } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { Canvas } from "./Canvas";
import { cn, uid } from "@/lib/utils";

interface Props {
  project: Project;
}

export function ScreenshotsSidebar({ project }: Props) {
  const activeId = useEditorStore((s) => s.activeScreenshotId);
  const setActive = useEditorStore((s) => s.setActiveScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const removeScreenshot = useProjectsStore((s) => s.removeScreenshot);

  const addScreenshot = () => {
    const next = makeBlankScreenshot(`Ekran ${project.screenshots.length + 1}`);
    updateProject(project.id, (p) => {
      p.screenshots.push(next);
    });
    setActive(next.id);
  };

  const duplicate = (id: string) => {
    const src = project.screenshots.find((s) => s.id === id);
    if (!src) return;
    const next = structuredClone(src);
    next.id = uid("s_");
    next.name = `${src.name} kopya`;
    updateProject(project.id, (p) => {
      const idx = p.screenshots.findIndex((s) => s.id === id);
      p.screenshots.splice(idx + 1, 0, next);
    });
    setActive(next.id);
  };

  const remove = (id: string) => {
    if (project.screenshots.length === 1) {
      alert("En az bir ekran kalmalı.");
      return;
    }
    const idx = project.screenshots.findIndex((s) => s.id === id);
    removeScreenshot(project.id, id);
    if (activeId === id) {
      const next = project.screenshots[idx + 1] ?? project.screenshots[idx - 1];
      setActive(next?.id ?? null);
    }
  };

  return (
    <aside className="flex h-full w-[200px] flex-col border-r border-[var(--color-surface-2)] bg-[var(--color-surface-1)]">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
          Ekranlar
        </h2>
        <button
          onClick={addScreenshot}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-black text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-dark-surface-2)]"
          aria-label="Yeni ekran"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        {project.screenshots.map((s, i) => {
          const active = s.id === activeId;
          // Thumbnail için: max 168px genişlik
          const thumbScale = 168 / 1320;
          return (
            <div key={s.id} className="group relative">
              <button
                onClick={() => setActive(s.id)}
                className={cn(
                  "block w-full overflow-hidden rounded-[var(--radius-md)] border-2 transition-all",
                  active
                    ? "border-[var(--color-brand-primary)] shadow-[var(--shadow-md)]"
                    : "border-transparent hover:border-[var(--color-surface-2)]",
                )}
              >
                <div className="pointer-events-none">
                  <Canvas screenshot={s} locale={activeLocale} scale={thumbScale} />
                </div>
              </button>
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="truncate text-[11px] text-[var(--color-ink-body)]">
                  {String(i + 1).padStart(2, "0")} · {s.name}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => duplicate(s.id)}
                    className="grid h-6 w-6 place-items-center rounded text-[var(--color-ink-muted)] hover:bg-white hover:text-[var(--color-ink-strong)]"
                    aria-label="Çoğalt"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="grid h-6 w-6 place-items-center rounded text-[var(--color-ink-muted)] hover:bg-red-50 hover:text-red-500"
                    aria-label="Sil"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
