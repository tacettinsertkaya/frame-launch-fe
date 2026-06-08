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
import { PanelBadge, PanelSection, PanelToggle } from "./PanelSection";
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
      <div className="mx-3 mt-3 overflow-hidden rounded-[22px] border border-[rgba(232,198,16,0.22)] bg-[linear-gradient(135deg,rgba(255,247,207,0.92)_0%,rgba(255,255,255,0.82)_100%)] px-4 py-4 shadow-[0_16px_40px_rgba(232,198,16,0.14)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Background Direction
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--color-ink-strong)]">
              Sahnenin ilk izlenimini burada kurun
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              Kontrastı, derinliği ve ritmi arka plan belirliyor. Önce zemini oturtun, sonra cihaz ve metni şekillendirin.
            </p>
          </div>
          <PanelBadge tone="highlight">{bg.type}</PanelBadge>
        </div>
      </div>
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
          <PanelSection
            title="Hazır gradient'lar"
            description="Daha sinematik başlangıçlar için hızlı preset seçin."
            accent="highlight"
          >
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
                  className="group relative aspect-[4/3] overflow-hidden rounded-[18px] border border-black/6 transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                  title={p.name}
                  aria-label={`Gradient ön ayarı: ${p.name}`}
                  style={{
                    backgroundImage: `linear-gradient(${p.direction ?? 135}deg, ${p.stops
                      .map((s) => `${s.color} ${s.position}%`)
                      .join(", ")})`,
                  }}
                >
                  <span className="absolute inset-x-1 bottom-1 truncate rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
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
                  "flex items-center gap-2 rounded-[18px] border border-black/6 bg-white/70 px-2 py-2 transition-colors",
                  selectedStopIndex === idx ? "border-[var(--color-brand-primary)] bg-[rgba(232,198,16,0.08)]" : "",
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
                  className="fl-no-focus w-16 rounded-full border border-black/6 bg-white px-2 py-1.5 text-right text-[11px] tabular-nums transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)]"
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

      <PanelSection title="Overlay" description="Metin ve cihazı zeminden ayırmak için ince bir perde ekleyin.">
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

      <PanelSection title="Noise" description="Dijital pürüz, düz zeminleri daha canlı hissettirir.">
        <PanelToggle
          label="Noise etkin"
          description="Özellikle gradient ve tek renk arka planlarda banding etkisini yumuşatır."
          checked={bg.noise.enabled}
          onChange={(checked) =>
            update((s) => {
              s.background.noise.enabled = checked;
            })
          }
        />
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
