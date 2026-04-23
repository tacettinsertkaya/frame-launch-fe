"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Home, Info, Languages, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Locale, Project } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "./project/ProjectSelector";
import { ProjectNameModal } from "./project/ProjectNameModal";
import { DeleteProjectModal } from "./project/DeleteProjectModal";

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
  const openSettingsModal = useEditorStore((s) => s.openSettingsModal);
  const openAboutModal = useEditorStore((s) => s.openAboutModal);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const setActiveLocale = useEditorStore((s) => s.setActiveLocale);
  const openLanguagesModal = useEditorStore((s) => s.openLanguagesModal);
  const setCurrentLocale = useProjectsStore((s) => s.setCurrentLocale);
  const projects = useProjectsStore((s) => s.projects);

  const [newOpen, setNewOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteClick = () => {
    if (projects.length <= 1) {
      toast.info("En az bir proje olmalı");
      return;
    }
    setDeleteOpen(true);
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-[var(--color-surface-2)] bg-[var(--color-surface-0)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-sm font-bold text-black hover:opacity-70"
          >
            <Home size={16} />
            <span className="hidden sm:inline">
              Frame<span className="text-[var(--color-brand-primary)]">launch</span>
            </span>
          </Link>
          <div className="h-5 w-px shrink-0 bg-[var(--color-surface-2)]" />
          {project && (
            <>
              <ProjectSelector activeProject={project} projects={projects} />
              <div className="flex shrink-0 items-center gap-0.5">
                <IconBtn label="Yeni proje" onClick={() => setNewOpen(true)}>
                  <Plus size={14} />
                </IconBtn>
                <IconBtn
                  label="Yeniden adlandır"
                  onClick={() => setRenameOpen(true)}
                >
                  <Pencil size={14} />
                </IconBtn>
                <IconBtn label="Sil" danger onClick={handleDeleteClick}>
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconBtn label="Ayarlar" onClick={() => openSettingsModal()}>
            <Settings size={14} />
          </IconBtn>
          <IconBtn label="Hakkında" onClick={() => openAboutModal()}>
            <Info size={14} />
          </IconBtn>
          {project && (
            <>
              <button
                type="button"
                onClick={() => openLanguagesModal()}
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--color-surface-1)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink-strong)]"
                aria-label="Dilleri yönet"
                title="Dilleri yönet"
              >
                <Languages size={16} />
              </button>
              {project.activeLocales.length > 1 && (
                <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-1)] px-2 py-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Dil
                  </span>
                  <select
                    value={activeLocale}
                    onChange={(e) => {
                      const loc = e.target.value as Locale;
                      setCurrentLocale(project.id, loc);
                      setActiveLocale(loc);
                    }}
                    className="max-w-[120px] bg-transparent text-xs font-medium text-[var(--color-ink-strong)] focus:outline-none"
                  >
                    {project.activeLocales.map((l) => (
                      <option key={l} value={l}>
                        {LOCALE_LABELS[l]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <Button size="sm" onClick={() => setExportOpen(true)}>
            <Download size={14} />
            Dışa aktar
          </Button>
        </div>
      </header>

      <ProjectNameModal
        mode="new"
        open={newOpen}
        onOpenChange={setNewOpen}
        activeProject={project}
      />
      <ProjectNameModal
        mode="rename"
        open={renameOpen}
        onOpenChange={setRenameOpen}
        activeProject={project}
      />
      {project && (
        <DeleteProjectModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </>
  );
}

interface IconBtnProps {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}

function IconBtn({ children, onClick, label, danger }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors ${
        danger
          ? "hover:bg-red-50 hover:text-red-600"
          : "hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]"
      }`}
    >
      {children}
    </button>
  );
}
