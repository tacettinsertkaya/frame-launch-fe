"use client";

import { useEffect } from "react";
import type { Project } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";

/** Returns true when the keyboard target is an editable text surface. */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
    return true;
  }
  return el.isContentEditable;
}

/** Returns true when any modal/dialog is currently open in the store. */
function anyModalOpen(state: ReturnType<typeof useEditorStore.getState>): boolean {
  return (
    state.exportModalOpen ||
    state.settingsModalOpen ||
    state.languagesModalOpen ||
    state.applyStyleModalOpen ||
    state.translateModalState !== null ||
    state.duplicateUploadDialog !== null ||
    state.screenshotTranslationsModalId !== null
  );
}

/**
 * Editor keyboard shortcuts:
 * - Delete/Backspace: removes selected element
 * - Escape: clears element selection
 * - Arrow keys: nudge selected element position by 1% (Shift = 5%)
 *
 * No-op when focus is on an editable surface or when any dialog is open.
 */
export function useEditorKeyboardShortcuts(project: Project | null) {
  useEffect(() => {
    if (!project) return;

    const onKey = (e: KeyboardEvent) => {
      if (anyModalOpen(useEditorStore.getState())) return;
      if (isEditableTarget(e.target)) return;

      const { selectedElementId, activeScreenshotId } = useEditorStore.getState();

      if (e.key === "Escape") {
        if (selectedElementId) {
          e.preventDefault();
          useEditorStore.getState().setSelectedElementId(null);
        }
        return;
      }

      if (!selectedElementId || !activeScreenshotId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        useProjectsStore
          .getState()
          .updateScreenshot(project.id, activeScreenshotId, (s) => {
            s.elements = s.elements.filter((el) => el.id !== selectedElementId);
          });
        useEditorStore.getState().setSelectedElementId(null);
        return;
      }

      const step = e.shiftKey ? 5 : 1;
      const arrows: Record<string, [number, number]> = {
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
      };
      const delta = arrows[e.key];
      if (!delta) return;
      e.preventDefault();
      useProjectsStore
        .getState()
        .updateScreenshot(project.id, activeScreenshotId, (s) => {
          const el = s.elements.find((x) => x.id === selectedElementId);
          if (!el) return;
          el.positionX = Math.min(100, Math.max(0, el.positionX + delta[0]));
          el.positionY = Math.min(100, Math.max(0, el.positionY + delta[1]));
        });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project]);
}
