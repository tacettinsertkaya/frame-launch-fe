"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Project } from "@/lib/types/project";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectsStore } from "@/store/projectsStore";
import { TEMPLATES, getTemplate } from "@/lib/templates/registry";
import { executeProjectCreate, type CreateMode } from "./ProjectNameModal.helpers";
import { TemplatePickerGrid } from "./TemplatePickerGrid";

interface Props {
  mode: "new" | "rename";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeProject: Project | null;
}

export function ProjectNameModal({
  mode,
  open,
  onOpenChange,
  activeProject,
}: Props) {
  const createProject = useProjectsStore((s) => s.createProject);
  const duplicateProject = useProjectsStore((s) => s.duplicateProject);
  const renameProject = useProjectsStore((s) => s.renameProject);

  const [name, setName] = useState("");
  const [createMode, setCreateMode] = useState<CreateMode>("blank");
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "rename") {
      setName(activeProject?.name ?? "");
    } else {
      setName("Yeni Proje");
      setCreateMode("blank");
      setTemplateId(null);
    }
  }, [open, mode, activeProject?.id, activeProject?.name]);

  const submitDisabled =
    !name.trim() ||
    (mode === "new" && createMode === "template" && !templateId);

  const submit = () => {
    if (submitDisabled) return;
    const trimmed = name.trim();

    if (mode === "rename") {
      if (!activeProject) return;
      renameProject(activeProject.id, trimmed);
      toast.success("Proje yeniden adlandırıldı");
      onOpenChange(false);
      return;
    }

    const tmpl =
      createMode === "template" && templateId ? getTemplate(templateId) : null;
    const res = executeProjectCreate({
      mode: createMode,
      name: trimmed,
      activeProjectId: activeProject?.id ?? null,
      templateBuild: tmpl?.build,
      createProject,
      duplicateProject,
    });

    if (!res) {
      toast.error("Proje oluşturulamadı");
      return;
    }
    toast.success(`"${res.name}" oluşturuldu`);
    onOpenChange(false);
  };

  const modalMaxWidth = mode === "new" && createMode === "template" ? "720px" : "480px";

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={mode === "new" ? "Yeni Proje" : "Projeyi Yeniden Adlandır"}
      maxWidth={modalMaxWidth}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            Proje Adı
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !submitDisabled) submit();
            }}
            placeholder="Örn. App Store Lansmanı"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
          />
        </div>

        {mode === "new" && (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
              Başlangıç Noktası
            </legend>
            <RadioRow
              value="blank"
              label="Boş proje"
              desc="Tek boş ekranla başla"
              current={createMode}
              onSelect={setCreateMode}
            />
            {activeProject && (
              <RadioRow
                value="duplicate"
                label="Bu projeyi çoğalt"
                desc={`"${activeProject.name}" kopyalanır`}
                current={createMode}
                onSelect={setCreateMode}
              />
            )}
            <RadioRow
              value="template"
              label="Şablondan başla"
              desc={`${TEMPLATES.length} hazır şablon`}
              current={createMode}
              onSelect={setCreateMode}
            />
            {createMode === "template" && (
              <div className="pt-2">
                <TemplatePickerGrid
                  selectedId={templateId}
                  onSelect={setTemplateId}
                />
              </div>
            )}
          </fieldset>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button size="sm" onClick={submit} disabled={submitDisabled}>
            {mode === "new" ? "Oluştur" : "Kaydet"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

interface RadioRowProps {
  value: CreateMode;
  label: string;
  desc: string;
  current: CreateMode;
  onSelect: (v: CreateMode) => void;
}

function RadioRow({ value, label, desc, current, onSelect }: RadioRowProps) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-3 py-2 text-left transition-all ${
        active
          ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
          : "border-[var(--color-surface-2)] hover:bg-[var(--color-surface-1)]"
      }`}
    >
      <div
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
          active
            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]"
            : "border-[var(--color-surface-3)]"
        }`}
      >
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--color-ink-strong)]">
          {label}
        </div>
        <div className="text-xs text-[var(--color-ink-muted)]">{desc}</div>
      </div>
    </button>
  );
}
