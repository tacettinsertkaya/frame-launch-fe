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
import { getFramePresets } from "@/lib/devices/frameColorPresets";
import { get3DFramePresets } from "@/lib/devices/deviceModels";
import { isPhoneOrTablet } from "@/lib/devices/registry";
import { PanelBadge, PanelSection, PanelToggle } from "./PanelSection";
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
  const activeSize = getDeviceSize(screenshot.deviceSizeId);

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
      <div className="mx-3 mt-3 overflow-hidden rounded-[22px] border border-black/6 bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(255,246,209,0.82)_100%)] px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Device Staging
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--color-ink-strong)]">
              Cihazı sahnede net ve güvenli konumlandırın
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              Market boyutu, medya durumu ve perspektif hissi tek akışta kontrol altında olsun.
            </p>
          </div>
          <PanelBadge tone={screenshot.uploads[activeLocale] ? "highlight" : "default"}>
            {screenshot.uploads[activeLocale] ? "Medya hazır" : "Medya bekliyor"}
          </PanelBadge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <PanelBadge>{activeLocale.toUpperCase()}</PanelBadge>
          <PanelBadge>{activeSize.label}</PanelBadge>
          <PanelBadge>{activeSize.width}×{activeSize.height}</PanelBadge>
        </div>
      </div>
      <PanelSection title="Boyut" description="Marketler için doğru çıktı çözünürlüğü.">
        <select
          value={screenshot.deviceSizeId}
          aria-label="Cihaz boyutu"
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
          className="w-full rounded-[18px] border border-black/6 bg-[rgba(255,255,255,0.8)] px-3 py-2.5 text-sm text-[var(--color-ink-strong)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)]"
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

      {/* 2D / 3D Device Type */}
      {isPhoneOrTablet(screenshot.deviceSizeId) && (
        <PanelSection title="Cihaz Tipi" description="2D düz çerçeve veya 3D gerçekçi model.">
          <div className="flex gap-1 rounded-[18px] border border-black/6 bg-white/70 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
            {(["2d", "3d"] as const).map((m) => (
              <button
                key={m}
                onClick={() => update((s) => { s.device.mode = m; })}
                className={`flex-1 rounded-[14px] py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  dev.mode === m
                    ? "bg-[var(--color-brand-primary)] text-white shadow-[0_4px_12px_rgba(232,198,16,0.3)]"
                    : "text-[var(--color-ink-muted)] hover:bg-black/4"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {dev.mode === "3d" && (
            <>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[var(--color-ink-body)]">
                  Cihaz Modeli
                </span>
                <div className="flex gap-1 rounded-[18px] border border-black/6 bg-white/70 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
                  {(["iphone", "samsung"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => update((s) => { s.device.model = m; })}
                      className={`flex-1 rounded-[14px] py-2 text-xs font-semibold transition-all ${
                        dev.model === m
                          ? "bg-[var(--color-brand-primary)] text-white shadow-[0_4px_12px_rgba(232,198,16,0.3)]"
                          : "text-[var(--color-ink-muted)] hover:bg-black/4"
                      }`}
                    >
                      {m === "iphone" ? "iPhone" : "Samsung"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Color Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[var(--color-ink-body)]">
                  Renk
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {get3DFramePresets(dev.model).map((preset) => (
                    <button
                      key={preset.id}
                      title={preset.label}
                      onClick={() =>
                        update((s) => {
                          s.device.frameColor = preset.swatch;
                          s.device.frameColorPresetId = preset.id;
                        })
                      }
                      className="h-9 w-9 shrink-0 rounded-full border-2 shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition-transform hover:scale-110"
                      style={{
                        background: preset.swatch,
                        borderColor:
                          dev.frameColorPresetId === preset.id
                            ? "var(--color-brand-primary)"
                            : "var(--color-surface-2)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 3D Rotation */}
              <Slider
                label="Rotation X (Tilt)"
                value={dev.rotation.x}
                min={-45}
                max={45}
                unit="°"
                onChange={(v) =>
                  update((s) => { s.device.rotation = { ...s.device.rotation, x: v }; })
                }
              />
              <Slider
                label="Rotation Y (Turn)"
                value={dev.rotation.y}
                min={-45}
                max={45}
                unit="°"
                onChange={(v) =>
                  update((s) => { s.device.rotation = { ...s.device.rotation, y: v }; })
                }
              />
              <Slider
                label="Rotation Z (Roll)"
                value={dev.rotation.z}
                min={-45}
                max={45}
                unit="°"
                onChange={(v) =>
                  update((s) => { s.device.rotation = { ...s.device.rotation, z: v }; })
                }
              />
            </>
          )}
        </PanelSection>
      )}

      <PanelSection
        title="Görsel"
        description={`Aktif dil: ${activeLocale.toUpperCase()}`}
        accent="highlight"
        toolbar={
          <PanelBadge tone={screenshot.uploads[activeLocale] ? "highlight" : "default"}>
            {screenshot.uploads[activeLocale] ? "Yüklendi" : "Boş"}
          </PanelBadge>
        }
      >
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
        {dev.mode !== "3d" && (
          <>
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
          </>
        )}
      </PanelSection>

      {/* 2D Frame controls - hidden when 3D is active */}
      {dev.mode !== "3d" && (
        <PanelSection title="Çerçeve" description="Hazır kasa tonlarından başlayıp gerektiğinde özel renge inin.">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--color-ink-body)]">
              Renk Presetleri
            </span>
            <div className="flex flex-wrap gap-1.5">
              {getFramePresets(screenshot.deviceSizeId).map((preset) => (
                <button
                  key={preset.id}
                  title={preset.label}
                  onClick={() =>
                    update((s) => {
                      s.device.frameColor = preset.color;
                      s.device.frameColorPresetId = preset.id;
                    })
                  }
                  className="group relative h-9 w-9 shrink-0 rounded-full border-2 shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition-transform hover:scale-110"
                  style={{
                    background: preset.color,
                    borderColor:
                      dev.frameColorPresetId === preset.id
                        ? "var(--color-brand-primary)"
                        : "var(--color-surface-2)",
                  }}
                />
              ))}
            </div>
          </div>
          <ColorInput
            label="Çerçeve rengi"
            value={dev.frameColor}
            onChange={(c) =>
              update((s) => {
                s.device.frameColor = c;
                s.device.frameColorPresetId = undefined;
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
      )}

      <PanelSection title="Gölge" description="Cihaza havada durma hissi verin.">
        <PanelToggle
          label="Gölge etkin"
          description="Düşük kontrast arka planlarda cihaza ayrışma kazandırır."
          checked={dev.shadow.enabled}
          onChange={(checked) =>
            update((s) => {
              s.device.shadow.enabled = checked;
            })
          }
        />
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

      <PanelSection title="Kenarlık" description="Özellikle koyu zeminlerde çerçeveyi yeniden ayırın.">
        <PanelToggle
          label="Kenarlık etkin"
          description="Şeffaf veya açık renkli cihazlarda kenar tanımı güçlenir."
          checked={dev.border.enabled}
          onChange={(checked) =>
            update((s) => {
              s.device.border.enabled = checked;
            })
          }
        />
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
