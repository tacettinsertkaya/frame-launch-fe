"use client";

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

interface Props {
  project: Project;
  screenshot: Screenshot;
}

export function RightPanel({ project, screenshot }: Props) {
  const tab = useEditorStore((s) => s.rightPanelTab);
  const setTab = useEditorStore((s) => s.setRightPanelTab);

  return (
    <aside className="flex h-full w-[320px] flex-col border-l border-[var(--color-surface-2)] bg-[var(--color-surface-0)]">
      <div className="flex border-b border-[var(--color-surface-2)]">
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 inline-flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                active
                  ? "border-b-2 border-black text-black"
                  : "border-b-2 border-transparent text-[var(--color-ink-muted)] hover:text-black",
              )}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "background" && <BackgroundPanel project={project} screenshot={screenshot} />}
        {tab === "device" && <DevicePanel project={project} screenshot={screenshot} />}
        {tab === "text" && <TextPanel project={project} screenshot={screenshot} />}
        {tab === "elements" && <ElementsPanel project={project} screenshot={screenshot} />}
        {tab === "popouts" && <PopoutsPanel />}
      </div>
    </aside>
  );
}
