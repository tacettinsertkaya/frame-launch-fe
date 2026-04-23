"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, Download, Loader2, Languages, Package } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import type { Locale, Project } from "@/lib/types/project";
import { LOCALE_LABELS } from "@/lib/i18n/localeLabels";
import { useEditorStore } from "@/store/editorStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadDataUrl, renderNodeToPng } from "@/lib/export/render";
import { dataUrlToBase64, downloadBlob } from "@/lib/export/blob";
import { getEffectiveDimensions } from "@/lib/devices/registry";

interface Props {
  project: Project | null;
}

type ExportFlow = "menu" | "scope";

export function ExportModal({ project }: Props) {
  const open = useEditorStore((s) => s.exportModalOpen);
  const setOpen = useEditorStore((s) => s.setExportModalOpen);
  const activeScreenshotId = useEditorStore((s) => s.activeScreenshotId);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const setActiveLocale = useEditorStore((s) => s.setActiveLocale);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; label?: string } | null>(
    null,
  );
  const [flow, setFlow] = useState<ExportFlow>("menu");

  useEffect(() => {
    if (open) setFlow("menu");
  }, [open]);

  const waitForPaintAfterLocaleSwitch = useCallback(
    async (locale: Locale) => {
      flushSync(() => {
        setActiveLocale(locale);
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 100);
          });
        });
      });
    },
    [setActiveLocale],
  );

  const capturePngDataUrl = useCallback(
    async (proj: Project, screenshotId: string): Promise<string> => {
      const node = document.querySelector<HTMLElement>(
        `[data-screenshot-id="${screenshotId}"] [data-fl-canvas]`,
      );
      if (!node) {
        throw new Error(`Render node not found for screenshot ${screenshotId}`);
      }
      const screenshot = proj.screenshots.find((s) => s.id === screenshotId)!;
      const dims = getEffectiveDimensions(screenshot.deviceSizeId, screenshot.customDimensions);
      return renderNodeToPng(node, {
        pixelWidth: dims.width,
        pixelHeight: dims.height,
      });
    },
    [],
  );

  const exportNodeDownload = useCallback(
    async (proj: Project, screenshotId: string, filename: string): Promise<void> => {
      const url = await capturePngDataUrl(proj, screenshotId);
      downloadDataUrl(url, filename);
    },
    [capturePngDataUrl],
  );

  const exportActive = async () => {
    if (!project || !activeScreenshotId) return;
    setBusy(true);
    try {
      const screenshot = project.screenshots.find((s) => s.id === activeScreenshotId);
      const filename = `${slug(project.name)}__${slug(screenshot?.name ?? activeScreenshotId)}.png`;
      await exportNodeDownload(project, activeScreenshotId, filename);
      toast.success("PNG indirildi");
    } catch (err) {
      console.error(err);
      toast.error("Dışa aktarım başarısız. Konsolu kontrol edin.");
    } finally {
      setBusy(false);
    }
  };

  const zipAndDownload = useCallback(
    async (
      build: (zip: JSZip) => Promise<void>,
      filename: string,
      savedLocale: Locale,
      progressTotal: number,
    ) => {
      if (!project) return;
      setBusy(true);
      setProgress({ done: 0, total: progressTotal, label: "ZIP hazırlanıyor…" });
      try {
        const zip = new JSZip();
        await build(zip);
        setProgress((p) => (p ? { ...p, label: "ZIP sıkıştırılıyor…" } : null));
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, filename);
        toast.success("ZIP indirildi");
        setOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("ZIP oluşturulamadı.");
      } finally {
        await waitForPaintAfterLocaleSwitch(savedLocale);
        setBusy(false);
        setProgress(null);
      }
    },
    [project, setOpen, waitForPaintAfterLocaleSwitch],
  );

  const runZipSingleLanguage = async (locale: Locale) => {
    if (!project) return;
    const savedLocale = activeLocale;
    const n = project.screenshots.length;
    await zipAndDownload(
      async (zip) => {
        await waitForPaintAfterLocaleSwitch(locale);
        for (let i = 0; i < n; i++) {
          const s = project.screenshots[i];
          const dataUrl = await capturePngDataUrl(project, s.id);
          zip.file(`screenshot-${String(i + 1).padStart(2, "0")}.png`, dataUrlToBase64(dataUrl), {
            base64: true,
          });
          setProgress({ done: i + 1, total: n, label: LOCALE_LABELS[locale] ?? locale });
        }
      },
      `${slug(project.name)}-${locale}-screenshots.zip`,
      savedLocale,
      n,
    );
  };

  const runZipAllLanguages = async () => {
    if (!project) return;
    const savedLocale = activeLocale;
    const langs = project.activeLocales;
    const perLang = project.screenshots.length;
    const total = langs.length * perLang;
    let done = 0;
    await zipAndDownload(
      async (zip) => {
        for (const loc of langs) {
          await waitForPaintAfterLocaleSwitch(loc);
          for (let i = 0; i < perLang; i++) {
            const s = project.screenshots[i];
            const dataUrl = await capturePngDataUrl(project, s.id);
            zip.file(
              `${loc}/screenshot-${String(i + 1).padStart(2, "0")}.png`,
              dataUrlToBase64(dataUrl),
              { base64: true },
            );
            done += 1;
            setProgress({
              done,
              total,
              label: `${LOCALE_LABELS[loc] ?? loc} · ${i + 1}/${perLang}`,
            });
          }
        }
      },
      `${slug(project.name)}-all-languages.zip`,
      savedLocale,
      total,
    );
  };

  const onExportAllClick = () => {
    if (!project || project.screenshots.length === 0) return;
    if (project.activeLocales.length > 1) {
      setFlow("scope");
      return;
    }
    void runZipSingleLanguage(project.activeLocales[0]!);
  };

  if (!project) return null;

  return (
    <Dialog
      open={open}
      onClose={() => !busy && setOpen(false)}
      title="Dışa aktar"
      description="Aktif ekranı veya tüm ekranları PNG/ZIP olarak indirin."
    >
      {flow === "scope" ? (
        <div className="space-y-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => setFlow("menu")}
            className="inline-flex items-center gap-1 rounded text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 disabled:opacity-50"
          >
            <ArrowLeft size={14} aria-hidden />
            Geri
          </button>
          <p className="text-sm text-[var(--color-ink-body)]">
            Projede birden fazla dil var. ZIP içeriğini seçin (metin ve görseller seçilen dile göre
            üretilir).
          </p>
          <div className="grid gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setFlow("menu");
                void runZipSingleLanguage(activeLocale);
              }}
              className="flex flex-col items-start gap-1 rounded-[var(--radius-lg)] border border-[var(--color-surface-2)] bg-white p-4 text-left transition-all hover:border-[var(--color-brand-primary)] hover:shadow-[var(--shadow-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-surface-2)] disabled:hover:shadow-none"
            >
              <Languages size={18} aria-hidden className="text-[var(--color-brand-primary)]" />
              <span className="text-sm font-semibold text-[var(--color-ink-strong)]">
                Yalnızca aktif dil
              </span>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {LOCALE_LABELS[activeLocale] ?? activeLocale} — tek ZIP, düz dosya listesi
                (screenshot-01.png …)
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setFlow("menu");
                void runZipAllLanguages();
              }}
              className="flex flex-col items-start gap-1 rounded-[var(--radius-lg)] border-2 border-black bg-[var(--color-brand-primary)] p-4 text-left text-black shadow-[0_4px_16px_rgba(232,198,16,0.35)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <Package size={18} aria-hidden />
              <span className="text-sm font-semibold">Tüm diller</span>
              <span className="text-xs text-black/70">
                Her dil için alt klasör ({project.activeLocales.join(", ")}) — aynı ZIP
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-[var(--color-ink-body)]">
            Görseller doğrudan piksel-piksel marketler için doğru çözünürlükte üretilir. Watermark
            yoktur; veri sunucuya gitmez. Toplu indirme bir ZIP arşividir.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy || !activeScreenshotId}
              onClick={exportActive}
              className="group flex flex-col items-start gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-surface-2)] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:shadow-[var(--shadow-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-[var(--color-surface-2)] disabled:hover:shadow-none"
            >
              <Download size={18} aria-hidden className="text-[var(--color-brand-primary)]" />
              <span className="text-sm font-semibold text-[var(--color-ink-strong)]">
                Aktif ekranı indir
              </span>
              <span className="text-xs text-[var(--color-ink-muted)]">
                Şu an seçili ekranı tek PNG olarak indirir.
              </span>
            </button>

            <button
              type="button"
              disabled={busy || project.screenshots.length === 0}
              onClick={onExportAllClick}
              className="group flex flex-col items-start gap-1.5 rounded-[var(--radius-lg)] border-2 border-black bg-[var(--color-brand-primary)] p-4 text-left text-black shadow-[0_4px_16px_rgba(232,198,16,0.35)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <Package size={18} aria-hidden />
              <span className="text-sm font-semibold">Tüm ekranları ZIP indir</span>
              <span className="text-xs text-black/70">
                {project.screenshots.length} ekran
                {project.activeLocales.length > 1
                  ? ` · ${project.activeLocales.length} dil — gerekirse kapsam seçilir`
                  : " · PNG dosyaları tek ZIP içinde"}
              </span>
            </button>
          </div>
        </div>
      )}

      {progress && (
        <div
          className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-surface-1)] px-3 py-2 text-xs text-[var(--color-ink-body)]"
          role="status"
          aria-live="polite"
        >
          <div className="mb-1 flex justify-between gap-2">
            <span className="tabular-nums">
              {progress.done}/{progress.total}
            </span>
            {progress.label && (
              <span className="min-w-0 truncate text-[var(--color-ink-muted)]">{progress.label}</span>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.done}
            aria-label="Dışa aktarım ilerlemesi"
            className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]"
          >
            <div
              className="h-full bg-[var(--color-brand-primary)] transition-[width] duration-150"
              style={{
                width: `${Math.min(100, Math.round((100 * progress.done) / progress.total))}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {busy && (
          <span className="mr-auto inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Loader2 size={14} aria-hidden className="animate-spin" />
            İşleniyor…
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={() => !busy && setOpen(false)} disabled={busy}>
          Kapat
        </Button>
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
