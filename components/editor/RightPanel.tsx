"use client";

import { motion } from "framer-motion";
import { Image, Layers, PictureInPicture, Smartphone, Type } from "lucide-react";
import type { Project, Screenshot } from "@/lib/types/project";
import { useEditorStore, type RightPanelTab } from "@/store/editorStore";
import { BackgroundPanel } from "./panels/BackgroundPanel";
import { DevicePanel } from "./panels/DevicePanel";
import { TextPanel } from "./panels/TextPanel";
import { ElementsPanel } from "./panels/ElementsPanel";
import { PopoutsPanel } from "./panels/PopoutsPanel";
import { cn } from "@/lib/utils";

const TABS: { id: RightPanelTab; label: string; icon: typeof Image }[] = [
  { id: "background", label: "Arka plan", icon: Image },
  { id: "device", label: "Cihaz", icon: Smartphone },
  { id: "text", label: "Metin", icon: Type },
  { id: "elements", label: "Öğeler", icon: Layers },
  { id: "popouts", label: "Popout", icon: PictureInPicture },
];

const TAB_DESCRIPTIONS: Record<RightPanelTab, string> = {
  background: "Gradient, doku ve arka plan kontrastini ayarlayin.",
  device: "Cihaz yerlesimi, perspektif ve medya yuklemelerini duzenleyin.",
  text: "Baslik hiyerarsisini ve dil bazli tipografi ayarlarini ince ayarlayin.",
  elements: "Ek ikonlar, rozetler ve metin katmanlari ile kompozisyonu zenginlestirin.",
  popouts: "Detay crop alanlari ile ana vaadi yakin plan halinde vurgulayin.",
};

interface Props {
  project: Project;
  screenshot: Screenshot;
}

export function RightPanel({ project, screenshot }: Props) {
  const tab = useEditorStore((s) => s.rightPanelTab);
  const setTab = useEditorStore((s) => s.setRightPanelTab);

  return (
    <motion.aside
      initial={{ x: 16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-[min(92vw,360px)] shrink-0 flex-col overflow-hidden rounded-[26px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(245,244,239,0.92)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.08)] md:w-[360px]"
      aria-label="Düzenleyici paneli"
    >
      <div className="shrink-0 border-b border-black/6 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
              Inspector
            </p>
            <h2 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-[var(--color-ink-strong)]">
              {screenshot.name}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              {TAB_DESCRIPTIONS[tab]}
            </p>
          </div>
          <div className="rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
            {TABS.findIndex((item) => item.id === tab) + 1} / {TABS.length}
          </div>
        </div>
      </div>
      <div
        role="tablist"
        aria-label="Düzenleyici sekmeleri"
        className="grid grid-cols-5 gap-1 border-b border-black/6 p-2"
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2.5 text-[11px] font-medium transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary)]",
                active
                  ? "bg-black text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)]"
                  : "text-[var(--color-ink-muted)] hover:bg-white/80 hover:text-[var(--color-ink-strong)]",
              )}
            >
              <Icon size={16} aria-hidden />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/55"
      >
        {tab === "background" && <BackgroundPanel project={project} screenshot={screenshot} />}
        {tab === "device" && <DevicePanel project={project} screenshot={screenshot} />}
        {tab === "text" && <TextPanel project={project} screenshot={screenshot} />}
        {tab === "elements" && <ElementsPanel project={project} screenshot={screenshot} />}
        {tab === "popouts" && <PopoutsPanel />}
      </div>
    </motion.aside>
  );
}
