import type { Screenshot } from "@/lib/types/project";
import { uid } from "@/lib/utils";

/**
 * appscreen `transferStyle` / `applyStyleToAll` ile aynı fikir:
 * — background, device, çıktı boyutu, metin **stili** kopyalanır
 * — headline/subheadline **metin içeriği** (locale string’leri) hedefte kalır
 * — languageLayouts hedefte kalır
 * — uploads / uploadMeta / popouts / id / name dokunulmaz
 * — elements yeni id ile kopyalanır (graphic blobId aynı kalır)
 */
export function copyScreenshotStyleFromTo(source: Screenshot, target: Screenshot): void {
  target.background = structuredClone(source.background);
  target.device = structuredClone(source.device);
  target.deviceSizeId = source.deviceSizeId;
  if (source.customDimensions) {
    target.customDimensions = structuredClone(source.customDimensions);
  } else {
    delete target.customDimensions;
  }

  const headText = { ...target.text.headline.text };
  const subText = { ...target.text.subheadline.text };
  const layouts = { ...target.text.languageLayouts };

  target.text = structuredClone(source.text);
  target.text.headline.text = headText;
  target.text.subheadline.text = subText;
  target.text.languageLayouts = layouts;

  target.elements = source.elements.map((el) => ({
    ...structuredClone(el),
    id: uid("el_"),
  }));
}
