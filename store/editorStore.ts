"use client";

import { create } from "zustand";
import type { Locale } from "@/lib/types/project";

export type RightPanelTab =
  | "background"
  | "device"
  | "text"
  | "elements"
  | "popouts";

export type TranslateField = "headline" | "subheadline" | "element";

export interface TranslateModalState {
  open: boolean;
  field: TranslateField;
  elementId?: string;
}

export type DuplicateUploadAction = "replace" | "create" | "ignore";

export interface DuplicateUploadDialogState {
  open: boolean;
  baseFilename: string;
  matchedScreenshotId: string;
  locale: Locale;
  resolve: (action: DuplicateUploadAction) => void;
}

interface EditorState {
  activeScreenshotId: string | null;
  activeLocale: Locale;
  rightPanelTab: RightPanelTab;
  zoom: number;
  showSafeArea: boolean;
  exportModalOpen: boolean;

  transferTarget: string | null;
  selectedElementId: string | null;
  selectedPopoutId: string | null;

  isSliding: boolean;
  slidingDirection: "left" | "right" | null;

  settingsModalOpen: boolean;
  aboutModalOpen: boolean;
  magicalTitlesModalOpen: boolean;
  languagesModalOpen: boolean;
  applyStyleModalOpen: boolean;
  exportLanguageDialogOpen: boolean;

  translateModalState: TranslateModalState | null;
  duplicateUploadDialog: DuplicateUploadDialogState | null;

  setActiveScreenshot: (id: string | null) => void;
  setActiveLocale: (locale: Locale) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setZoom: (zoom: number) => void;
  toggleSafeArea: () => void;
  setExportModalOpen: (open: boolean) => void;

  setTransferTarget: (id: string | null) => void;
  setSelectedElementId: (id: string | null) => void;
  setSelectedPopoutId: (id: string | null) => void;
  setSliding: (isSliding: boolean, direction?: "left" | "right" | null) => void;

  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openAboutModal: () => void;
  closeAboutModal: () => void;
  openMagicalTitlesModal: () => void;
  closeMagicalTitlesModal: () => void;
  openLanguagesModal: () => void;
  closeLanguagesModal: () => void;
  openApplyStyleModal: () => void;
  closeApplyStyleModal: () => void;
  setExportLanguageDialogOpen: (open: boolean) => void;

  openTranslateModal: (opts: { field: TranslateField; elementId?: string }) => void;
  closeTranslateModal: () => void;

  setDuplicateUploadDialog: (state: DuplicateUploadDialogState | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeScreenshotId: null,
  activeLocale: "tr",
  rightPanelTab: "background",
  zoom: 0.35,
  showSafeArea: false,
  exportModalOpen: false,

  transferTarget: null,
  selectedElementId: null,
  selectedPopoutId: null,

  isSliding: false,
  slidingDirection: null,

  settingsModalOpen: false,
  aboutModalOpen: false,
  magicalTitlesModalOpen: false,
  languagesModalOpen: false,
  applyStyleModalOpen: false,
  exportLanguageDialogOpen: false,

  translateModalState: null,
  duplicateUploadDialog: null,

  setActiveScreenshot: (id) => set({ activeScreenshotId: id }),
  setActiveLocale: (locale) => set({ activeLocale: locale }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(1.5, zoom)) }),
  toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),
  setExportModalOpen: (open) => set({ exportModalOpen: open }),

  setTransferTarget: (id) => set({ transferTarget: id }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setSelectedPopoutId: (id) => set({ selectedPopoutId: id }),
  setSliding: (isSliding, direction = null) =>
    set({ isSliding, slidingDirection: direction }),

  openSettingsModal: () => set({ settingsModalOpen: true }),
  closeSettingsModal: () => set({ settingsModalOpen: false }),
  openAboutModal: () => set({ aboutModalOpen: true }),
  closeAboutModal: () => set({ aboutModalOpen: false }),
  openMagicalTitlesModal: () => set({ magicalTitlesModalOpen: true }),
  closeMagicalTitlesModal: () => set({ magicalTitlesModalOpen: false }),
  openLanguagesModal: () => set({ languagesModalOpen: true }),
  closeLanguagesModal: () => set({ languagesModalOpen: false }),
  openApplyStyleModal: () => set({ applyStyleModalOpen: true }),
  closeApplyStyleModal: () => set({ applyStyleModalOpen: false }),
  setExportLanguageDialogOpen: (open) => set({ exportLanguageDialogOpen: open }),

  openTranslateModal: ({ field, elementId }) =>
    set({ translateModalState: { open: true, field, elementId } }),
  closeTranslateModal: () => set({ translateModalState: null }),

  setDuplicateUploadDialog: (state) => set({ duplicateUploadDialog: state }),
}));
