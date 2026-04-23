"use client";

import type { Project, Screenshot, TextConfig, TextWeight } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { PanelSection } from "./PanelSection";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "@/components/ui/color-input";
import { Segment } from "@/components/ui/segment";
import { TextArea } from "@/components/ui/text-input";

interface Props {
  project: Project;
  screenshot: Screenshot;
}

const FONTS = ["Inter", "Helvetica", "Arial", "Georgia", "Times New Roman", "Courier New"];
const WEIGHTS: TextWeight[] = ["Light", "Regular", "Medium", "Semibold", "Bold", "Heavy", "Black"];

export function TextPanel({ project, screenshot }: Props) {
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);

  const update = (mut: (s: Screenshot) => void) =>
    updateScreenshot(project.id, screenshot.id, mut);

  const renderTextEditor = (
    label: "Headline" | "Subheadline",
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
          <div className="grid grid-cols-2 gap-2">
            <select
              value={config.font}
              onChange={(e) =>
                apply((c) => {
                  c.font = e.target.value;
                })
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-2 py-1.5 text-xs"
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              value={config.weight}
              onChange={(e) =>
                apply((c) => {
                  c.weight = e.target.value as TextWeight;
                })
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-2 py-1.5 text-xs"
            >
              {WEIGHTS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
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
      {renderTextEditor("Headline", screenshot.text.headline, (m) =>
        update((s) => m(s.text.headline)),
      )}
      {renderTextEditor("Subheadline", screenshot.text.subheadline, (m) =>
        update((s) => m(s.text.subheadline)),
      )}
    </div>
  );
}
