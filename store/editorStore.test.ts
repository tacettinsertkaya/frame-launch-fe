/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "./editorStore";

function reset() {
  useEditorStore.setState({
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
    languagesModalOpen: false,
    applyStyleModalOpen: false,
    applyStyleSourceScreenshotId: null,
    translateModalState: null,
    duplicateUploadDialog: null,
    screenshotTranslationsModalId: null,
    exportLanguageDialogOpen: false,
  });
}

describe("editorStore extensions", () => {
  beforeEach(reset);

  it("setTransferTarget updates value", () => {
    useEditorStore.getState().setTransferTarget("s_1");
    expect(useEditorStore.getState().transferTarget).toBe("s_1");
  });

  it("openTranslateModal sets translateModalState with field", () => {
    useEditorStore.getState().openTranslateModal({ field: "headline", screenshotId: "s1" });
    expect(useEditorStore.getState().translateModalState).toEqual({
      open: true,
      field: "headline",
      screenshotId: "s1",
      elementId: undefined,
    });
  });

  it("closeTranslateModal sets translateModalState null", () => {
    useEditorStore.getState().openTranslateModal({ field: "subheadline", screenshotId: "s1" });
    useEditorStore.getState().closeTranslateModal();
    expect(useEditorStore.getState().translateModalState).toBeNull();
  });

  it("RightPanelTab now accepts popouts", () => {
    useEditorStore.getState().setRightPanelTab("popouts");
    expect(useEditorStore.getState().rightPanelTab).toBe("popouts");
  });

  it("setSliding updates flag and direction", () => {
    useEditorStore.getState().setSliding(true, "left");
    expect(useEditorStore.getState().isSliding).toBe(true);
    expect(useEditorStore.getState().slidingDirection).toBe("left");
  });

  it("setActiveScreenshot clears selectedElementId when switching screenshot", () => {
    useEditorStore.setState({ activeScreenshotId: "a", selectedElementId: "el_1" });
    useEditorStore.getState().setActiveScreenshot("b");
    expect(useEditorStore.getState().activeScreenshotId).toBe("b");
    expect(useEditorStore.getState().selectedElementId).toBeNull();
  });

  it("setActiveScreenshot keeps selectedElementId when same screenshot", () => {
    useEditorStore.setState({ activeScreenshotId: "a", selectedElementId: "el_1" });
    useEditorStore.getState().setActiveScreenshot("a");
    expect(useEditorStore.getState().selectedElementId).toBe("el_1");
  });
});
