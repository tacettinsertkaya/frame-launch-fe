"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale, Project } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { handleScreenshotImageUpload } from "@/lib/i18n/handleScreenshotImageUpload";
import { getBlobUrl } from "@/lib/persistence/blobStore";

const LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  pt: "Português",
};

interface Props {
  project: Project;
}

export function ScreenshotTranslationsModal({ project }: Props) {
  const screenshotId = useEditorStore((s) => s.screenshotTranslationsModalId);
  const close = useEditorStore((s) => s.closeScreenshotTranslationsModal);
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [targetLocale, setTargetLocale] = useState<Locale | null>(null);
  const [thumb, setThumb] = useState<Partial<Record<Locale, string | null>>>({});

  const screenshot = project.screenshots.find((s) => s.id === screenshotId) ?? null;

  useEffect(() => {
    if (!screenshot) return;
    let cancelled = false;
    const next: Partial<Record<Locale, string | null>> = {};
    void (async () => {
      for (const loc of project.activeLocales) {
        const id = screenshot.uploads[loc];
        if (id) {
          const u = await getBlobUrl(id);
          if (!cancelled) next[loc] = u ?? null;
        } else if (!cancelled) next[loc] = null;
      }
      if (!cancelled) setThumb(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [screenshot, project.activeLocales]);

  const open = Boolean(screenshotId && screenshot);

  const onPick = (locale: Locale) => {
    setTargetLocale(locale);
    inputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !screenshot || !targetLocale) return;
    const loc = targetLocale;
    if (!loc) return;
    await handleScreenshotImageUpload(project, screenshot.id, f, loc);
    setTargetLocale(null);
  };

  const remove = (locale: Locale) => {
    if (!screenshot) return;
    updateScreenshot(project.id, screenshot.id, (s) => {
      const u = { ...s.uploads };
      delete u[locale];
      s.uploads = u;
      const m = { ...s.uploadMeta };
      delete m[locale];
      s.uploadMeta = Object.keys(m).length ? m : undefined;
    });
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={screenshot ? `Çeviriler — ${screenshot.name}` : "Çeviriler"}
      description="Bu ekran için dile özel görselleri yönet"
      maxWidth="520px"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
        aria-label="Görsel seç"
      />
      {!screenshot ? null : (
        <ul className="space-y-3" role="list">
          {project.activeLocales.map((loc) => {
            const has = Boolean(screenshot.uploads[loc]);
            return (
              <li
                key={loc}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-surface-2)] p-3"
              >
                <div className="flex h-16 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--color-surface-1)]">
                  {thumb[loc] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb[loc]!}
                      alt={`${LABELS[loc]} önizlemesi`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-[var(--color-ink-muted)]" aria-hidden>
                      —
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[var(--color-ink-strong)]">
                    {LABELS[loc]}
                  </div>
                  <div className="text-xs text-[var(--color-ink-muted)]">{loc}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onPick(loc)}
                    aria-label={`${LABELS[loc]} için görsel ${has ? "değiştir" : "yükle"}`}
                  >
                    {has ? "Değiştir" : "Yükle"}
                  </Button>
                  {has && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => remove(loc)}
                      aria-label={`${LABELS[loc]} görselini kaldır`}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={close}>
          Tamam
        </Button>
      </div>
    </Dialog>
  );
}
