# 03 — Side Preview Carousel — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add appscreen-style side previews (±1, ±2) around the main canvas in `CanvasStage`, with 300ms horizontal slide animation on navigation and integration with existing `editorStore` sliding state.

**Architecture:** One wrapper with `overflow-hidden` centers the content; an inner “strip” uses CSS `transform: translateX(...)` + `transition` for the slide. Side cards are absolutely positioned relative to the strip’s center, using the same `Canvas` component with a computed `sidePreviewScale` from `getEffectiveDimensions` (max box 400×700). Clicks call `setActiveScreenshot` after the animation completes (or in the same tick as appscreen’s model — see Task 4). Export hidden canvases stay unchanged.

**Tech Stack:** React 19, Tailwind v4, Zustand (`setSliding`), existing `Canvas` — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-23-03-side-preview-carousel-design.md`

---

## File map

| File | Action |
|------|--------|
| `lib/editor/sidePreviewLayout.ts` | **New** — `computeSidePreviewScale`, `getSidePreviewSlotIndices` (pure, unit-tested) |
| `lib/editor/sidePreviewLayout.test.ts` | **New** |
| `components/editor/canvas/SidePreviewStrip.tsx` (or `SidePreviewArea.tsx`) | **New** — layout + side `Canvas` + click handlers |
| `components/editor/CanvasStage.tsx` | **Modify** — compose strip, pass `project`, `activeScreenshot`, `zoom`, wire `setSliding` |
| `store/editorStore.ts` | **Verify** — `setSliding` implementation matches use (no change if already correct) |

---

## Tasks

- [ ] **Task 1** — Add `lib/editor/sidePreviewLayout.ts` with:
  - `MAX_SIDE_PREVIEW_W = 400`, `MAX_SIDE_PREVIEW_H = 700`, `SIDE_GAP = 10`
  - `computeSidePreviewScale(width, height): number` → `min(MAX_W/width, MAX_H/height, 1)` (or match spec rounding)
  - `getSidePreviewSlotIndices(activeIndex, length): { farLeft, left, right, farRight }` each `number | null` for indices
- [ ] **Task 2** — `sidePreviewLayout.test.ts`: edge cases (0 screenshots, 1, 2, 3+; first/last active index; far slots null when out of range)
- [ ] **Task 3** — Implement `SidePreviewStrip` (or split `SidePreviewCard` memoized):
  - Props: `project`, `activeId`, `locale`, `zoom`, `onRequestNavigate: (id: string, direction: 'left' | 'right') => void` OR parent owns slide state
  - For each non-null slot index, render a clickable wrapper with `Canvas screenshot={...} scale={sideScale}`; opacity/hover per spec
  - Main canvas stays in the center; measure main width via `ref` + `ResizeObserver` or `useLayoutEffect` for `slideDistance`
- [ ] **Task 4** — Slide animation sequence (match appscreen):
  1. `setSliding(true, direction)`
  2. Set strip `translateX(±(mainWidth + 10))` 
  3. `setTimeout(300, ...)` (or `transitionend` on strip): `setActiveScreenshot(targetId)`, reset `translateX(0)` with `transition: none` for one frame, then re-enable transition
  4. `setSliding(false, null)`
  - **Important:** Avoid flash — if first implementation flickers, apply `flushSync` or double-rAF like appscreen (document in code comment)
- [ ] **Task 5** — `CanvasStage`: remove the “only centered single div” layout; integrate strip; keep hidden export block as-is; ensure `fitZoom` / container ref still work
- [ ] **Task 6** — A11y: `aria-label` on side buttons (“Önceki ekran”, “Sonraki ekran”); `aria-hidden` on decorative strip during slide if needed
- [ ] **Task 7** — Run `pnpm tsc --noEmit`, `pnpm vitest run`, `pnpm build`
- [ ] **Task 8** — Manual: project with 4 screenshots, click left/right/far, verify animation and right panel; single screenshot: no side cards

---

## Out of scope (this PR)

- Keyboard ←/→ (fast-follow)
- 3D side preview rendering (#13)

---

## Commit

`feat(editor): #03 side preview carousel` (or split `docs` then `feat` commits per team preference; parity workflow often commits spec first)
