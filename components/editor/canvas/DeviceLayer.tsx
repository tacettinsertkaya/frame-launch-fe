"use client";

import { useEffect, useState } from "react";
import type { DeviceConfig, Locale } from "@/lib/types/project";
import type { DeviceSize } from "@/lib/devices/registry";
import { getBlobUrl } from "@/lib/persistence/blobStore";
import { DeviceFrameSvg, getScreenBackground } from "./DeviceFrame";
import dynamic from "next/dynamic";

const Device3DLayer = dynamic(
  () => import("./Device3DLayer").then((m) => m.Device3DLayer),
  { ssr: false },
);

interface Props {
  device: DeviceConfig;
  size: DeviceSize;
  uploads: Partial<Record<Locale, string>>;
  locale: Locale;
  canvasWidth: number;
  canvasHeight: number;
  /** Skip heavy 3D rendering (for sidebar thumbnails). */
  preview?: boolean;
}

export function DeviceLayer({
  device,
  size,
  uploads,
  locale,
  canvasWidth,
  canvasHeight,
  preview = false,
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

  const aspect = size.width / size.height;
  const isMarketing = !size.bezel;

  let deviceHeight: number;
  let deviceWidth: number;
  if (isMarketing) {
    deviceWidth = (canvasWidth * device.scale) / 100;
    deviceHeight = deviceWidth / aspect;
  } else {
    deviceHeight = (canvasHeight * device.scale) / 100;
    deviceWidth = deviceHeight * aspect;
  }

  const left = (canvasWidth * device.horizontalPos) / 100 - deviceWidth / 2;
  const top = (canvasHeight * device.verticalPos) / 100 - deviceHeight / 2;

  const cornerRadius = isMarketing
    ? 0
    : (deviceWidth * device.cornerRadius) / 100;

  const shadowFilter = device.shadow.enabled
    ? `drop-shadow(${device.shadow.offsetX}px ${device.shadow.offsetY}px ${device.shadow.blur}px ${hexAlpha(
        device.shadow.color,
        device.shadow.opacity / 100,
      )})`
    : "none";

  const persp = Math.max(0, device.perspective ?? 0);
  const transform =
    persp > 0
      ? `perspective(1200px) rotateY(${(persp * 0.6).toFixed(2)}deg) rotate(${device.tiltRotation}deg)`
      : `rotate(${device.tiltRotation}deg)`;

  const bezelPx = size.bezel
    ? {
        top: (deviceHeight * size.bezel.top) / 100,
        right: (deviceWidth * size.bezel.right) / 100,
        bottom: (deviceHeight * size.bezel.bottom) / 100,
        left: (deviceWidth * size.bezel.left) / 100,
      }
    : null;

  const screenWidth = bezelPx
    ? deviceWidth - bezelPx.left - bezelPx.right
    : deviceWidth;
  const screenHeight = bezelPx
    ? deviceHeight - bezelPx.top - bezelPx.bottom
    : deviceHeight;

  const innerRadius = Math.max(
    0,
    cornerRadius - (bezelPx?.left ?? 0),
  );

  /* ── Marketing / no-bezel layout: same as before ── */
  if (isMarketing) {
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: deviceWidth,
          height: deviceHeight,
          transform,
          transformStyle: persp > 0 ? "preserve-3d" : undefined,
          filter: shadowFilter,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: device.frameColor,
            borderRadius: cornerRadius,
            overflow: "hidden",
            border: device.border.enabled
              ? `${device.border.width}px solid ${hexAlpha(device.border.color, device.border.opacity / 100)}`
              : undefined,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              background: imageUrl ? "transparent" : "#0a0a14",
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
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  background: getScreenBackground(),
                }}
              >
                Upload a screenshot from the Device panel
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── 3D mode: Three.js GLB model (skip for preview thumbnails to conserve WebGL contexts) ── */
  if (device.mode === "3d" && !isMarketing && !preview) {
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: deviceWidth,
          height: deviceHeight,
          filter: shadowFilter,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <Device3DLayer
          device={device}
          imageUrl={imageUrl}
          width={deviceWidth}
          height={deviceHeight}
        />
      </div>
    );
  }

  /* ── 2D mode: SVG frame overlay ── */
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: deviceWidth,
        height: deviceHeight,
        transform,
        transformStyle: persp > 0 ? "preserve-3d" : undefined,
        filter: shadowFilter,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {/* Layer 1: Screenshot image positioned at screen area */}
      <div
        style={{
          position: "absolute",
          left: bezelPx!.left,
          top: bezelPx!.top,
          width: screenWidth,
          height: screenHeight,
          borderRadius: innerRadius,
          overflow: "hidden",
          zIndex: 2,
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
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              background: getScreenBackground(),
            }}
          >
            Upload a screenshot from the Device panel
          </div>
        )}
      </div>

      {/* Layer 2: SVG device frame overlay (screen area is transparent via mask) */}
      <DeviceFrameSvg
        size={size}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        frameColor={device.frameColor}
        cornerRadiusPct={device.cornerRadius}
      />

      {/* Layer 3: User-configurable border (on top of everything) */}
      {device.border.enabled && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: cornerRadius,
            border: `${device.border.width}px solid ${hexAlpha(
              device.border.color,
              device.border.opacity / 100,
            )}`,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
