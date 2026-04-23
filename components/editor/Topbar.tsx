"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Home, Languages, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Locale, Project } from "@/lib/types/project";
import { LOCALE_LABELS } from "@/lib/i18n/localeLabels";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "./project/ProjectSelector";
import { ProjectNameModal } from "./project/ProjectNameModal";
import { DeleteProjectModal } from "./project/DeleteProjectModal";

interface Props {
  project: Project | null;
}

export function Topbar({ project }: Props) {
  const setExportOpen = useEditorStore((s) => s.setExportModalOpen);
  const openSettingsModal = useEditorStore((s) => s.openSettingsModal);
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
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/5 bg-[color-mix(in_srgb,var(--color-surface-0)_72%,transparent)] px-4 backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Ana sayfaya dön"
            className="group relative flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-bold text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
          >
            <motion.span
              whileHover={{ rotate: -10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--color-brand-primary)] to-[#fff066] text-black shadow-[0_4px_14px_rgba(232,198,16,0.35)]"
            >
              <Home size={14} />
            </motion.span>
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
          {project && (
            <>
              <button
                type="button"
                onClick={() => openLanguagesModal()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-surface-1)] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                aria-label="Dilleri yönet"
                title="Dilleri yönet"
              >
                <Languages size={16} aria-hidden />
              </button>
              {project.activeLocales.length > 1 && (
                <div className="hidden items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-1)] px-2 py-1.5 sm:flex">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Dil
                  </span>
                  <select
                    value={activeLocale}
                    aria-label="Aktif dil"
                    onChange={(e) => {
                      const loc = e.target.value as Locale;
                      setCurrentLocale(project.id, loc);
                      setActiveLocale(loc);
                    }}
                    className="max-w-[120px] cursor-pointer bg-transparent text-xs font-medium text-[var(--color-ink-strong)] focus:outline-none"
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
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={() => setExportOpen(true)}
              className="btn-shimmer rounded-full shadow-[0_4px_18px_rgba(232,198,16,0.4)]"
            >
              <Download size={14} />
              Dışa aktar
            </Button>
          </motion.div>
        </div>
      </motion.header>

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
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.12, y: -1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 ${
        danger
          ? "hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-400"
          : "hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]"
      }`}
    >
      {children}
    </motion.button>
  );
}
