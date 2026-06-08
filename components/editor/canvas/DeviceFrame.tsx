"use client";

import { useId } from "react";
import type { DeviceSizeId } from "@/lib/types/project";
import type { DeviceSize } from "@/lib/devices/registry";

type DeviceStyle =
  | "modern-iphone"
  | "classic-iphone"
  | "ipad"
  | "android-phone"
  | "android-tablet"
  | "none";

function getDeviceStyle(id: DeviceSizeId): DeviceStyle {
  switch (id) {
    case "iphone-69":
    case "iphone-67":
    case "iphone-65":
      return "modern-iphone";
    case "iphone-55":
      return "classic-iphone";
    case "ipad-129":
    case "ipad-11":
      return "ipad";
    case "android-phone":
    case "android-phone-hd":
      return "android-phone";
    case "android-tablet-7":
    case "android-tablet-10":
      return "android-tablet";
    default:
      return "none";
  }
}

function adj(hex: string, amount: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = Math.min(255, Math.max(0, parseInt(h.slice(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(h.slice(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(h.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

interface DeviceFrameSvgProps {
  size: DeviceSize;
  deviceWidth: number;
  deviceHeight: number;
  frameColor: string;
  cornerRadiusPct: number;
}

export function DeviceFrameSvg({
  size,
  deviceWidth,
  deviceHeight,
  frameColor,
  cornerRadiusPct,
}: DeviceFrameSvgProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  const style = getDeviceStyle(size.id);
  if (style === "none" || !size.bezel) return null;

  const W = size.width;
  const H = size.height;

  const bL = (W * size.bezel.left) / 100;
  const bR = (W * size.bezel.right) / 100;
  const bT = (H * size.bezel.top) / 100;
  const bB = (H * size.bezel.bottom) / 100;

  const sX = bL;
  const sY = bT;
  const sW = W - bL - bR;
  const sH = H - bT - bB;

  const outerR = (W * cornerRadiusPct) / 100;
  const innerR = Math.max(0, outerR - bL);

  const btnW = W * 0.008;
  const btnR = btnW * 0.4;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={deviceWidth}
      height={deviceHeight}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 4,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Titanium / metallic body gradient */}
        <linearGradient id={`${uid}M`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={adj(frameColor, 35)} />
          <stop offset="12%" stopColor={adj(frameColor, 22)} />
          <stop offset="35%" stopColor={adj(frameColor, 8)} />
          <stop offset="50%" stopColor={frameColor} />
          <stop offset="65%" stopColor={adj(frameColor, -6)} />
          <stop offset="85%" stopColor={adj(frameColor, -12)} />
          <stop offset="100%" stopColor={adj(frameColor, -18)} />
        </linearGradient>

        {/* Chamfer edge highlight */}
        <linearGradient id={`${uid}E`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="25%" stopColor="#ffffff" stopOpacity={0.12} />
          <stop offset="50%" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="75%" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.18} />
        </linearGradient>

        {/* Glass reflection */}
        <linearGradient
          id={`${uid}G`}
          x1="0"
          y1="0"
          x2="0.6"
          y2="1"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.06} />
          <stop offset="25%" stopColor="#ffffff" stopOpacity={0.02} />
          <stop offset="50%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="80%" stopColor="#ffffff" stopOpacity={0.01} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.04} />
        </linearGradient>

        {/* Side button gradient (vertical) */}
        <linearGradient id={`${uid}B`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={adj(frameColor, 28)} />
          <stop offset="30%" stopColor={adj(frameColor, 10)} />
          <stop offset="70%" stopColor={frameColor} />
          <stop offset="100%" stopColor={adj(frameColor, -10)} />
        </linearGradient>

        {/* Screen cutout mask */}
        <mask id={`${uid}S`}>
          <rect width={W} height={H} fill="white" />
          <rect
            x={sX}
            y={sY}
            width={sW}
            height={sH}
            rx={innerR}
            fill="black"
          />
        </mask>

        {/* Inner shadow filter for screen recession */}
        <filter id={`${uid}IS`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={W * 0.003} />
          <feOffset dx={0} dy={0} />
          <feComposite operator="out" in2="SourceAlpha" />
          <feColorMatrix
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0"
          />
          <feBlend in2="SourceGraphic" mode="normal" />
        </filter>
      </defs>

      {/* === DEVICE BODY (with screen cutout) === */}
      <rect
        width={W}
        height={H}
        rx={outerR}
        fill={`url(#${uid}M)`}
        mask={`url(#${uid}S)`}
      />

      {/* Outer edge highlight (catches light around perimeter) */}
      <rect
        width={W}
        height={H}
        rx={outerR}
        fill="none"
        stroke={`url(#${uid}E)`}
        strokeWidth={W * 0.003}
      />

      {/* Inner chamfer ring (bright edge where screen glass meets frame) */}
      <rect
        x={sX - W * 0.002}
        y={sY - W * 0.002}
        width={sW + W * 0.004}
        height={sH + W * 0.004}
        rx={innerR + W * 0.002}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.12}
        strokeWidth={W * 0.0025}
      />

      {/* Screen gasket (thin dark seam between glass and frame) */}
      <rect
        x={sX}
        y={sY}
        width={sW}
        height={sH}
        rx={innerR}
        fill="none"
        stroke="#000000"
        strokeOpacity={0.5}
        strokeWidth={W * 0.002}
      />

      {/* Screen inner shadow (recession effect) */}
      <rect
        x={sX}
        y={sY}
        width={sW}
        height={sH}
        rx={innerR}
        fill="none"
        filter={`url(#${uid}IS)`}
      />

      {/* Glass reflection over screen area */}
      <rect
        x={sX}
        y={sY}
        width={sW}
        height={sH}
        rx={innerR}
        fill={`url(#${uid}G)`}
      />

      {/* === DEVICE-SPECIFIC CHROME === */}

      {/* Modern iPhone: Dynamic Island */}
      {style === "modern-iphone" && (
        <>
          <rect
            x={W / 2 - sW * 0.15}
            y={sY + sH * 0.008}
            width={sW * 0.30}
            height={Math.max(W * 0.02, sH * 0.013)}
            rx={Math.max(W * 0.01, sH * 0.0065)}
            fill="#000000"
          />
          {/* Front camera lens */}
          <circle
            cx={W / 2 + sW * 0.1}
            cy={sY + sH * 0.008 + Math.max(W * 0.01, sH * 0.0065)}
            r={Math.max(W * 0.008, sH * 0.004)}
            fill="#0f0f20"
          />
          <circle
            cx={W / 2 + sW * 0.1}
            cy={sY + sH * 0.008 + Math.max(W * 0.01, sH * 0.0065)}
            r={Math.max(W * 0.005, sH * 0.0025)}
            fill="#1a1a3a"
            opacity={0.8}
          />
          {/* Sensor dot */}
          <circle
            cx={W / 2 - sW * 0.04}
            cy={sY + sH * 0.008 + Math.max(W * 0.01, sH * 0.0065)}
            r={Math.max(W * 0.003, sH * 0.0015)}
            fill="#1a1a28"
          />
        </>
      )}

      {/* Classic iPhone: Speaker grille + front camera + home button */}
      {style === "classic-iphone" && (
        <>
          {/* Earpiece speaker */}
          <rect
            x={W / 2 - W * 0.06}
            y={bT / 2 - H * 0.002}
            width={W * 0.12}
            height={H * 0.004}
            rx={H * 0.002}
            fill={adj(frameColor, -30)}
          />
          {/* Front camera */}
          <circle
            cx={W / 2 + W * 0.1}
            cy={bT / 2}
            r={W * 0.012}
            fill={adj(frameColor, -40)}
          />
          <circle
            cx={W / 2 + W * 0.1}
            cy={bT / 2}
            r={W * 0.007}
            fill="#1a1a3a"
          />
          {/* Home button outer ring */}
          <circle
            cx={W / 2}
            cy={H - bB / 2}
            r={W * 0.04}
            fill="none"
            stroke={adj(frameColor, 22)}
            strokeWidth={W * 0.003}
          />
          {/* Home button inner rounded square */}
          <rect
            x={W / 2 - W * 0.014}
            y={H - bB / 2 - W * 0.014}
            width={W * 0.028}
            height={W * 0.028}
            rx={W * 0.005}
            fill="none"
            stroke={adj(frameColor, 16)}
            strokeWidth={W * 0.002}
          />
        </>
      )}

      {/* iPad: Front camera */}
      {style === "ipad" && (
        <>
          <circle
            cx={W / 2}
            cy={bT / 2}
            r={W * 0.006}
            fill={adj(frameColor, -35)}
          />
          <circle
            cx={W / 2}
            cy={bT / 2}
            r={W * 0.003}
            fill="#1a1a3a"
          />
        </>
      )}

      {/* Android phone: Camera punch-hole */}
      {style === "android-phone" && (
        <>
          <circle
            cx={W / 2}
            cy={sY + sH * 0.012}
            r={W * 0.015}
            fill="#0a0a18"
          />
          <circle
            cx={W / 2}
            cy={sY + sH * 0.012}
            r={W * 0.009}
            fill="#1a1a30"
          />
        </>
      )}

      {/* === SIDE HARDWARE BUTTONS === */}

      {/* Modern iPhone buttons */}
      {style === "modern-iphone" && (
        <>
          {/* Action button – left */}
          <rect
            x={-btnW}
            y={H * 0.148}
            width={btnW}
            height={H * 0.022}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          {/* Volume up – left */}
          <rect
            x={-btnW}
            y={H * 0.19}
            width={btnW}
            height={H * 0.042}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          {/* Volume down – left */}
          <rect
            x={-btnW}
            y={H * 0.245}
            width={btnW}
            height={H * 0.042}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          {/* Power – right */}
          <rect
            x={W}
            y={H * 0.19}
            width={btnW}
            height={H * 0.065}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          {/* Antenna line accents */}
          <line
            x1={0}
            y1={H * 0.33}
            x2={0}
            y2={H * 0.333}
            stroke={adj(frameColor, -25)}
            strokeWidth={W * 0.002}
          />
          <line
            x1={W}
            y1={H * 0.33}
            x2={W}
            y2={H * 0.333}
            stroke={adj(frameColor, -25)}
            strokeWidth={W * 0.002}
          />
          <line
            x1={0}
            y1={H * 0.67}
            x2={0}
            y2={H * 0.673}
            stroke={adj(frameColor, -25)}
            strokeWidth={W * 0.002}
          />
          <line
            x1={W}
            y1={H * 0.67}
            x2={W}
            y2={H * 0.673}
            stroke={adj(frameColor, -25)}
            strokeWidth={W * 0.002}
          />
        </>
      )}

      {/* Classic iPhone buttons */}
      {style === "classic-iphone" && (
        <>
          <rect
            x={-btnW}
            y={H * 0.115}
            width={btnW}
            height={H * 0.018}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          <rect
            x={-btnW}
            y={H * 0.16}
            width={btnW}
            height={H * 0.038}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          <rect
            x={-btnW}
            y={H * 0.21}
            width={btnW}
            height={H * 0.038}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          <rect
            x={W}
            y={H * 0.165}
            width={btnW}
            height={H * 0.055}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
        </>
      )}

      {/* iPad buttons */}
      {style === "ipad" && (
        <>
          {/* Power – top edge */}
          <rect
            x={W * 0.82}
            y={-btnW}
            width={W * 0.04}
            height={btnW}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          {/* Volume – right side */}
          <rect
            x={W}
            y={H * 0.1}
            width={btnW}
            height={H * 0.03}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          <rect
            x={W}
            y={H * 0.14}
            width={btnW}
            height={H * 0.03}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
        </>
      )}

      {/* Android buttons */}
      {(style === "android-phone" || style === "android-tablet") && (
        <>
          <rect
            x={W}
            y={H * 0.20}
            width={btnW}
            height={H * 0.05}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
          <rect
            x={W}
            y={H * 0.27}
            width={btnW}
            height={H * 0.035}
            rx={btnR}
            fill={`url(#${uid}B)`}
          />
        </>
      )}
    </svg>
  );
}

/* Re-export a simple helper for empty-state screen background */
export function getScreenBackground(): string {
  return "linear-gradient(180deg, #15152a 0%, #0a0a18 100%)";
}
