"use client";

import { forwardRef } from "react";
import type { Screenshot, Locale } from "@/lib/types/project";
import { getEffectiveDimensions, getDeviceSize } from "@/lib/devices/registry";
import { BackgroundLayer } from "./canvas/BackgroundLayer";
import { DeviceLayer } from "./canvas/DeviceLayer";
import { TextLayer } from "./canvas/TextLayer";
import { ElementsLayer } from "./canvas/ElementsLayer";

interface CanvasProps {
  screenshot: Screenshot;
  locale: Locale;
  /** preview için ölçek (1 = piksel-piksel). */
  scale?: number;
  selectedElementId?: string | null;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { screenshot, locale, scale = 1, selectedElementId = null },
  ref,
) {
  const dims = getEffectiveDimensions(screenshot.deviceSizeId, screenshot.customDimensions);
  const size = getDeviceSize(screenshot.deviceSizeId);

  return (
    <div
      style={{
        width: dims.width * scale,
        height: dims.height * scale,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        ref={ref}
        data-fl-canvas
        style={{
          width: dims.width,
          height: dims.height,
          position: "relative",
          overflow: "hidden",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <BackgroundLayer
          background={screenshot.background}
          width={dims.width}
          height={dims.height}
        />
        <ElementsLayer
          elements={screenshot.elements}
          layer="behindScreenshot"
          zIndex={2}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
          locale={locale}
          selectedElementId={selectedElementId}
        />
        <DeviceLayer
          device={screenshot.device}
          size={size}
          uploads={screenshot.uploads}
          locale={locale}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
        />
        <ElementsLayer
          elements={screenshot.elements}
          layer="aboveScreenshot"
          zIndex={4}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
          locale={locale}
          selectedElementId={selectedElementId}
        />
        <TextLayer
          config={screenshot.text.headline}
          locale={locale}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
          zIndex={5}
        />
        {screenshot.text.subheadline.enabled && (
          <TextLayer
            config={{
              ...screenshot.text.subheadline,
              verticalOffset:
                screenshot.text.subheadline.verticalOffset ||
                screenshot.text.headline.verticalOffset + 12,
            }}
            locale={locale}
            canvasWidth={dims.width}
            canvasHeight={dims.height}
            zIndex={6}
          />
        )}
        <ElementsLayer
          elements={screenshot.elements}
          layer="aboveText"
          zIndex={7}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
          locale={locale}
          selectedElementId={selectedElementId}
        />
      </div>
    </div>
  );
});
