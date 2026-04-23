"use client";

import Link from "next/link";
import { Download, Home, Languages } from "lucide-react";
import type { Project, Locale } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Button } from "@/components/ui/button";

const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  pt: "Português",
};

interface Props {
  project: Project | null;
}

export function Topbar({ project }: Props) {
  const setExportOpen = useEditorStore((s) => s.setExportModalOpen);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const setActiveLocale = useEditorStore((s) => s.setActiveLocale);
  const renameProject = useProjectsStore((s) => s.renameProject);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-surface-2)] bg-white px-4">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-black hover:opacity-70"
        >
          <Home size={16} />
          <span className="hidden sm:inline">
            Frame<span className="text-[var(--color-brand-primary)]">launch</span>
          </span>
        </Link>
        <div className="h-5 w-px bg-[var(--color-surface-2)]" />
        {project && (
          <input
            value={project.name}
            onChange={(e) => renameProject(project.id, e.target.value)}
            className="w-56 rounded-[var(--radius-sm)] bg-transparent px-2 py-1 text-sm font-medium text-[var(--color-ink-strong)] hover:bg-[var(--color-surface-1)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {project && project.activeLocales.length > 1 && (
          <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-1)] px-2 py-1.5">
            <Languages size={14} className="text-[var(--color-ink-muted)]" />
            <select
              value={activeLocale}
              onChange={(e) => setActiveLocale(e.target.value as Locale)}
              className="bg-transparent text-xs font-medium text-[var(--color-ink-strong)] focus:outline-none"
            >
              {project.activeLocales.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button size="sm" onClick={() => setExportOpen(true)}>
          <Download size={14} />
          Dışa aktar
        </Button>
      </div>
    </header>
  );
}
