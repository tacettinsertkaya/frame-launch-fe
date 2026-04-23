"use client";

import { useEffect, useState } from "react";
import type { DeviceConfig, Locale } from "@/lib/types/project";
import type { DeviceSize } from "@/lib/devices/registry";
import { getBlobUrl } from "@/lib/persistence/blobStore";

interface Props {
  device: DeviceConfig;
  size: DeviceSize;
  uploads: Partial<Record<Locale, string>>;
  locale: Locale;
  canvasWidth: number;
  canvasHeight: number;
}

export function DeviceLayer({
  device,
  size,
  uploads,
  locale,
  canvasWidth,
  canvasHeight,
}: Props) {
  const blobId = uploads[locale];
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (blobId) {
      getBlobUrl(blobId).then((u) => {
        if (!cancelled) setImageUrl(u);
      });
    } else {
      setImageUrl(undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [blobId]);

  if (device.scale <= 0) return null;

  // Cihazın canvas üzerindeki en geniş kenarı
  const aspect = size.width / size.height;
  const isMarketing = !size.bezel;

  // Telefon/tablet için: yüksekliği canvas'a göre ölçekle, genişliği aspect'e göre türet
  // Marketing için: genişliği canvas'a göre ölçekle (yatay format)
  let deviceHeight: number;
  let deviceWidth: number;
  if (isMarketing) {
    deviceWidth = (canvasWidth * device.scale) / 100;
    deviceHeight = deviceWidth / aspect;
  } else {
    deviceHeight = (canvasHeight * device.scale) / 100;
    deviceWidth = deviceHeight * aspect;
  }

  // Pozisyonlama (yüzde) — kapsayıcının sol-üstüne göre
  const left = (canvasWidth * device.horizontalPos) / 100 - deviceWidth / 2;
  const top = (canvasHeight * device.verticalPos) / 100 - deviceHeight / 2;

  const cornerRadius = isMarketing ? 0 : (deviceWidth * device.cornerRadius) / 100;

  const shadowFilter = device.shadow.enabled
    ? `drop-shadow(${device.shadow.offsetX}px ${device.shadow.offsetY}px ${device.shadow.blur}px ${hexAlpha(
        device.shadow.color,
        device.shadow.opacity / 100,
      )})`
    : "none";

  const transform = `rotate(${device.tiltRotation}deg)`;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: deviceWidth,
        height: deviceHeight,
        transform,
        filter: shadowFilter,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: device.frameColor,
          borderRadius: cornerRadius,
          padding: size.bezel
            ? `${(deviceHeight * size.bezel.top) / 100}px ${(deviceWidth * size.bezel.right) / 100}px ${(deviceHeight * size.bezel.bottom) / 100}px ${(deviceWidth * size.bezel.left) / 100}px`
            : 0,
          boxSizing: "border-box",
          overflow: "hidden",
          border: device.border.enabled
            ? `${device.border.width}px solid ${hexAlpha(
                device.border.color,
                device.border.opacity / 100,
              )}`
            : undefined,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: Math.max(0, cornerRadius - (deviceWidth * (size.bezel?.left ?? 0)) / 100),
            overflow: "hidden",
            background: imageUrl ? "transparent" : "#1a173a",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Screenshot"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                background:
                  "repeating-linear-gradient(45deg, #2a2748 0 12px, #1f1c3d 12px 24px)",
              }}
            >
              Görsel yüklemek için sağdaki Cihaz panelini kullanın
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  // hex `#rrggbb` veya `#rgb` olabilir
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
