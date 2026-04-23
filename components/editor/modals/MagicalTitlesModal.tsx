"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Locale } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LOCALE_LABELS } from "@/lib/i18n/localeLabels";
import { buildMagicalTitlesPrompt } from "@/lib/ai/magicalTitlesPrompt";
import {
  generateMagicalTitlesVision,
  parseMagicalTitlesResponse,
} from "@/lib/ai/magicalTitlesVision";
import { collectVisionImagesForProject } from "@/lib/ai/magicalTitlesImages";

type Phase = "confirm" | "running";

export function MagicalTitlesModal() {
  const open = useEditorStore((s) => s.magicalTitlesModalOpen);
  const close = useEditorStore((s) => s.closeMagicalTitlesModal);

  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);

  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const selectedModels = useSettingsStore((s) => s.selectedModels);

  const project = projects.find((p) => p.id === activeProjectId) ?? null;

  const [locale, setLocale] = useState<Locale>("tr");
  const [phase, setPhase] = useState<Phase>("confirm");

  useEffect(() => {
    if (!open || !project) return;
    setPhase("confirm");
    setLocale(
      project.activeLocales.includes(project.currentLocale)
        ? project.currentLocale
        : project.activeLocales[0]!,
    );
  }, [open, project?.id, project?.currentLocale, project?.activeLocales]);

  if (!open || !project) return null;

  const n = project.screenshots.length;
  const key = apiKeys[aiProvider].trim();
  const model = selectedModels[aiProvider];

  const onGenerate = async () => {
    if (n === 0) {
      toast.info("Önce ekran görüntüsü ekleyin.");
      return;
    }
    if (!key) {
      toast.error("Önce Ayarlar’dan API anahtarı girin.");
      return;
    }

    setPhase("running");
    try {
      const { images, missing } = await collectVisionImagesForProject(
        project.screenshots,
        locale,
        project.activeLocales,
      );
      if (missing.length > 0) {
        toast.error(`Görsel eksik: ${missing.join(", ")}`);
        setPhase("confirm");
        return;
      }
      if (images.length !== project.screenshots.length) {
        toast.error("Bazı görseller yüklenemedi.");
        setPhase("confirm");
        return;
      }

      const langName = LOCALE_LABELS[locale] ?? locale;
      const prompt = buildMagicalTitlesPrompt(images.length, langName);
      const raw = await generateMagicalTitlesVision({
        provider: aiProvider,
        apiKey: key,
        model,
        images,
        prompt,
      });
      const titles = parseMagicalTitlesResponse(raw);

      for (let i = 0; i < project.screenshots.length; i++) {
        const row = titles[String(i)];
        if (!row) continue;
        const sid = project.screenshots[i]!.id;
        updateScreenshot(project.id, sid, (s) => {
          if (row.headline) {
            s.text.headline.text = { ...s.text.headline.text, [locale]: row.headline };
            s.text.headline.enabled = true;
          }
          if (row.subheadline) {
            s.text.subheadline.text = { ...s.text.subheadline.text, [locale]: row.subheadline };
            s.text.subheadline.enabled = true;
          }
        });
      }

      toast.success(`${Object.keys(titles).length} ekran için başlıklar üretildi (${langName}).`);
      close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "AI_UNAVAILABLE") {
        toast.error("API anahtarı geçersiz veya vision erişimi yok.");
      } else if (e instanceof SyntaxError) {
        toast.error("AI yanıtı çözümlenemedi. Tekrar deneyin.");
      } else {
        toast.error(`Hata: ${msg}`);
      }
      setPhase("confirm");
    }
  };

  return (
    <Dialog
      open
      onClose={() => {
        if (phase === "confirm") close();
      }}
      title="Sihirli başlıklar"
      maxWidth="480px"
    >
      {phase === "running" ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-brand-primary)]" />
          <p className="text-sm text-[var(--color-ink-body)]">
            {n} görsel analiz ediliyor… Bu biraz sürebilir.
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-[var(--color-ink-body)]">
          <p>
            Tüm ekran görsellerinizi seçtiğiniz dilde kısa <strong>headline</strong> ve{" "}
            <strong>subheadline</strong> metinleri üretmek için AI kullanılır. Mevcut metinler bu
            dilde üzerine yazılır.
          </p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Sağlayıcı: <strong>{aiProvider}</strong> — vision destekli bir model seçtiğinizden emin
            olun (Ayarlar).
          </p>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
              Üretim dili
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-2 py-2 text-xs"
            >
              {project.activeLocales.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {n} ekran · her ekranda bu dil veya yedek dilde yüklenmiş görsel gerekir.
          </p>
          <div className="flex justify-end gap-2 border-t border-[var(--color-surface-2)] pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              İptal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void onGenerate()}
              className="inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Üret
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
