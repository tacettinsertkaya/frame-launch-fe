"use client";

import { forwardRef } from "react";
import type { Screenshot, Locale } from "@/lib/types/project";
import { getEffectiveDimensions, getDeviceSize } from "@/lib/devices/registry";
import { BackgroundLayer } from "./canvas/BackgroundLayer";
import { DeviceLayer } from "./canvas/DeviceLayer";
import { TextLayer } from "./canvas/TextLayer";

interface CanvasProps {
  screenshot: Screenshot;
  locale: Locale;
  /** preview için ölçek (1 = piksel-piksel). */
  scale?: number;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { screenshot, locale, scale = 1 },
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
        <DeviceLayer
          device={screenshot.device}
          size={size}
          uploads={screenshot.uploads}
          locale={locale}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
        />
        <TextLayer
          config={screenshot.text.headline}
          locale={locale}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
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
          />
        )}
      </div>
    </div>
  );
});
