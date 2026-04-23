"use client";

import { useEffect, useMemo } from "react";
import { Layers, Sliders, X } from "lucide-react";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { useEditorKeyboardShortcuts } from "@/lib/editor/useEditorKeyboardShortcuts";
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
import { cn } from "@/lib/utils";
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

  useEditorKeyboardShortcuts(project);

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

  // Mobil çekmeceyi viewport büyürken otomatik kapat.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      if (mq.matches) useEditorStore.getState().closeMobileDrawers();
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Mobilde kullanıcı ekran seçince çekmeceyi kapat.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) return;
    if (useEditorStore.getState().mobileScreensOpen) {
      useEditorStore.getState().setMobileScreensOpen(false);
    }
  }, [activeScreenshotId]);

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
      <Topbar project={project} />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <MobileBackdrop />
        <MobileDrawer side="left" panel="screens">
          <ScreenshotsSidebar project={project} />
        </MobileDrawer>
        <CanvasStage project={project} />
        {activeScreenshot && (
          <MobileDrawer side="right" panel="tools">
            <RightPanel project={project} screenshot={activeScreenshot} />
          </MobileDrawer>
        )}
      </div>
      <MobileEditorBar />
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

function MobileBackdrop() {
  const screensOpen = useEditorStore((s) => s.mobileScreensOpen);
  const toolsOpen = useEditorStore((s) => s.mobileToolsOpen);
  const close = useEditorStore((s) => s.closeMobileDrawers);
  const open = screensOpen || toolsOpen;
  if (!open) return null;
  return (
    <button
      type="button"
      aria-label="Paneli kapat"
      onClick={close}
      className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
    />
  );
}

interface DrawerProps {
  side: "left" | "right";
  panel: "screens" | "tools";
  children: React.ReactNode;
}

function MobileDrawer({ side, panel, children }: DrawerProps) {
  const open = useEditorStore((s) =>
    panel === "screens" ? s.mobileScreensOpen : s.mobileToolsOpen,
  );
  const close = useEditorStore((s) => s.closeMobileDrawers);
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "z-40 transition-transform duration-200 ease-out md:relative md:z-0 md:translate-x-0",
        "max-md:absolute max-md:inset-y-0",
        isLeft ? "max-md:left-0" : "max-md:right-0",
        "max-md:shadow-[var(--shadow-lg)] max-md:bg-[var(--color-surface-0)]",
        open
          ? "translate-x-0"
          : isLeft
            ? "max-md:-translate-x-full"
            : "max-md:translate-x-full",
      )}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
    >
      {open && (
        <button
          type="button"
          aria-label="Paneli kapat"
          onClick={close}
          className={cn(
            "absolute top-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] text-[var(--color-ink-muted)] shadow-[var(--shadow-sm)] transition-colors hover:text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] md:hidden",
            isLeft ? "right-2" : "left-2",
          )}
        >
          <X size={14} aria-hidden />
        </button>
      )}
      {children}
    </div>
  );
}

function MobileEditorBar() {
  const screensOpen = useEditorStore((s) => s.mobileScreensOpen);
  const toolsOpen = useEditorStore((s) => s.mobileToolsOpen);
  const setScreens = useEditorStore((s) => s.setMobileScreensOpen);
  const setTools = useEditorStore((s) => s.setMobileToolsOpen);

  return (
    <nav
      aria-label="Mobil editör paneli kontrolleri"
      className="flex shrink-0 items-stretch border-t border-[var(--color-surface-2)] bg-[var(--color-surface-0)] md:hidden"
    >
      <button
        type="button"
        aria-pressed={screensOpen}
        onClick={() => setScreens(!screensOpen)}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary)]",
          screensOpen
            ? "bg-[var(--color-surface-1)] text-[var(--color-ink-strong)]"
            : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]",
        )}
      >
        <Layers size={16} aria-hidden />
        Ekranlar
      </button>
      <div className="w-px bg-[var(--color-surface-2)]" aria-hidden />
      <button
        type="button"
        aria-pressed={toolsOpen}
        onClick={() => setTools(!toolsOpen)}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary)]",
          toolsOpen
            ? "bg-[var(--color-surface-1)] text-[var(--color-ink-strong)]"
            : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]",
        )}
      >
        <Sliders size={16} aria-hidden />
        Araçlar
      </button>
    </nav>
  );
}
