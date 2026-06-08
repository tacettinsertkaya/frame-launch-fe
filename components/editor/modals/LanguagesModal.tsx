"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Locale, Project } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ALL_LOCALES } from "@/lib/i18n/filenameLocale";

const LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  pt: "Português",
};

interface Props {
  project: Project;
}

export function LanguagesModal({ project }: Props) {
  const open = useEditorStore((s) => s.languagesModalOpen);
  const close = useEditorStore((s) => s.closeLanguagesModal);
  const addLocale = useProjectsStore((s) => s.addLocale);
  const removeLocale = useProjectsStore((s) => s.removeLocale);
  const setActiveLocale = useEditorStore((s) => s.setActiveLocale);

  const [pick, setPick] = useState<Locale | "">("");

  const addable = useMemo(
    () => ALL_LOCALES.filter((l) => !project.activeLocales.includes(l)),
    [project.activeLocales],
  );

  const onAdd = () => {
    if (!pick) return;
    addLocale(project.id, pick as Locale);
    useProjectsStore.getState().setCurrentLocale(project.id, pick as Locale);
    setActiveLocale(pick as Locale);
    setPick("");
    toast.success(`${LABELS[pick as Locale]} eklendi`);
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Diller"
      description="Projedeki dilleri yönet"
      maxWidth="440px"
    >
      <div className="rounded-[22px] border border-[rgba(232,198,16,0.22)] bg-[linear-gradient(135deg,rgba(255,247,207,0.88)_0%,rgba(255,255,255,0.82)_100%)] p-4 shadow-[0_14px_36px_rgba(232,198,16,0.16)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          Locale Stack
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-body)]">
          Projede hangi dillerin kullanılacağını yönetin. En az bir dil kalmalıdır.
        </p>
      </div>
      <ul className="mt-4 space-y-2" role="list">
        {project.activeLocales.map((loc) => (
          <li
            key={loc}
            className="flex items-center justify-between gap-3 rounded-[20px] border border-black/6 bg-white/75 px-3 py-3 text-sm shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
          >
            <span className="min-w-0 truncate">
              <strong className="text-[var(--color-ink-strong)]">{LABELS[loc]}</strong>{" "}
              <span className="text-[var(--color-ink-muted)]">({loc})</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600"
              disabled={project.activeLocales.length <= 1}
              onClick={() => {
                if (project.activeLocales.length <= 1) {
                  toast.info("En az bir dil kalmalı");
                  return;
                }
                removeLocale(project.id, loc);
                const p = useProjectsStore.getState().projects.find((x) => x.id === project.id);
                if (p) setActiveLocale(p.currentLocale);
                toast.success("Dil kaldırıldı");
              }}
            >
              Kaldır
            </Button>
          </li>
        ))}
      </ul>
      {addable.length > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-black/6 pt-4">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-[var(--color-ink-body)] sm:flex-none">
            Dil ekle
            <select
              value={pick}
              onChange={(e) => setPick(e.target.value as Locale | "")}
              className="w-full rounded-[18px] border border-black/6 bg-white px-3 py-2 text-sm text-[var(--color-ink-strong)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)] sm:w-auto"
            >
              <option value="">Seçin…</option>
              {addable.map((l) => (
                <option key={l} value={l}>
                  {LABELS[l]}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" size="sm" disabled={!pick} onClick={onAdd}>
            Ekle
          </Button>
        </div>
      )}
      <div className="mt-6 flex justify-end border-t border-black/6 pt-4">
        <Button type="button" variant="outline" onClick={close}>
          Kapat
        </Button>
      </div>
    </Dialog>
  );
}
