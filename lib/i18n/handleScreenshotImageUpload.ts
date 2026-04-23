import type { Locale, Project } from "@/lib/types/project";
import { saveBlob } from "@/lib/persistence/blobStore";
import { nowIso } from "@/lib/utils";
import { useEditorStore } from "@/store/editorStore";
import type { DuplicateUploadAction } from "@/store/editorStore";
import { makeBlankScreenshot, useProjectsStore } from "@/store/projectsStore";
import { detectLocaleFromFilename, getBaseFilename } from "./filenameLocale";
import { findScreenshotIdByUploadBaseName } from "./findDuplicateUpload";

async function applyUploadToLocale(
  projectId: string,
  screenshotId: string,
  locale: Locale,
  file: File,
  activeLocales: readonly Locale[],
): Promise<void> {
  const blobId = await saveBlob(file);
  const baseFn = getBaseFilename(file.name, activeLocales);
  useProjectsStore.getState().updateScreenshot(projectId, screenshotId, (s) => {
    s.uploads = { ...s.uploads, [locale]: blobId };
    s.uploadMeta = {
      ...s.uploadMeta,
      [locale]: {
        filename: file.name,
        baseFilename: baseFn,
        uploadedAt: nowIso(),
      },
    };
  });
}

/**
 * appscreen `processImageFile` / DevicePanel yükleme mantığı:
 * - Base isim eşleşmesi + hedef dilde görsel varsa → duplicate dialog
 * - Eşleşme var ama o dilde görsel yoksa → eşleşen satıra sessizce ekle
 * - Eşleşme yoksa → `targetScreenshotId` + `activeLocale` slotuna yazar
 */
/** @param slotLocale — Blob'un yazılacağı dil (Device panel: aktif dil; çeviriler modal'ı: satır dili). */
export function handleScreenshotImageUpload(
  project: Project,
  targetScreenshotId: string,
  file: File,
  slotLocale: Locale,
): Promise<void> {
  const projectId = project.id;
  const detected = detectLocaleFromFilename(
    file.name,
    project.activeLocales,
    project.defaultLocale,
  );
  const base = getBaseFilename(file.name, project.activeLocales);

  const matchId = findScreenshotIdByUploadBaseName(project, base);

  if (!matchId) {
    return applyUploadToLocale(
      projectId,
      targetScreenshotId,
      slotLocale,
      file,
      project.activeLocales,
    );
  }

  const matched = project.screenshots.find((s) => s.id === matchId);
  if (!matched) {
    return applyUploadToLocale(
      projectId,
      targetScreenshotId,
      slotLocale,
      file,
      project.activeLocales,
    );
  }

  const hasImageForDetected = !!matched.uploads?.[detected];

  if (!hasImageForDetected) {
    return applyUploadToLocale(
      projectId,
      matchId,
      detected,
      file,
      project.activeLocales,
    );
  }

  return new Promise<void>((resolvePromise) => {
    useEditorStore.getState().setDuplicateUploadDialog({
      open: true,
      baseFilename: base,
      matchedScreenshotId: matchId,
      targetScreenshotId,
      locale: detected,
      pendingFile: file,
      resolve: (action: DuplicateUploadAction) => {
        useEditorStore.getState().setDuplicateUploadDialog(null);
        void (async () => {
          if (action === "ignore") {
            resolvePromise();
            return;
          }
          if (action === "replace") {
            await applyUploadToLocale(
              projectId,
              matchId,
              detected,
              file,
              project.activeLocales,
            );
            resolvePromise();
            return;
          }
          const fresh = useProjectsStore
            .getState()
            .projects.find((x) => x.id === projectId);
          if (!fresh) {
            resolvePromise();
            return;
          }
          const matchedFresh = fresh.screenshots.find((s) => s.id === matchId)!;
          const template =
            fresh.screenshots.find((s) => s.id === targetScreenshotId) ??
            matchedFresh;
          const ns = makeBlankScreenshot(base || "Yeni ekran");
          ns.deviceSizeId = template.deviceSizeId;
          ns.customDimensions = template.customDimensions;
          ns.device = structuredClone(template.device);
          ns.background = structuredClone(template.background);
          useProjectsStore.getState().addScreenshot(projectId, ns);
          await applyUploadToLocale(
            projectId,
            ns.id,
            detected,
            file,
            fresh.activeLocales,
          );
          useEditorStore.getState().setActiveScreenshot(ns.id);
          resolvePromise();
        })();
      },
    });
  });
}
