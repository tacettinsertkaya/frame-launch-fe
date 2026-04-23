import type { Locale, Screenshot } from "@/lib/types/project";
import { getBlob } from "@/lib/persistence/blobStore";
import type { VisionImagePart } from "./magicalTitlesVision";

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mimeType: m[1], base64: m[2] };
}

export function resolveUploadBlobId(
  uploads: Screenshot["uploads"],
  preferred: Locale,
  fallbacks: readonly Locale[],
): string | undefined {
  if (uploads[preferred]) return uploads[preferred];
  for (const l of fallbacks) {
    if (uploads[l]) return uploads[l];
  }
  return undefined;
}

export async function blobIdToVisionPart(blobId: string): Promise<VisionImagePart | null> {
  const blob = await getBlob(blobId);
  if (!blob) return null;
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const s = fr.result as string;
      const p = parseDataUrl(s);
      resolve(p);
    };
    fr.onerror = () => reject(fr.error ?? new Error("read failed"));
    fr.readAsDataURL(blob);
  });
}

/** Returns images in screenshot order; `missing` lists screenshot names without any resolvable blob. */
export async function collectVisionImagesForProject(
  screenshots: Screenshot[],
  preferredLocale: Locale,
  fallbacks: readonly Locale[],
): Promise<{ images: VisionImagePart[]; missing: string[] }> {
  const images: VisionImagePart[] = [];
  const missing: string[] = [];

  for (const shot of screenshots) {
    const blobId = resolveUploadBlobId(shot.uploads, preferredLocale, fallbacks);
    if (!blobId) {
      missing.push(shot.name);
      continue;
    }
    const part = await blobIdToVisionPart(blobId);
    if (!part) {
      missing.push(shot.name);
      continue;
    }
    images.push(part);
  }

  return { images, missing };
}
