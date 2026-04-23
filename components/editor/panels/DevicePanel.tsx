"use client";

import { useRef } from "react";
import type { Project, Screenshot } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { handleScreenshotImageUpload } from "@/lib/i18n/handleScreenshotImageUpload";
import { DEVICE_SIZES, getDeviceSize } from "@/lib/devices/registry";
import {
  applyPositionPreset,
  type DevicePositionPresetId,
} from "@/lib/devices/positionPresets";
import { PanelSection } from "./PanelSection";
import { CustomSizeInputs } from "./CustomSizeInputs";
import { PositionPresetGrid } from "./PositionPresetGrid";
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

  const onPickFile = (file: File) => {
    void handleScreenshotImageUpload(project, screenshot.id, file, activeLocale);
  };

  const dev = screenshot.device;

  const groupedSizes = DEVICE_SIZES.reduce<Record<string, typeof DEVICE_SIZES>>(
    (acc, d) => {
      (acc[d.category] ||= []).push(d);
      return acc;
    },
    {},
  );

  const customDims =
    screenshot.customDimensions ??
    (() => {
      const d = getDeviceSize("custom");
      return { width: d.width, height: d.height };
    })();

  const handlePreset = (id: DevicePositionPresetId) => {
    update((s) => {
      s.device = applyPositionPreset(id, s.device);
    });
  };

  return (
    <div className="h-full overflow-y-auto pb-4">
      <PanelSection title="Boyut" description="Marketler için doğru çıktı çözünürlüğü.">
        <select
          value={screenshot.deviceSizeId}
          onChange={(e) =>
            update((s) => {
              const nextId = e.target.value as Screenshot["deviceSizeId"];
              s.deviceSizeId = nextId;
              if (nextId === "custom" && !s.customDimensions) {
                const d = getDeviceSize("custom");
                s.customDimensions = { width: d.width, height: d.height };
              }
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
        {screenshot.deviceSizeId === "custom" && (
          <CustomSizeInputs
            width={customDims.width}
            height={customDims.height}
            onChange={(next) =>
              update((s) => {
                s.customDimensions = next;
              })
            }
          />
        )}
      </PanelSection>

      <PanelSection
        title="Pozisyon Presetleri"
        description="Tek tıkla hazır kompozisyonlar."
      >
        <PositionPresetGrid
          active={dev.positionPreset}
          onApply={handlePreset}
        />
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
        <Slider
          label="Perspektif"
          value={dev.perspective}
          min={0}
          max={30}
          onChange={(v) =>
            update((s) => {
              s.device.perspective = v;
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
