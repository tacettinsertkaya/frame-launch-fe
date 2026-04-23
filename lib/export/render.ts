import { toPng } from "html-to-image";

export interface ExportOptions {
  /** çıktı genişliği (px). Boş bırakılırsa node'un kendi boyutu kullanılır. */
  pixelWidth?: number;
  pixelHeight?: number;
  /** kalite: 1 = kayıpsız, 0..1 sıkıştırma (sadece PNG'de yok sayılır). */
  cacheBust?: boolean;
}

export async function renderNodeToPng(
  node: HTMLElement,
  opts: ExportOptions = {},
): Promise<string> {
  const { offsetWidth, offsetHeight } = node;
  const width = opts.pixelWidth ?? offsetWidth;
  const height = opts.pixelHeight ?? offsetHeight;
  const pixelRatio = width / Math.max(1, offsetWidth);

  // Fontların yüklenmesini bekle
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* noop */
    }
  }

  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio,
    cacheBust: opts.cacheBust ?? true,
    canvasWidth: width,
    canvasHeight: height,
    skipFonts: false,
    backgroundColor: undefined,
  });
  return dataUrl;
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
