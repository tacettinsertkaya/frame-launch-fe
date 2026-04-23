"use client";

import { useEffect, useState } from "react";
import type { BackgroundConfig } from "@/lib/types/project";
import { getBlobUrl } from "@/lib/persistence/blobStore";

interface Props {
  background: BackgroundConfig;
  width: number;
  height: number;
}

export function BackgroundLayer({ background, width, height }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (background.type === "image" && background.image?.blobId) {
      getBlobUrl(background.image.blobId).then((u) => {
        if (!cancelled) setImageUrl(u);
      });
    } else {
      setImageUrl(undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [background.type, background.image?.blobId]);

  let baseStyle: React.CSSProperties = { width, height, position: "absolute", inset: 0 };

  if (background.type === "solid") {
    baseStyle = { ...baseStyle, background: background.solidColor };
  } else if (background.type === "gradient") {
    const stops = [...background.gradient.stops]
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");
    baseStyle = {
      ...baseStyle,
      background: `linear-gradient(${background.gradient.direction}deg, ${stops})`,
    };
  } else if (background.type === "image") {
    if (imageUrl) {
      const fit = background.image?.fit ?? "cover";
      baseStyle = {
        ...baseStyle,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize:
          fit === "stretch" ? "100% 100%" : fit === "contain" ? "contain" : "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: background.image?.blur
          ? `blur(${background.image.blur}px)`
          : undefined,
      };
    } else {
      baseStyle = { ...baseStyle, background: "#1a173a" };
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={baseStyle} />
      {background.overlay.opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: background.overlay.color,
            opacity: background.overlay.opacity / 100,
            pointerEvents: "none",
          }}
        />
      )}
      {background.noise.enabled && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: background.noise.intensity / 100,
            mixBlendMode: "overlay",
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
