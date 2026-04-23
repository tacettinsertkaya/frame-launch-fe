/**
 * Parity: appscreen `updateSidePreviews` (max 400×700) + strip gap 10px + slide 300ms.
 */
export const SIDE_GAP_PX = 10;
export const MAX_SIDE_PREVIEW_WIDTH = 400;
export const MAX_SIDE_PREVIEW_HEIGHT = 700;
export const SLIDE_ANIMATION_MS = 300;

export function computeSidePreviewScale(
  contentWidth: number,
  contentHeight: number,
): number {
  if (contentWidth <= 0 || contentHeight <= 0) return 0.25;
  return Math.min(
    MAX_SIDE_PREVIEW_WIDTH / contentWidth,
    MAX_SIDE_PREVIEW_HEIGHT / contentHeight,
    1,
  );
}

export interface SidePreviewSlotIndices {
  farLeft: number | null;
  left: number | null;
  right: number | null;
  farRight: number | null;
}

/**
 * @param activeIndex — currently selected index in [0, length-1]
 */
export function getSidePreviewSlotIndices(
  activeIndex: number,
  length: number,
): SidePreviewSlotIndices {
  if (length <= 0) {
    return { farLeft: null, left: null, right: null, farRight: null };
  }
  const a = Math.max(0, Math.min(activeIndex, length - 1));
  return {
    farLeft: a - 2 >= 0 ? a - 2 : null,
    left: a - 1 >= 0 ? a - 1 : null,
    right: a + 1 < length ? a + 1 : null,
    farRight: a + 2 < length ? a + 2 : null,
  };
}
