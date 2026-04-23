"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Palette, SlidersHorizontal, Trash2 } from "lucide-react";
import type { Project, Screenshot } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { saveBlob } from "@/lib/persistence/blobStore";
import { Segment } from "@/components/ui/segment";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "@/components/ui/color-input";
import { Button } from "@/components/ui/button";
import { PanelSection } from "./PanelSection";
import { GradientBar } from "./GradientBar";

const GRADIENT_PRESETS: { name: string; stops: { color: string; position: number }[]; direction?: number }[] = [
  { name: "Brand Amber", stops: [{ color: "#e8c610", position: 0 }, { color: "#fff066", position: 100 }] },
  { name: "Amber Night", stops: [{ color: "#000000", position: 0 }, { color: "#e8c610", position: 100 }] },
  { name: "Mono Black", stops: [{ color: "#000000", position: 0 }, { color: "#2a2a2a", position: 100 }] },
  { name: "Sıcak Sunset", stops: [{ color: "#ff6a00", position: 0 }, { color: "#ee0979", position: 100 }] },
  { name: "Yeşil Calm", stops: [{ color: "#11998e", position: 0 }, { color: "#38ef7d", position: 100 }] },
  { name: "Aurora", stops: [{ color: "#00c6ff", position: 0 }, { color: "#0072ff", position: 100 }] },
];

interface Props {
  project: Project;
  screenshot: Screenshot;
}

export function BackgroundPanel({ project, screenshot }: Props) {
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  const bg = screenshot.background;

  const update = (mut: (s: Screenshot) => void) =>
    updateScreenshot(project.id, screenshot.id, mut);

  const onPickFile = async (file: File) => {
    const blobId = await saveBlob(file);
    update((s) => {
      s.background.type = "image";
      s.background.image = { blobId, fit: "cover", blur: 0 };
    });
  };

  return (
    <div className="h-full overflow-y-auto pb-4">
      <PanelSection title="Tip" description="Arka plan stilini seç.">
        <Segment
          value={bg.type}
          onChange={(v) =>
            update((s) => {
              s.background.type = v;
            })
          }
          options={[
            { value: "gradient", label: "Gradient", icon: <Palette size={14} /> },
            { value: "solid", label: "Düz", icon: <SlidersHorizontal size={14} /> },
            { value: "image", label: "Görsel", icon: <ImageIcon size={14} /> },
          ]}
        />
      </PanelSection>

      {bg.type === "gradient" && (
        <>
          <PanelSection title="Hazır gradient'lar">
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    update((s) => {
                      s.background.gradient.stops = structuredClone(p.stops);
                      if (p.direction !== undefined) s.background.gradient.direction = p.direction;
                    })
                  }
                  className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-surface-2)] transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                  title={p.name}
                  aria-label={`Gradient ön ayarı: ${p.name}`}
                  style={{
                    backgroundImage: `linear-gradient(${p.direction ?? 135}deg, ${p.stops
                      .map((s) => `${s.color} ${s.position}%`)
                      .join(", ")})`,
                  }}
                >
                  <span className="absolute inset-x-1 bottom-1 truncate rounded-[4px] bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Renk durakları">
            <GradientBar
              stops={bg.gradient.stops}
              direction={bg.gradient.direction}
              selectedIndex={selectedStopIndex}
              onSelect={setSelectedStopIndex}
              onChangePosition={(idx, position) =>
                update((s) => {
                  if (s.background.gradient.stops[idx]) {
                    s.background.gradient.stops[idx].position = position;
                  }
                })
              }
              onAdd={(color, position) => {
                update((s) => {
                  s.background.gradient.stops.push({ color, position });
                });
                setSelectedStopIndex(bg.gradient.stops.length);
              }}
              onRemove={(idx) => {
                update((s) => {
                  s.background.gradient.stops.splice(idx, 1);
                });
                setSelectedStopIndex(null);
              }}
            />
            {bg.gradient.stops.map((stop, idx) => (
              <div
                key={idx}
                className={[
                  "flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-0.5 transition-colors",
                  selectedStopIndex === idx ? "bg-[var(--color-surface-2)]" : "",
                ].join(" ")}
              >
                <ColorInput
                  value={stop.color}
                  onChange={(c) =>
                    update((s) => {
                      s.background.gradient.stops[idx].color = c;
                    })
                  }
                  label={`Stop ${idx + 1}`}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={stop.position}
                  aria-label={`Stop ${idx + 1} pozisyonu (%)`}
                  onFocus={() => setSelectedStopIndex(idx)}
                  onChange={(e) =>
                    update((s) => {
                      s.background.gradient.stops[idx].position = Number(e.target.value);
                    })
                  }
                  className="fl-no-focus w-14 rounded-[var(--radius-sm)] border border-[var(--color-surface-2)] px-1.5 py-1 text-right text-[11px] tabular-nums transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
                />
                {bg.gradient.stops.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      update((s) => {
                        s.background.gradient.stops.splice(idx, 1);
                      });
                      setSelectedStopIndex(null);
                    }}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                    aria-label={`Stop ${idx + 1}'i sil`}
                  >
                    <Trash2 size={13} aria-hidden />
                  </button>
                )}
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                update((s) => {
                  s.background.gradient.stops.push({
                    color: "#ffffff",
                    position: 50,
                  });
                });
                setSelectedStopIndex(bg.gradient.stops.length);
              }}
              className="w-full"
            >
              + Renk durağı ekle
            </Button>
            <Slider
              label="Yön"
              value={bg.gradient.direction}
              min={0}
              max={360}
              unit="°"
              onChange={(v) =>
                update((s) => {
                  s.background.gradient.direction = v;
                })
              }
            />
          </PanelSection>
        </>
      )}

      {bg.type === "solid" && (
        <PanelSection title="Düz renk">
          <ColorInput
            label="Renk"
            value={bg.solidColor}
            onChange={(c) =>
              update((s) => {
                s.background.solidColor = c;
              })
            }
          />
        </PanelSection>
      )}

      {bg.type === "image" && (
        <PanelSection title="Görsel" description="JPG / PNG / WebP yükleyin (≤20 MB önerilir).">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPickFile(file);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            {bg.image ? "Görseli değiştir" : "Görsel yükle"}
          </Button>
          {bg.image && (
            <>
              <Segment
                value={bg.image.fit}
                onChange={(v) =>
                  update((s) => {
                    if (s.background.image) s.background.image.fit = v;
                  })
                }
                options={[
                  { value: "cover", label: "Cover" },
                  { value: "contain", label: "Contain" },
                  { value: "stretch", label: "Stretch" },
                ]}
              />
              <Slider
                label="Blur"
                value={bg.image.blur}
                min={0}
                max={50}
                unit="px"
                onChange={(v) =>
                  update((s) => {
                    if (s.background.image) s.background.image.blur = v;
                  })
                }
              />
            </>
          )}
        </PanelSection>
      )}

      <PanelSection title="Overlay">
        <ColorInput
          label="Renk"
          value={bg.overlay.color}
          onChange={(c) =>
            update((s) => {
              s.background.overlay.color = c;
            })
          }
        />
        <Slider
          label="Opaklık"
          value={bg.overlay.opacity}
          min={0}
          max={80}
          unit="%"
          onChange={(v) =>
            update((s) => {
              s.background.overlay.opacity = v;
            })
          }
        />
      </PanelSection>

      <PanelSection title="Noise">
        <label className="flex cursor-pointer items-center justify-between gap-2 text-xs">
          <span className="font-medium text-[var(--color-ink-body)]">Etkin</span>
          <input
            type="checkbox"
            checked={bg.noise.enabled}
            onChange={(e) =>
              update((s) => {
                s.background.noise.enabled = e.target.checked;
              })
            }
            className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-brand-primary)]"
          />
        </label>
        {bg.noise.enabled && (
          <Slider
            label="Yoğunluk"
            value={bg.noise.intensity}
            min={1}
            max={50}
            unit="%"
            onChange={(v) =>
              update((s) => {
                s.background.noise.intensity = v;
              })
            }
          />
        )}
      </PanelSection>
    </div>
  );
}
