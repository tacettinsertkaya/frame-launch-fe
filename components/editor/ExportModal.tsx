"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadDataUrl, renderNodeToPng } from "@/lib/export/render";
import { getEffectiveDimensions } from "@/lib/devices/registry";

interface Props {
  project: Project | null;
}

export function ExportModal({ project }: Props) {
  const open = useEditorStore((s) => s.exportModalOpen);
  const setOpen = useEditorStore((s) => s.setExportModalOpen);
  const activeScreenshotId = useEditorStore((s) => s.activeScreenshotId);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  if (!project) return null;

  const exportNode = async (
    screenshotId: string,
    filename: string,
  ): Promise<void> => {
    const node = document.querySelector<HTMLElement>(
      `[data-screenshot-id="${screenshotId}"] [data-fl-canvas]`,
    );
    if (!node) {
      throw new Error(`Render node not found for screenshot ${screenshotId}`);
    }
    const screenshot = project.screenshots.find((s) => s.id === screenshotId)!;
    const dims = getEffectiveDimensions(screenshot.deviceSizeId, screenshot.customDimensions);
    const url = await renderNodeToPng(node, {
      pixelWidth: dims.width,
      pixelHeight: dims.height,
    });
    downloadDataUrl(url, filename);
  };

  const exportActive = async () => {
    if (!activeScreenshotId) return;
    setBusy(true);
    try {
      const screenshot = project.screenshots.find((s) => s.id === activeScreenshotId);
      const filename = `${slug(project.name)}__${slug(screenshot?.name ?? activeScreenshotId)}.png`;
      await exportNode(activeScreenshotId, filename);
    } catch (err) {
      console.error(err);
      alert("Dışa aktarım sırasında hata oluştu. Konsolu kontrol edin.");
    } finally {
      setBusy(false);
    }
  };

  const exportAll = async () => {
    setBusy(true);
    setProgress({ done: 0, total: project.screenshots.length });
    try {
      for (let i = 0; i < project.screenshots.length; i++) {
        const s = project.screenshots[i];
        const filename = `${slug(project.name)}__${String(i + 1).padStart(2, "0")}-${slug(s.name)}.png`;
        await exportNode(s.id, filename);
        setProgress({ done: i + 1, total: project.screenshots.length });
        await new Promise((r) => setTimeout(r, 60));
      }
    } catch (err) {
      console.error(err);
      alert("Toplu dışa aktarımda hata oluştu.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && setOpen(false)} title="Dışa aktar">
      <div className="space-y-5">
        <p className="text-sm text-[var(--color-ink-body)]">
          Görseller doğrudan piksel-piksel marketler için doğru çözünürlükte indirilir.
          Watermark yoktur, hesap yoktur, hiçbir veri sunucuya gitmez.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            disabled={busy || !activeScreenshotId}
            onClick={exportActive}
            className="group flex flex-col items-start gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-surface-2)] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:shadow-[var(--shadow-md)] disabled:opacity-40"
          >
            <Download size={18} className="text-[var(--color-brand-primary)]" />
            <span className="text-sm font-semibold text-[var(--color-ink-strong)]">
              Aktif ekranı indir
            </span>
            <span className="text-xs text-[var(--color-ink-muted)]">
              Sadece şu anda görüntülediğiniz ekranı PNG olarak indirir.
            </span>
          </button>

          <button
            disabled={busy || project.screenshots.length === 0}
            onClick={exportAll}
            className="group flex flex-col items-start gap-1.5 rounded-[var(--radius-lg)] border-2 border-black bg-[var(--color-brand-primary)] p-4 text-left text-black shadow-[0_4px_16px_rgba(232,198,16,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Download size={18} className="text-black" />
            <span className="text-sm font-semibold">Tüm ekranları indir</span>
            <span className="text-xs text-black/70">
              Projedeki {project.screenshots.length} ekranı sırayla PNG olarak indirir.
            </span>
          </button>
        </div>

        {progress && (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-1)] px-3 py-2 text-xs text-[var(--color-ink-body)]">
            {progress.done}/{progress.total} indirildi…
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => !busy && setOpen(false)}>
            Kapat
          </Button>
          {busy && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
              <Loader2 size={14} className="animate-spin" />
              İşleniyor…
            </span>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ğ]/g, "g")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "ekran";
}
