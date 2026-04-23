"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import type { Theme } from "@/store/settingsStore";

function resolveDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Applies `framelaunch-dark` on `<html>` from settings theme + system preference. */
export function ThemeSync() {
  const hydrate = useSettingsStore((s) => s.hydrate);
  const theme = useSettingsStore((s) => s.theme);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setIsDark(resolveDark(theme));
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setIsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("framelaunch-dark", isDark);
    return () => document.documentElement.classList.remove("framelaunch-dark");
  }, [isDark]);

  return null;
}
