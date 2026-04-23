"use client";

import { useEffect, useMemo } from "react";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Topbar } from "./Topbar";
import { ScreenshotsSidebar } from "./ScreenshotsSidebar";
import { RightPanel } from "./RightPanel";
import { CanvasStage } from "./CanvasStage";
import { ExportModal } from "./ExportModal";
import { DuplicateUploadModal } from "./modals/DuplicateUploadModal";
import { LanguagesModal } from "./modals/LanguagesModal";
import { ScreenshotTranslationsModal } from "./modals/ScreenshotTranslationsModal";

export function EditorShell() {
  const hydrated = useProjectsStore((s) => s.hydrated);
  const hydrate = useProjectsStore((s) => s.hydrate);
  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const setActiveScreenshot = useEditorStore((s) => s.setActiveScreenshot);
  const activeScreenshotId = useEditorStore((s) => s.activeScreenshotId);
  const setActiveLocale = useEditorStore((s) => s.setActiveLocale);

  useEffect(() => {
    hydrate();
    useSettingsStore.getState().hydrate();
  }, [hydrate]);

  const project = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  useEffect(() => {
    if (!project) return;
    if (project.activeLocales.includes(project.currentLocale)) {
      setActiveLocale(project.currentLocale);
    }
  }, [project, setActiveLocale]);

  // Aktif projedeki ilk ekranı seç
  useEffect(() => {
    if (project && !activeScreenshotId && project.screenshots[0]) {
      setActiveScreenshot(project.screenshots[0].id);
    }
  }, [project, activeScreenshotId, setActiveScreenshot]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-surface-1)] text-sm text-[var(--color-ink-muted)]">
        Editör yükleniyor…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-surface-1)] text-sm text-[var(--color-ink-muted)]">
        Proje bulunamadı.
      </div>
    );
  }

  const activeScreenshot =
    project.screenshots.find((s) => s.id === activeScreenshotId) ?? project.screenshots[0];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Topbar project={project} />
      <div className="flex flex-1 overflow-hidden">
        <ScreenshotsSidebar project={project} />
        <CanvasStage project={project} />
        {activeScreenshot && (
          <RightPanel project={project} screenshot={activeScreenshot} />
        )}
      </div>
      <ExportModal project={project} />
      <DuplicateUploadModal />
      <LanguagesModal project={project} />
      <ScreenshotTranslationsModal project={project} />
    </div>
  );
}
