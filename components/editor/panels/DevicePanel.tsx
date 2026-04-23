"use client";

import { useRef } from "react";
import type { Project, Screenshot } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { saveBlob } from "@/lib/persistence/blobStore";
import { DEVICE_SIZES } from "@/lib/devices/registry";
import { PanelSection } from "./PanelSection";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "@/components/ui/color-input";
import { Button } from "@/components/ui/button";

interface Props {
  project: Project;
  screenshot: Screenshot;
}

export function DevicePanel({ project, screenshot }: Props) {
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = (mut: (s: Screenshot) => void) =>
    updateScreenshot(project.id, screenshot.id, mut);

  const onPickFile = async (file: File) => {
    const blobId = await saveBlob(file);
    update((s) => {
      s.uploads = { ...s.uploads, [activeLocale]: blobId };
    });
  };

  const dev = screenshot.device;

  const groupedSizes = DEVICE_SIZES.reduce<Record<string, typeof DEVICE_SIZES>>(
    (acc, d) => {
      (acc[d.category] ||= []).push(d);
      return acc;
    },
    {},
  );

  return (
    <div className="overflow-y-auto">
      <PanelSection title="Boyut" description="Marketler için doğru çıktı çözünürlüğü.">
        <select
          value={screenshot.deviceSizeId}
          onChange={(e) =>
            update((s) => {
              s.deviceSizeId = e.target.value as Screenshot["deviceSizeId"];
            })
          }
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
        >
          {Object.entries(groupedSizes).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} — {d.width}×{d.height}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </PanelSection>

      <PanelSection title="Görsel" description={`Aktif dil: ${activeLocale.toUpperCase()}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickFile(f);
            e.target.value = "";
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          {screenshot.uploads[activeLocale] ? "Görseli değiştir" : "Görsel yükle"}
        </Button>
        {screenshot.uploads[activeLocale] && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:bg-red-50"
            onClick={() =>
              update((s) => {
                const next = { ...s.uploads };
                delete next[activeLocale];
                s.uploads = next;
              })
            }
          >
            Görseli kaldır
          </Button>
        )}
      </PanelSection>

      <PanelSection title="Boyut & Konum">
        <Slider
          label="Ölçek"
          value={dev.scale}
          min={0}
          max={120}
          unit="%"
          onChange={(v) =>
            update((s) => {
              s.device.scale = v;
            })
          }
        />
        <Slider
          label="Dikey konum"
          value={dev.verticalPos}
          min={0}
          max={100}
          unit="%"
          onChange={(v) =>
            update((s) => {
              s.device.verticalPos = v;
            })
          }
        />
        <Slider
          label="Yatay konum"
          value={dev.horizontalPos}
          min={0}
          max={100}
          unit="%"
          onChange={(v) =>
            update((s) => {
              s.device.horizontalPos = v;
            })
          }
        />
        <Slider
          label="Döndürme"
          value={dev.tiltRotation}
          min={-45}
          max={45}
          unit="°"
          onChange={(v) =>
            update((s) => {
              s.device.tiltRotation = v;
            })
          }
        />
      </PanelSection>

      <PanelSection title="Çerçeve">
        <ColorInput
          label="Çerçeve rengi"
          value={dev.frameColor}
          onChange={(c) =>
            update((s) => {
              s.device.frameColor = c;
            })
          }
        />
        <Slider
          label="Köşe yuvarlama"
          value={dev.cornerRadius}
          min={0}
          max={50}
          unit="%"
          onChange={(v) =>
            update((s) => {
              s.device.cornerRadius = v;
            })
          }
        />
      </PanelSection>

      <PanelSection title="Gölge">
        <label className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--color-ink-body)]">Etkin</span>
          <input
            type="checkbox"
            checked={dev.shadow.enabled}
            onChange={(e) =>
              update((s) => {
                s.device.shadow.enabled = e.target.checked;
              })
            }
          />
        </label>
        {dev.shadow.enabled && (
          <>
            <ColorInput
              label="Renk"
              value={dev.shadow.color}
              onChange={(c) =>
                update((s) => {
                  s.device.shadow.color = c;
                })
              }
            />
            <Slider
              label="Bulanıklık"
              value={dev.shadow.blur}
              min={0}
              max={200}
              onChange={(v) =>
                update((s) => {
                  s.device.shadow.blur = v;
                })
              }
            />
            <Slider
              label="Opaklık"
              value={dev.shadow.opacity}
              min={0}
              max={100}
              unit="%"
              onChange={(v) =>
                update((s) => {
                  s.device.shadow.opacity = v;
                })
              }
            />
            <Slider
              label="Y kayma"
              value={dev.shadow.offsetY}
              min={-100}
              max={100}
              onChange={(v) =>
                update((s) => {
                  s.device.shadow.offsetY = v;
                })
              }
            />
          </>
        )}
      </PanelSection>

      <PanelSection title="Kenarlık">
        <label className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--color-ink-body)]">Etkin</span>
          <input
            type="checkbox"
            checked={dev.border.enabled}
            onChange={(e) =>
              update((s) => {
                s.device.border.enabled = e.target.checked;
              })
            }
          />
        </label>
        {dev.border.enabled && (
          <>
            <ColorInput
              label="Renk"
              value={dev.border.color}
              onChange={(c) =>
                update((s) => {
                  s.device.border.color = c;
                })
              }
            />
            <Slider
              label="Kalınlık"
              value={dev.border.width}
              min={1}
              max={40}
              unit="px"
              onChange={(v) =>
                update((s) => {
                  s.device.border.width = v;
                })
              }
            />
            <Slider
              label="Opaklık"
              value={dev.border.opacity}
              min={0}
              max={100}
              unit="%"
              onChange={(v) =>
                update((s) => {
                  s.device.border.opacity = v;
                })
              }
            />
          </>
        )}
      </PanelSection>
    </div>
  );
}
