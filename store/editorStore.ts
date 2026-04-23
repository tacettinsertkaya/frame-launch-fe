"use client";

import { create } from "zustand";
import type { Locale } from "@/lib/types/project";

export type RightPanelTab = "background" | "device" | "text" | "elements" | "export";

interface EditorState {
  activeScreenshotId: string | null;
  activeLocale: Locale;
  rightPanelTab: RightPanelTab;
  zoom: number;
  showSafeArea: boolean;
  exportModalOpen: boolean;

  setActiveScreenshot: (id: string | null) => void;
  setActiveLocale: (locale: Locale) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setZoom: (zoom: number) => void;
  toggleSafeArea: () => void;
  setExportModalOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeScreenshotId: null,
  activeLocale: "tr",
  rightPanelTab: "background",
  zoom: 0.35,
  showSafeArea: false,
  exportModalOpen: false,

  setActiveScreenshot: (id) => set({ activeScreenshotId: id }),
  setActiveLocale: (locale) => set({ activeLocale: locale }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(1.5, zoom)) }),
  toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
}));
