"use client";

import { useEffect, useState } from "react";
import { Toaster, type ToasterProps } from "sonner";
import { useSettingsStore, type Theme } from "@/store/settingsStore";

function resolveSonnerTheme(theme: Theme): ToasterProps["theme"] {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return "system";
}

/** Sonner Toaster: responsive position + theme-aware (auto/light/dark). */
export function AppToaster() {
  const theme = useSettingsStore((s) => s.theme);
  const [position, setPosition] = useState<ToasterProps["position"]>("bottom-right");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setPosition(mq.matches ? "bottom-center" : "bottom-right");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Toaster
      richColors
      closeButton
      position={position}
      theme={resolveSonnerTheme(theme)}
      toastOptions={{
        classNames: {
          toast:
            "rounded-[var(--radius-md)] border border-[var(--color-surface-2)] shadow-[var(--shadow-md)]",
        },
      }}
    />
  );
}
