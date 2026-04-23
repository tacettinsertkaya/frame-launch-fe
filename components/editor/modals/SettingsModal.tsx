"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "@/store/editorStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { Theme } from "@/store/settingsStore";
import { AI_PROVIDERS, AI_PROVIDER_IDS, type AiProvider } from "@/lib/ai/providers";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Segment } from "@/components/ui/segment";

type Tab = "general" | "ai";

export function SettingsModal() {
  const open = useEditorStore((s) => s.settingsModalOpen);
  const close = useEditorStore((s) => s.closeSettingsModal);

  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const setAiProvider = useSettingsStore((s) => s.setAiProvider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const selectedModels = useSettingsStore((s) => s.selectedModels);
  const setSelectedModel = useSettingsStore((s) => s.setSelectedModel);
  const googleFontsApiKey = useSettingsStore((s) => s.googleFontsApiKey);
  const setGoogleFontsApiKey = useSettingsStore((s) => s.setGoogleFontsApiKey);
  const validateKey = useSettingsStore((s) => s.validateKey);

  const [tab, setTab] = useState<Tab>("general");

  useEffect(() => {
    if (open) setTab("general");
  }, [open]);

  return (
    <Dialog open={open} onClose={close} title="Ayarlar" maxWidth="560px">
      <div className="flex gap-1 border-b border-[var(--color-surface-2)] px-5 pb-3">
        {(
          [
            ["general", "Genel"],
            ["ai", "Yapay zeka"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? "bg-[var(--color-ink-strong)] text-[var(--color-ink-inverse)]"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[min(70vh,520px)] overflow-y-auto px-5 py-4">
        {tab === "general" ? (
          <div className="space-y-5 text-sm">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Görünüm
              </p>
              <Segment<Theme>
                value={theme}
                onChange={setTheme}
                options={[
                  { value: "auto", label: "Otomatik" },
                  { value: "light", label: "Açık" },
                  { value: "dark", label: "Koyu" },
                ]}
              />
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                Otomatik, işletim sisteminizin açık / koyu tercihini kullanır.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Google Fonts API anahtarı (isteğe bağlı)
              </label>
              <input
                type="password"
                autoComplete="off"
                value={googleFontsApiKey}
                onChange={(e) => setGoogleFontsApiKey(e.target.value)}
                placeholder="webfonts/v1 için API key"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-3 py-2 text-sm text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/25"
              />
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Yalnızca tarayıcınızda saklanır; tam font listesi çekmek için kullanılabilir.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Varsayılan sağlayıcı
              </p>
              <Segment<AiProvider>
                value={aiProvider}
                onChange={setAiProvider}
                options={AI_PROVIDER_IDS.map((id) => ({
                  value: id,
                  label: id === "anthropic" ? "Claude" : id === "openai" ? "OpenAI" : "Gemini",
                }))}
              />
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                Çeviri ve ilerideki AI özellikleri için hangi anahtarların kullanılacağını seçer.
              </p>
            </div>

            {AI_PROVIDER_IDS.map((id) => {
              const cfg = AI_PROVIDERS[id];
              const key = apiKeys[id];
              const model = selectedModels[id];
              return (
                <div
                  key={id}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-surface-2)] bg-[var(--color-surface-1)] p-4"
                >
                  <p className="mb-3 text-xs font-semibold text-[var(--color-ink-strong)]">
                    {cfg.name}
                  </p>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    API anahtarı
                  </label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={key}
                    onChange={(e) => setApiKey(id, e.target.value)}
                    placeholder={`${cfg.keyPrefix}…`}
                    className="mb-3 w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-3 py-2 text-xs text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/25"
                  />
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setSelectedModel(id, e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-2 py-2 text-xs text-[var(--color-ink-strong)]"
                  >
                    {cfg.models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="mt-2 text-[10px] font-medium text-[var(--color-brand-primary)] hover:underline"
                    onClick={() => {
                      if (!key.trim()) {
                        toast.info("Önce bir anahtar girin");
                        return;
                      }
                      if (validateKey(id, key)) toast.success("Biçim uygun görünüyor");
                      else toast.error(`Anahtar ${cfg.keyPrefix} ile başlamalı`);
                    }}
                  >
                    Anahtar biçimini kontrol et
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--color-surface-2)] px-5 py-3">
        <Button size="sm" onClick={close}>
          Kapat
        </Button>
      </div>
    </Dialog>
  );
}
