"use client";

import { useEffect, useMemo } from "react";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { Topbar } from "./Topbar";
import { ScreenshotsSidebar } from "./ScreenshotsSidebar";
import { RightPanel } from "./RightPanel";
import { CanvasStage } from "./CanvasStage";
import { ExportModal } from "./ExportModal";
import { DuplicateUploadModal } from "./modals/DuplicateUploadModal";
import { LanguagesModal } from "./modals/LanguagesModal";
import { ScreenshotTranslationsModal } from "./modals/ScreenshotTranslationsModal";
import { ApplyStyleModal } from "./modals/ApplyStyleModal";
import { SettingsModal } from "./modals/SettingsModal";
import { TranslateModal } from "./modals/TranslateModal";
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div
        className="hidden border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 max-md:block"
        role="note"
      >
        Editör daha geniş bir ekranda çalışmak üzere tasarlandı. Daha iyi deneyim için tablet veya masaüstü kullanın.
      </div>
      <Topbar project={project} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
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
      <ApplyStyleModal project={project} />
      <SettingsModal />
      <TranslateModal />
    </div>
  );
}
