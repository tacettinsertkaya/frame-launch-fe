"use client";

import { useEffect } from "react";
import { Italic, Languages, Strikethrough, Underline } from "lucide-react";
import type { Project, Screenshot, TextConfig, TextWeight } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { PanelBadge, PanelSection, PanelToggle } from "./PanelSection";
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
    <PanelSection
      title={label}
      description={`Aktif dil: ${activeLocale.toUpperCase()}`}
      accent={field === "headline" ? "highlight" : "default"}
      toolbar={
        <PanelBadge tone={config.enabled ? "highlight" : "default"}>
          {config.enabled ? "Aktif" : "Pasif"}
        </PanelBadge>
      }
    >
      <PanelToggle
        label={`${label} etkin`}
        description="Bu metin katmanını sahnede göster veya gizle."
        checked={config.enabled}
        onChange={(checked) =>
          apply((c) => {
            c.enabled = checked;
          })
        }
      />
      {project.activeLocales.length > 1 && (
        <button
          type="button"
          onClick={() => openTranslateModal({ field, screenshotId: screenshot.id })}
          className="mb-1 inline-flex items-center gap-1 self-start rounded-full border border-[rgba(232,198,16,0.22)] bg-[rgba(232,198,16,0.1)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-ink-strong)] transition-colors hover:bg-[rgba(232,198,16,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
        >
          <Languages className="h-3 w-3" aria-hidden />
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
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
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
          <div className="grid grid-cols-3 gap-2 pt-1" role="group" aria-label="Metin stili">
            {(
              [
                ["italic", Italic, config.italic, "İtalik"] as const,
                ["underline", Underline, config.underline, "Altı çizili"] as const,
                ["strikethrough", Strikethrough, config.strikethrough, "Üstü çizili"] as const,
              ]
            ).map(([key, Icon, on, ariaLabel]) => (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                aria-label={ariaLabel}
                onClick={() =>
                  apply((c) => {
                    if (key === "italic") c.italic = !c.italic;
                    if (key === "underline") c.underline = !c.underline;
                    if (key === "strikethrough") c.strikethrough = !c.strikethrough;
                  })
                }
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center rounded-[16px] border border-black/6 bg-white/70 text-[var(--color-ink-body)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]",
                  on ? "bg-black text-white ring-1 ring-black" : "hover:bg-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </button>
            ))}
          </div>
          <label
            htmlFor={`${field}-weight`}
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]"
          >
            Kalınlık
          </label>
          <select
            id={`${field}-weight`}
            value={config.weight}
            aria-label={`${label} kalınlığı`}
            onChange={(e) =>
              apply((c) => {
                c.weight = e.target.value as TextWeight;
              })
            }
            className="w-full rounded-[18px] border border-black/6 bg-[rgba(255,255,255,0.8)] px-3 py-2 text-xs text-[var(--color-ink-strong)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)]"
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
    <div className="h-full overflow-y-auto pb-4">
      <div className="mx-3 mt-3 overflow-hidden rounded-[22px] border border-black/6 bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(255,246,209,0.82)_100%)] px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Copy Rhythm
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--color-ink-strong)]">
              Başlık katmanını daha editorial hissettirin
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              Hiyerarşi, hizalama ve satır yüksekliği birlikte ayarlandığında çıktı daha rafine ve daha pahalı görünür.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PanelBadge tone="highlight">{activeLocale.toUpperCase()}</PanelBadge>
            <PanelBadge>{project.activeLocales.length} dil</PanelBadge>
          </div>
        </div>
      </div>
      {renderTextEditor("Headline", "headline", screenshot.text.headline, (m) =>
        update((s) => m(s.text.headline)),
      )}
      {renderTextEditor("Subheadline", "subheadline", screenshot.text.subheadline, (m) =>
        update((s) => m(s.text.subheadline)),
      )}
    </div>
  );
}
