"use client";

import { useEffect } from "react";
import { Italic, Languages, Strikethrough, Underline } from "lucide-react";
import type { Project, Screenshot, TextConfig, TextWeight } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { PanelSection } from "./PanelSection";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "@/components/ui/color-input";
import { Segment } from "@/components/ui/segment";
import { TextArea } from "@/components/ui/text-input";
import { FontPicker } from "./FontPicker";
import { isSystemFontName } from "@/lib/fonts/fontCatalog";
import { ensureGoogleFontLoaded } from "@/lib/fonts/loadGoogleFont";
import { cn } from "@/lib/utils";

interface Props {
  project: Project;
  screenshot: Screenshot;
}

const WEIGHTS: TextWeight[] = ["Light", "Regular", "Medium", "Semibold", "Bold", "Heavy", "Black"];

const WEIGHT_NUMS = [300, 400, 500, 600, 700, 800, 900] as const;

export function TextPanel({ project, screenshot }: Props) {
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const openTranslateModal = useEditorStore((s) => s.openTranslateModal);

  const update = (mut: (s: Screenshot) => void) =>
    updateScreenshot(project.id, screenshot.id, mut);

  useEffect(() => {
    const warm = (font: string) => {
      if (!isSystemFontName(font)) void ensureGoogleFontLoaded(font, [...WEIGHT_NUMS]);
    };
    warm(screenshot.text.headline.font);
    warm(screenshot.text.subheadline.font);
  }, [screenshot.text.headline.font, screenshot.text.subheadline.font]);

  const renderTextEditor = (
    label: "Headline" | "Subheadline",
    field: "headline" | "subheadline",
    config: TextConfig,
    apply: (mutate: (cfg: TextConfig) => void) => void,
  ) => (
    <PanelSection title={label} description={`Aktif dil: ${activeLocale.toUpperCase()}`}>
      <label className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--color-ink-body)]">Etkin</span>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) =>
            apply((c) => {
              c.enabled = e.target.checked;
            })
          }
        />
      </label>
      {project.activeLocales.length > 1 && (
        <button
          type="button"
          onClick={() => openTranslateModal({ field, screenshotId: screenshot.id })}
          className="mb-2 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-brand-primary)] hover:underline"
        >
          <Languages className="h-3 w-3" />
          Çoklu dil / AI çevirisi…
        </button>
      )}
      {config.enabled && (
        <>
          <TextArea
            placeholder="Metni girin…"
            value={config.text[activeLocale] ?? ""}
            onChange={(e) =>
              apply((c) => {
                c.text = { ...c.text, [activeLocale]: e.target.value };
              })
            }
          />
          <Segment
            value={config.position}
            onChange={(v) =>
              apply((c) => {
                c.position = v;
              })
            }
            options={[
              { value: "top", label: "Üst" },
              { value: "bottom", label: "Alt" },
            ]}
          />
          <Segment
            value={config.align}
            onChange={(v) =>
              apply((c) => {
                c.align = v;
              })
            }
            options={[
              { value: "left", label: "Sol" },
              { value: "center", label: "Orta" },
              { value: "right", label: "Sağ" },
            ]}
          />
          <ColorInput
            label="Renk"
            value={config.color}
            onChange={(v) =>
              apply((c) => {
                c.color = v;
              })
            }
          />
          <label className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Font
          </label>
          <FontPicker
            value={config.font}
            onChange={(font) =>
              apply((c) => {
                c.font = font;
              })
            }
            weightsToLoad={[...WEIGHT_NUMS]}
          />
          <div className="flex gap-1 pt-1">
            {(
              [
                ["italic", Italic, config.italic] as const,
                ["underline", Underline, config.underline] as const,
                ["strikethrough", Strikethrough, config.strikethrough] as const,
              ]
            ).map(([key, Icon, on]) => (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  apply((c) => {
                    if (key === "italic") c.italic = !c.italic;
                    if (key === "underline") c.underline = !c.underline;
                    if (key === "strikethrough") c.strikethrough = !c.strikethrough;
                  })
                }
                className={cn(
                  "inline-flex h-8 flex-1 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-surface-2)] text-[var(--color-ink-body)] transition-colors",
                  on ? "bg-[var(--color-surface-1)] ring-1 ring-[var(--color-ink-muted)]" : "bg-white hover:bg-[var(--color-surface-1)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <label className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Kalınlık
          </label>
          <select
            value={config.weight}
            onChange={(e) =>
              apply((c) => {
                c.weight = e.target.value as TextWeight;
              })
            }
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-2 py-1.5 text-xs"
          >
            {WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <Slider
            label="Boyut"
            value={config.fontSize}
            min={12}
            max={120}
            onChange={(v) =>
              apply((c) => {
                c.fontSize = v;
              })
            }
          />
          <Slider
            label="Satır yüksekliği"
            value={config.lineHeight}
            min={80}
            max={180}
            unit="%"
            onChange={(v) =>
              apply((c) => {
                c.lineHeight = v;
              })
            }
          />
          <Slider
            label="Kenar boşluğu"
            value={config.verticalOffset}
            min={0}
            max={40}
            unit="%"
            onChange={(v) =>
              apply((c) => {
                c.verticalOffset = v;
              })
            }
          />
          {config.opacity !== undefined && (
            <Slider
              label="Opaklık"
              value={config.opacity}
              min={10}
              max={100}
              unit="%"
              onChange={(v) =>
                apply((c) => {
                  c.opacity = v;
                })
              }
            />
          )}
        </>
      )}
    </PanelSection>
  );

  return (
    <div className="overflow-y-auto">
      {renderTextEditor("Headline", "headline", screenshot.text.headline, (m) =>
        update((s) => m(s.text.headline)),
      )}
      {renderTextEditor("Subheadline", "subheadline", screenshot.text.subheadline, (m) =>
        update((s) => m(s.text.subheadline)),
      )}
    </div>
  );
}
