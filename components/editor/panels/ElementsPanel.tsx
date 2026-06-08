"use client";

import { useRef } from "react";
import type { Layer, Project, SceneElement, Screenshot } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { saveBlob } from "@/lib/persistence/blobStore";
import {
  makeEmojiElement,
  makeGraphicElement,
  makeIconElement,
  makeTextElement,
} from "@/lib/editor/elementFactory";
import { ELEMENT_ICON_NAMES, resolveElementIcon } from "@/lib/editor/elementIcons";
import { PanelBadge, PanelSection } from "./PanelSection";
import { Slider } from "@/components/ui/slider";
import { Segment } from "@/components/ui/segment";
import { ColorInput } from "@/components/ui/color-input";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-input";
import { cn } from "@/lib/utils";

interface Props {
  project: Project;
  screenshot: Screenshot;
}

const LAYER_OPTIONS: { value: Layer; label: string }[] = [
  { value: "behindScreenshot", label: "Arka" },
  { value: "aboveScreenshot", label: "Üst" },
  { value: "aboveText", label: "Metin üstü" },
];

const QUICK_EMOJIS = ["✨", "⭐", "🔥", "💡", "🎉", "📱"];

export function ElementsPanel({ project, screenshot }: Props) {
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const selectedId = useEditorStore((s) => s.selectedElementId);
  const setSelectedId = useEditorStore((s) => s.setSelectedElementId);

  const graphicInputRef = useRef<HTMLInputElement | null>(null);

  const update = (mut: (s: Screenshot) => void) =>
    updateScreenshot(project.id, screenshot.id, mut);

  const selected = screenshot.elements.find((e) => e.id === selectedId) ?? null;

  const addEmoji = (emoji: string) => {
    const el = makeEmojiElement(emoji);
    update((s) => {
      s.elements.push(el);
    });
    setSelectedId(el.id);
  };

  const addText = () => {
    const el = makeTextElement();
    update((s) => {
      s.elements.push(el);
    });
    setSelectedId(el.id);
  };

  const addIcon = (name: string) => {
    const el = makeIconElement(name);
    update((s) => {
      s.elements.push(el);
    });
    setSelectedId(el.id);
  };

  const onGraphicFile = async (file: File) => {
    const blobId = await saveBlob(file);
    const el = makeGraphicElement(blobId);
    update((s) => {
      s.elements.push(el);
    });
    setSelectedId(el.id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    update((s) => {
      s.elements = s.elements.filter((e) => e.id !== selectedId);
    });
    setSelectedId(null);
  };

  const patchSelected = (mut: (el: SceneElement) => void) => {
    if (!selectedId) return;
    update((s) => {
      const el = s.elements.find((e) => e.id === selectedId);
      if (el) mut(el);
    });
  };

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="mx-3 mt-3 overflow-hidden rounded-[22px] border border-black/6 bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(255,246,209,0.82)_100%)] px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Layer Builder
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--color-ink-strong)]">
              Destekleyici rozetleri ve vurguları yönetin
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              İkonlar, mini etiketler ve sticker hissi veren katmanlar burada şekilleniyor.
            </p>
          </div>
          <PanelBadge tone={selected ? "highlight" : "default"}>
            {selected ? selected.kind : "Seçim yok"}
          </PanelBadge>
        </div>
      </div>
      <PanelSection
        title="Ekle"
        description="Emoji, metin, PNG/SVG veya ikon yerleştir."
        accent="highlight"
      >
        <input
          ref={graphicInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void onGraphicFile(f);
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 flex flex-wrap gap-1">
            {QUICK_EMOJIS.map((em) => (
              <Button
                key={em}
                type="button"
                variant="outline"
                size="sm"
                className="min-w-9 rounded-full px-2 text-base"
                onClick={() => addEmoji(em)}
                title="Emoji ekle"
              >
                {em}
              </Button>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" className="w-full" onClick={addText}>
            Metin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => graphicInputRef.current?.click()}
          >
            Grafik
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ELEMENT_ICON_NAMES.map((name) => {
            const Icon = resolveElementIcon(name);
            return (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={`${name} ikonu ekle`}
                onClick={() => addIcon(name)}
                className="grid h-10 w-10 place-items-center rounded-[16px] border border-black/6 bg-white/75 text-[var(--color-ink-body)] shadow-[0_8px_18px_rgba(0,0,0,0.04)] transition-colors hover:border-[var(--color-ink-strong)] hover:bg-white focus:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
              >
                <Icon size={18} strokeWidth={2} aria-hidden />
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection
        title="Öğeler"
        description="Listeden seç; sarı çerçeve ana tuvalde görünür."
        toolbar={<PanelBadge>{screenshot.elements.length} adet</PanelBadge>}
      >
        {screenshot.elements.length === 0 ? (
          <p className="text-[11px] text-[var(--color-ink-muted)]">Henüz öğe yok.</p>
        ) : (
          <ul className="max-h-40 space-y-1 overflow-y-auto pr-1" role="list">
            {screenshot.elements.map((el) => (
              <li key={el.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(el.id)}
                  aria-pressed={el.id === selectedId}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-[18px] border px-3 py-2 text-left text-[11px] transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.03)]",
                    "focus:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]",
                    el.id === selectedId
                      ? "border-[var(--color-brand-primary)] bg-[rgba(232,198,16,0.08)]"
                      : "border-black/6 bg-white/75 hover:border-[var(--color-surface-3)]",
                  )}
                >
                  <span className="shrink-0 font-medium capitalize text-[var(--color-ink-strong)]">
                    {el.kind}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-right text-[var(--color-ink-muted)]">
                    {el.kind === "emoji" && el.emoji}
                    {el.kind === "text" && (el.text[activeLocale] ?? el.text["en"] ?? "").slice(0, 24)}
                    {el.kind === "graphic" && "Görsel"}
                    {el.kind === "icon" && el.iconName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>

      {selected && (
        <>
          <PanelSection title="Dönüşüm">
            <Segment
              value={selected.layer}
              onChange={(v) =>
                patchSelected((el) => {
                  el.layer = v;
                })
              }
              options={LAYER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Slider
              label="X %"
              min={0}
              max={100}
              value={selected.positionX}
              onChange={(v) => patchSelected((el) => (el.positionX = v))}
            />
            <Slider
              label="Y %"
              min={0}
              max={100}
              value={selected.positionY}
              onChange={(v) => patchSelected((el) => (el.positionY = v))}
            />
            <Slider
              label="Boyut"
              min={4}
              max={80}
              value={selected.size}
              onChange={(v) => patchSelected((el) => (el.size = v))}
            />
            <Slider
              label="Döndür °"
              min={-180}
              max={180}
              value={selected.rotation}
              onChange={(v) => patchSelected((el) => (el.rotation = v))}
            />
            <Slider
              label="Opaklık"
              min={0}
              max={100}
              value={selected.opacity}
              onChange={(v) => patchSelected((el) => (el.opacity = v))}
            />
          </PanelSection>

          {selected.kind === "emoji" && (
            <PanelSection title="Emoji">
              <input
                type="text"
                maxLength={8}
                value={selected.emoji}
                aria-label="Emoji karakteri"
                onChange={(e) =>
                  patchSelected((el) => {
                    if (el.kind === "emoji") el.emoji = e.target.value || "✨";
                  })
                }
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-2 py-1.5 text-sm text-[var(--color-ink-strong)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
              />
            </PanelSection>
          )}

          {selected.kind === "text" && (
            <PanelSection title="Metin içeriği" description={`Dil: ${activeLocale.toUpperCase()}`}>
              <TextArea
                value={selected.text[activeLocale] ?? ""}
                onChange={(e) =>
                  patchSelected((el) => {
                    if (el.kind === "text")
                      el.text = { ...el.text, [activeLocale]: e.target.value };
                  })
                }
              />
              <ColorInput
                label="Renk"
                value={selected.color}
                onChange={(c) =>
                  patchSelected((el) => {
                    if (el.kind === "text") el.color = c;
                  })
                }
              />
            </PanelSection>
          )}

          {selected.kind === "icon" && (
            <PanelSection title="İkon">
              <ColorInput
                label="Renk"
                value={selected.color}
                onChange={(c) =>
                  patchSelected((el) => {
                    if (el.kind === "icon") el.color = c;
                  })
                }
              />
              <Slider
                label="Çizgi kalınlığı"
                min={1}
                max={4}
                step={0.5}
                value={selected.strokeWidth}
                onChange={(v) =>
                  patchSelected((el) => {
                    if (el.kind === "icon") el.strokeWidth = v;
                  })
                }
              />
            </PanelSection>
          )}

          {selected.kind === "graphic" && (
            <PanelSection title="Grafik">
              <label className="flex cursor-pointer items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={selected.flipH}
                  onChange={(e) =>
                    patchSelected((el) => {
                      if (el.kind === "graphic") el.flipH = e.target.checked;
                    })
                  }
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--color-brand-primary)]"
                />
                Yatay çevir
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={selected.flipV}
                  onChange={(e) =>
                    patchSelected((el) => {
                      if (el.kind === "graphic") el.flipV = e.target.checked;
                    })
                  }
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--color-brand-primary)]"
                />
                Dikey çevir
              </label>
            </PanelSection>
          )}

          <PanelSection title="Tehlikeli alan" accent="danger">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={removeSelected}
              title="Sil tuşu ile de kaldırabilirsin"
            >
              Öğeyi kaldır
            </Button>
            <p className="text-[10px] text-[var(--color-ink-muted)]">
              Kısayollar: <kbd className="rounded bg-[var(--color-surface-2)] px-1">Del</kbd>{" "}
              sil ·{" "}
              <kbd className="rounded bg-[var(--color-surface-2)] px-1">Esc</kbd> seçimi
              kaldır ·{" "}
              <kbd className="rounded bg-[var(--color-surface-2)] px-1">←↑↓→</kbd> kaydır
              (
              <kbd className="rounded bg-[var(--color-surface-2)] px-1">Shift</kbd>: 5×)
            </p>
          </PanelSection>
        </>
      )}
    </div>
  );
}
