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
      description={
        mode === "new"
          ? "Yeni bir proje oluşturun. Boş başlayın, mevcut projeyi çoğaltın veya bir şablon seçin."
          : "Aktif projenin adını değiştirin."
      }
      maxWidth={modalMaxWidth}
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[rgba(232,198,16,0.22)] bg-[linear-gradient(135deg,rgba(255,247,207,0.88)_0%,rgba(255,255,255,0.82)_100%)] p-4 shadow-[0_14px_36px_rgba(232,198,16,0.16)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            {mode === "new" ? "Project Setup" : "Project Identity"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-body)]">
            {mode === "new"
              ? "İsim, başlangıç noktası ve gerekiyorsa şablon seçimini tek akışta tamamlayın."
              : "Projenin görünen adını güncelleyin; mevcut ekranlar ve ayarlar olduğu gibi kalır."}
          </p>
        </div>
        <div>
          <label
            htmlFor="project-name-input"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]"
          >
            Proje Adı
          </label>
          <input
            id="project-name-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !submitDisabled) submit();
            }}
            placeholder="Örn. App Store Lansmanı"
            aria-invalid={!name.trim() || undefined}
            className="w-full rounded-[18px] border border-black/6 bg-white px-3 py-2.5 text-sm text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-colors focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 aria-[invalid=true]:border-[var(--color-danger)]"
          />
        </div>

        {mode === "new" && (
          <fieldset className="space-y-2 rounded-[22px] border border-black/6 bg-white/75 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
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

        <div className="flex flex-col-reverse gap-2 border-t border-black/6 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={submit}
            disabled={submitDisabled}
          >
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
      className={`flex w-full items-start gap-3 rounded-[18px] border px-3 py-3 text-left shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all focus:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]/30 ${
        active
          ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
          : "border-black/6 bg-white/80 hover:bg-white"
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
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--color-ink-strong)]">
          {label}
        </div>
        <div className="truncate text-xs text-[var(--color-ink-muted)]">{desc}</div>
      </div>
    </button>
  );
}
