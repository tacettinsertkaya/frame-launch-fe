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
import { PanelSection } from "./PanelSection";
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
    <div className="overflow-y-auto">
      <PanelSection title="Ekle" description="Emoji, metin, PNG/SVG veya ikon yerleştir.">
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
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {QUICK_EMOJIS.map((em) => (
              <Button
                key={em}
                type="button"
                variant="outline"
                size="sm"
                className="min-w-9 px-2 text-base"
                onClick={() => addEmoji(em)}
                title="Emoji ekle"
              >
                {em}
              </Button>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addText}>
            Metin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
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
                onClick={() => addIcon(name)}
                className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--color-surface-2)] text-[var(--color-ink-body)] transition-colors hover:border-black hover:bg-[var(--color-surface-1)]"
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title="Öğeler" description="Listeden seç; sarı çerçeve ana tuvalde görünür.">
        {screenshot.elements.length === 0 ? (
          <p className="text-[11px] text-[var(--color-ink-muted)]">Henüz öğe yok.</p>
        ) : (
          <ul className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {screenshot.elements.map((el) => (
              <li key={el.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(el.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius-md)] border px-2 py-1.5 text-left text-[11px] transition-colors",
                    el.id === selectedId
                      ? "border-black bg-[var(--color-surface-1)]"
                      : "border-[var(--color-surface-2)] hover:border-[var(--color-surface-3)]",
                  )}
                >
                  <span className="font-medium capitalize text-[var(--color-ink-strong)]">
                    {el.kind}
                  </span>
                  <span className="truncate text-[var(--color-ink-muted)]">
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
                onChange={(e) =>
                  patchSelected((el) => {
                    if (el.kind === "emoji") el.emoji = e.target.value || "✨";
                  })
                }
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-2 py-1.5 text-sm"
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
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={selected.flipH}
                  onChange={(e) =>
                    patchSelected((el) => {
                      if (el.kind === "graphic") el.flipH = e.target.checked;
                    })
                  }
                />
                Yatay çevir
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={selected.flipV}
                  onChange={(e) =>
                    patchSelected((el) => {
                      if (el.kind === "graphic") el.flipV = e.target.checked;
                    })
                  }
                />
                Dikey çevir
              </label>
            </PanelSection>
          )}

          <PanelSection title="Sil">
            <Button type="button" variant="destructive" size="sm" onClick={removeSelected}>
              Öğeyi kaldır
            </Button>
          </PanelSection>
        </>
      )}
    </div>
  );
}
