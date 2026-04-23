# 04 — Multilingual UI (no AI) — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire project-level locales to the editor, port filename detection, add duplicate-upload and per-screenshot translations modals, and a languages management modal—matching appscreen flows without AI translation.

**Architecture:** Pure helpers in `lib/i18n/`; modals use existing `Dialog` + `sonner`; upload flows call shared `handleImageUploadForScreenshot` (or similar) that centralizes blob save + duplicate branching. Sync `editorStore.activeLocale` with `project.currentLocale` on project switch and on user language change.

**Tech Stack:** Zustand, Radix-backed Dialog, IndexedDB `saveBlob`, existing `Project` / `Screenshot` types.

**Spec:** `docs/superpowers/specs/2026-04-23-04-multilingual-ui-design.md`

---

## File map

| File | Action |
|------|--------|
| `lib/i18n/filenameLocale.ts` | **New** — `getBaseFilename`, `detectLocaleFromFilename`, `ALL_LOCALES` constant |
| `lib/i18n/filenameLocale.test.ts` | **New** |
| `lib/i18n/findDuplicateUpload.ts` | **New** — `findScreenshotIdByUploadBaseName(project, baseName, excludeScreenshotId?)` |
| `lib/i18n/findDuplicateUpload.test.ts` | **New** |
| `components/editor/modals/DuplicateUploadModal.tsx` | **New** — binds to `editorStore.duplicateUploadDialog` |
| `components/editor/modals/ScreenshotTranslationsModal.tsx` | **New** |
| `components/editor/modals/LanguagesModal.tsx` | **New** |
| `components/editor/EditorShell.tsx` | **Modify** — mount modals; sync `activeLocale` from `project.currentLocale` on project / hydrate |
| `components/editor/Topbar.tsx` | **Modify** — locale select → `setCurrentLocale`; Languages icon → `openLanguagesModal` |
| `components/editor/ScreenshotsSidebar.tsx` | **Modify** — menu or button → open translations modal |
| `components/editor/panels/DevicePanel.tsx` | **Modify** — file pick runs duplicate-aware upload helper |
| `store/projectsStore.ts` | **Modify** — `removeLocale` clears `uploads`/`uploadMeta` for removed locale on all screenshots (optional small helper in store) |

---

## Tasks

- [ ] **Task 1** — Implement `filenameLocale.ts` + tests (`getBaseFilename`, `detectLocaleFromFilename` with `Locale[]` sorted by code length).
- [ ] **Task 2** — Implement `findDuplicateUpload.ts` + tests: match by `uploadMeta[loc]?.originalFilename` or infer from keys; exclude self when uploading to same screenshot replace path.
- [ ] **Task 3** — `DuplicateUploadModal`: subscribe to `duplicateUploadDialog`, render three actions, call `resolve`, then `setDuplicateUploadDialog(null)`.
- [ ] **Task 4** — Extract or add `uploadScreenshotImage(projectId, screenshotId, locale, file)` in a small module used by `DevicePanel` and translations modal; inside: duplicate check → dialog promise → `saveBlob` + `updateScreenshot`.
- [ ] **Task 5** — `ScreenshotTranslationsModal`: props `project`, `screenshotId`, `open`, `onOpenChange`; list `activeLocales`; upload/remove per locale.
- [ ] **Task 6** — `LanguagesModal`: add/remove locales; call `addLocale` / `removeLocale`; toast on invalid remove.
- [ ] **Task 7** — `EditorShell`: `useEffect` when `project?.currentLocale` changes → `setActiveLocale(project.currentLocale)`; render the three modals.
- [ ] **Task 8** — `Topbar`: wire locale `select` to `setCurrentLocale(project.id, locale)` then `setActiveLocale(locale)`; wire `Languages` icon to `openLanguagesModal` (avoid duplicate handlers if select is removed from header later).
- [ ] **Task 9** — `ScreenshotsSidebar`: overflow menu per row with “Çeviriler” opening modal with active screenshot id.
- [ ] **Task 10** — Ensure `uploadMeta` stores original filename on upload for duplicate matching (if not already).
- [ ] **Task 11** — `tsc` + `vitest` + `next build`; manual smoke: two locales, duplicate filename, translations modal.

---

## Commit

Split optional: `docs(parity): #04 multilingual ui spec` then `feat(editor): #04 ...` for code.
