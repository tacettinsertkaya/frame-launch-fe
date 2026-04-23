"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { Locale, Project, Screenshot } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LOCALE_LABELS } from "@/lib/i18n/localeLabels";
import { buildMarketingTranslationPrompt } from "@/lib/ai/translationPrompt";
import { callLlmForText } from "@/lib/ai/translateClient";
import { parseTranslationJsonResponse } from "@/lib/ai/parseTranslationJson";

export function TranslateModal() {
  const state = useEditorStore((s) => s.translateModalState);
  const close = useEditorStore((s) => s.closeTranslateModal);

  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);

  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const selectedModels = useSettingsStore((s) => s.selectedModels);

  const project = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  const screenshot = useMemo(() => {
    if (!project || !state?.screenshotId) return null;
    return project.screenshots.find((s) => s.id === state.screenshotId) ?? null;
  }, [project, state?.screenshotId]);

  const [sourceLang, setSourceLang] = useState<Locale>(() => useEditorStore.getState().activeLocale);
  const [drafts, setDrafts] = useState<Partial<Record<Locale, string>>>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const initKeyRef = useRef("");

  const targetLangs = useMemo(() => {
    if (!project) return [];
    return project.activeLocales.filter((l) => l !== sourceLang);
  }, [project, sourceLang]);

  const initDrafts = useCallback(
    (shot: Screenshot, field: "headline" | "subheadline" | "element") => {
      if (field === "element") return;
      const cfg = field === "headline" ? shot.text.headline : shot.text.subheadline;
      const next: Partial<Record<Locale, string>> = {};
      if (project) {
        for (const loc of project.activeLocales) {
          next[loc] = cfg.text[loc] ?? "";
        }
      }
      setDrafts(next);
    },
    [project],
  );

  useEffect(() => {
    if (!state?.open) {
      initKeyRef.current = "";
      return;
    }
    if (!screenshot || state.field === "element") return;
    const key = `${state.screenshotId}\0${state.field}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;
    setSourceLang(useEditorStore.getState().activeLocale);
    initDrafts(screenshot, state.field);
    setStatus(null);
  }, [state?.open, state?.screenshotId, state?.field, screenshot, initDrafts]);

  const fieldLabel =
    state?.field === "headline"
      ? "Headline"
      : state?.field === "subheadline"
        ? "Subheadline"
        : "Öğe metni";

  const onAiTranslate = async () => {
    if (!project || !screenshot || !state || state.field === "element") return;
    const sourceText = drafts[sourceLang]?.trim() ?? "";
    if (!sourceText) {
      toast.error("Önce kaynak dilde metin girin.");
      return;
    }
    if (targetLangs.length === 0) {
      toast.error("Çeviri hedefi yok — projede başka dil ekleyin.");
      return;
    }
    const key = apiKeys[aiProvider].trim();
    if (!key) {
      toast.error("Ayarlar’da seçili sağlayıcı için API anahtarı girin.");
      return;
    }
    const model = selectedModels[aiProvider];
    setBusy(true);
    setStatus("Çevriliyor…");
    try {
      const prompt = buildMarketingTranslationPrompt({
        sourceLang,
        targetLangs,
        sourceText,
      });
      const raw = await callLlmForText({ provider: aiProvider, apiKey: key, model, prompt });
      const parsed = parseTranslationJsonResponse(raw);
      setDrafts((prev) => {
        const merged = { ...prev };
        for (const loc of targetLangs) {
          if (typeof parsed[loc] === "string") merged[loc] = parsed[loc]!;
        }
        return merged;
      });
      toast.success("AI çevirisi uygulandı — kaydetmeyi unutmayın.");
      setStatus(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "AI_UNAVAILABLE" || msg.includes("401") || msg.includes("403")) {
        toast.error("API anahtarı geçersiz veya erişim reddedildi.");
      } else if (msg === "Failed to fetch") {
        toast.error("Bağlantı hatası — anahtarı ve ağı kontrol edin.");
      } else {
        toast.error(`Çeviri hatası: ${msg}`);
      }
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  const onSave = () => {
    if (!project || !screenshot || !state || state.field === "element") return;
    if (state.field === "headline") {
      updateScreenshot(project.id, screenshot.id, (s) => {
        s.text.headline.text = { ...s.text.headline.text, ...drafts };
      });
    } else {
      updateScreenshot(project.id, screenshot.id, (s) => {
        s.text.subheadline.text = { ...s.text.subheadline.text, ...drafts };
      });
    }
    toast.success("Metinler kaydedildi.");
    close();
  };

  if (!state?.open || !project || !screenshot) return null;

  if (state.field === "element") {
    return (
      <Dialog
        open
        onClose={close}
        title="Çeviri"
        description="Öğe çevirisi"
        maxWidth="440px"
      >
        <div className="space-y-4 text-sm text-[var(--color-ink-body)]">
          <p>Öğe metni çevirisi henüz bu sürümde yok (elements katmanı #11).</p>
          <div className="flex justify-end">
            <Button size="sm" onClick={close}>
              Kapat
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  if (project.activeLocales.length < 2) {
    return (
      <Dialog
        open
        onClose={close}
        title="Çeviri"
        description="Önce projeye ek dil ekleyin"
        maxWidth="440px"
      >
        <div className="space-y-4 text-sm text-[var(--color-ink-body)]">
          <p>AI çevirisi için projede en az iki dil olmalı. Dilleri yönet panelinden ekleyin.</p>
          <div className="flex justify-end">
            <Button size="sm" onClick={close}>
              Tamam
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={() => !busy && close()}
      title={`${fieldLabel} — çoklu dil`}
      description="Tüm diller için metin yönetimi"
      maxWidth="560px"
    >
      <div className="space-y-4 text-sm text-[var(--color-ink-body)]">
        <p className="text-xs text-[var(--color-ink-muted)]">
          Kaynak metni seçin; hedef dilleri düzenleyin veya AI ile doldurun. Kaydet deyince bu ekranın{" "}
          {fieldLabel.toLowerCase()} alanı güncellenir.
        </p>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Kaynak dil
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as Locale)}
            disabled={busy}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-2 py-2 text-xs"
          >
            {project.activeLocales.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Kaynak metin
          </label>
          <textarea
            value={drafts[sourceLang] ?? ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [sourceLang]: e.target.value }))}
            disabled={busy}
            rows={3}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-3 py-2 text-xs text-[var(--color-ink-strong)]"
          />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Hedef diller
          </p>
          {targetLangs.map((loc) => (
            <div key={loc}>
              <label className="mb-0.5 block text-[10px] text-[var(--color-ink-muted)]">
                {LOCALE_LABELS[loc]} ({loc})
              </label>
              <textarea
                value={drafts[loc] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [loc]: e.target.value }))}
                disabled={busy}
                rows={2}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-3 py-2 text-xs text-[var(--color-ink-strong)]"
              />
            </div>
          ))}
        </div>

        {status && <p className="text-xs text-[var(--color-ink-muted)]">{status}</p>}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-surface-2)] pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => void onAiTranslate()}
            className="inline-flex items-center gap-1.5"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            AI ile çevir ({aiProvider})
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={close}>
              İptal
            </Button>
            <Button type="button" size="sm" disabled={busy} onClick={onSave}>
              Kaydet
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
