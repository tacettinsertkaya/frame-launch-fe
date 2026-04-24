"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Globe2,
  Images,
  Languages,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { BrandLockup } from "@/components/BrandLockup";
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
        className="sticky top-0 z-40 px-3 pt-3 md:px-4 md:pt-4"
      >
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[rgba(255,255,255,0.76)] shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                aria-label="Ana sayfaya dön"
                className="group relative flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-bold text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
              >
                <BrandLockup variant="on-surface" imageClassName="rounded-md" />
              </Link>
              <div className="hidden h-5 w-px shrink-0 bg-black/10 sm:block" />
              {project && (
                <>
                  <ProjectSelector activeProject={project} projects={projects} />
                  <div className="hidden shrink-0 items-center gap-0.5 md:flex">
                    <IconBtn label="Yeni proje" onClick={() => setNewOpen(true)}>
                      <Plus size={14} />
                    </IconBtn>
                    <IconBtn label="Yeniden adlandır" onClick={() => setRenameOpen(true)}>
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
              {project && (
                <div className="flex items-center gap-1 md:hidden">
                  <IconBtn label="Yeni proje" onClick={() => setNewOpen(true)}>
                    <Plus size={14} />
                  </IconBtn>
                  <IconBtn label="Yeniden adlandır" onClick={() => setRenameOpen(true)}>
                    <Pencil size={14} />
                  </IconBtn>
                  <IconBtn label="Sil" danger onClick={handleDeleteClick}>
                    <Trash2 size={14} />
                  </IconBtn>
                </div>
              )}
              <IconBtn label="Ayarlar" onClick={() => openSettingsModal()}>
                <Settings size={14} />
              </IconBtn>
              {project && (
                <button
                  type="button"
                  onClick={() => openLanguagesModal()}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 text-xs font-semibold text-[var(--color-ink-body)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                  aria-label="Dilleri yönet"
                  title="Dilleri yönet"
                >
                  <Languages size={16} aria-hidden />
                  <span className="hidden sm:inline">Diller</span>
                </button>
              )}
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="sm"
                  onClick={() => setExportOpen(true)}
                  className="btn-shimmer rounded-full shadow-[0_8px_24px_rgba(232,198,16,0.32)]"
                >
                  <Download size={14} />
                  Dışa aktar
                </Button>
              </motion.div>
            </div>
          </div>

          {project && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="border-t border-black/6 px-4 py-3 md:px-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <MetaPill
                    icon={<Images size={14} aria-hidden />}
                    label={`${project.screenshots.length} ekran`}
                  />
                  <MetaPill
                    icon={<Globe2 size={14} aria-hidden />}
                    label={`${project.activeLocales.length} dil`}
                  />
                  <MetaPill
                    icon={<Sparkles size={14} aria-hidden />}
                    label={`${LOCALE_LABELS[activeLocale]} aktif`}
                    accent
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2 md:items-end">
                  {project.activeLocales.length > 1 && (
                    <>
                      <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:hidden">
                        {project.activeLocales.map((locale) => {
                          const isActive = locale === activeLocale;
                          return (
                            <button
                              key={locale}
                              type="button"
                              onClick={() => {
                                setCurrentLocale(project.id, locale);
                                setActiveLocale(locale);
                              }}
                              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
                                isActive
                                  ? "bg-black text-white"
                                  : "border border-black/10 bg-white/70 text-[var(--color-ink-body)]"
                              }`}
                            >
                              {LOCALE_LABELS[locale]}
                            </button>
                          );
                        })}
                      </div>

                      <div className="hidden items-center gap-1.5 rounded-full border border-black/8 bg-white/70 px-2 py-1.5 sm:flex">
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
                          className="max-w-[140px] cursor-pointer bg-transparent text-xs font-medium text-[var(--color-ink-strong)] focus:outline-none"
                        >
                          {project.activeLocales.map((l) => (
                            <option key={l} value={l}>
                              {LOCALE_LABELS[l]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Değişiklikler otomatik kaydedilir. Sıralamayı ve dili buradan hızla gözden geçirin.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/6 bg-white/65 text-[var(--color-ink-muted)] shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 ${danger
          ? "hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-400"
          : "hover:bg-white hover:text-[var(--color-ink-strong)]"
        }`}
    >
      {children}
    </motion.button>
  );
}

interface MetaPillProps {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}

function MetaPill({ icon, label, accent }: MetaPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        accent
          ? "bg-[rgba(232,198,16,0.18)] text-[var(--color-ink-strong)]"
          : "border border-black/8 bg-white/70 text-[var(--color-ink-body)]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
