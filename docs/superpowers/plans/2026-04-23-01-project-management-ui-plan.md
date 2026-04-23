# 01 — Project Management UI — Implementation Plan

**Tarih:** 2026-04-23
**Spec:** `2026-04-23-01-project-management-ui-design.md`
**Workflow:** TDD — her task: test yaz → çalıştır (RED) → implementasyon → çalıştır (GREEN) → commit.

Test edilebilirlik için mümkün olduğunda pure helper'lar ayrıştırılır, component'ler ince tutulur.

---

## Task 1 — Dep ekle: @radix-ui/react-dialog + sonner

**Amaç:** Modal primitive + toast altyapısı.

```bash
pnpm add @radix-ui/react-dialog sonner
```

**Doğrulama:** `node_modules/@radix-ui/react-dialog/package.json` mevcut; `node_modules/sonner/package.json` mevcut. `package.json` diff: 2 yeni dep.

**Commit:** `chore: add @radix-ui/react-dialog + sonner for modals & toasts`

---

## Task 2 — `components/ui/dialog.tsx` primitive'i

**Amaç:** shadcn/ui-uyumlu Radix Dialog wrapper.

**Testler:** Primitive olduğu için unit test zorunlu değil; visual smoke test build + integration ile yeterli. Dosyayı yaz, `tsc --noEmit` pass olmalı.

**İçerik:** shadcn/ui resmi `dialog.tsx` snippet'ini projeye al (Dialog / DialogTrigger / DialogContent / DialogHeader / DialogTitle / DialogDescription / DialogFooter / DialogClose). Tailwind v4 class'ları:
- overlay: `fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out ...`
- content: `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-lg)] ...`

**Doğrulama:** `./node_modules/.bin/tsc --noEmit` 0 error.

**Commit:** `feat(ui): add Dialog primitive (Radix wrapper)`

---

## Task 3 — `<Toaster />` layout'a ekle

**Amaç:** Toast'lar global olarak çalışsın.

**Dosya:** `app/layout.tsx` → `<body>` içine `<Toaster richColors position="bottom-right" />` eklenir (sonner'dan).

**Doğrulama:** dev server hata vermeden açılır, `toast("test")` çağrılarında toast görünür (manuel smoke sonra).

**Commit:** `feat(layout): add sonner Toaster to root layout`

---

## Task 4 — Helper: `buildProjectFromMode` (TDD)

**Amaç:** Modal'ın "Oluştur" aksiyonunun test edilebilir özü.

**Test dosyası:** `components/editor/project/ProjectNameModal.helpers.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { executeProjectCreate } from "./ProjectNameModal.helpers";
import type { Project } from "@/lib/types/project";

const mkProject = (id: string, name: string): Project => ({
  id, name, createdAt: "", updatedAt: "", schemaVersion: 3,
  defaultLocale: "tr", activeLocales: ["tr"], currentLocale: "tr",
  defaultDeviceSizeId: "iphone-69", screenshots: [],
});

describe("executeProjectCreate", () => {
  it("mode=blank → createProject(name, undefined)", () => {
    const createProject = vi.fn().mockReturnValue(mkProject("new", "X"));
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "blank", name: "X", activeProjectId: "p1",
      templateBuild: undefined, createProject, duplicateProject,
    });
    expect(createProject).toHaveBeenCalledWith("X", undefined);
    expect(duplicateProject).not.toHaveBeenCalled();
    expect(res?.id).toBe("new");
  });

  it("mode=duplicate → duplicateProject(activeId, name)", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn().mockReturnValue(mkProject("dup", "X kopya"));
    const res = executeProjectCreate({
      mode: "duplicate", name: "X kopya", activeProjectId: "p1",
      templateBuild: undefined, createProject, duplicateProject,
    });
    expect(duplicateProject).toHaveBeenCalledWith("p1", "X kopya");
    expect(res?.id).toBe("dup");
  });

  it("mode=template → createProject(name, built)", () => {
    const built = mkProject("tmpl_raw", "Tmpl");
    const createProject = vi.fn().mockReturnValue(mkProject("tmpl_final", "Benim"));
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "template", name: "Benim", activeProjectId: "p1",
      templateBuild: () => built, createProject, duplicateProject,
    });
    expect(createProject).toHaveBeenCalledWith("Benim", built);
    expect(res?.id).toBe("tmpl_final");
  });

  it("mode=duplicate with no activeProjectId returns null", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "duplicate", name: "X", activeProjectId: null,
      templateBuild: undefined, createProject, duplicateProject,
    });
    expect(res).toBeNull();
    expect(duplicateProject).not.toHaveBeenCalled();
  });

  it("mode=template with no templateBuild returns null", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "template", name: "X", activeProjectId: "p1",
      templateBuild: undefined, createProject, duplicateProject,
    });
    expect(res).toBeNull();
    expect(createProject).not.toHaveBeenCalled();
  });

  it("empty/whitespace name returns null", () => {
    const createProject = vi.fn();
    const duplicateProject = vi.fn();
    const res = executeProjectCreate({
      mode: "blank", name: "   ", activeProjectId: "p1",
      templateBuild: undefined, createProject, duplicateProject,
    });
    expect(res).toBeNull();
    expect(createProject).not.toHaveBeenCalled();
  });
});
```

**Testi çalıştır:** `./node_modules/.bin/vitest run components/editor/project/ProjectNameModal.helpers.test.ts` → **RED**.

**Implementasyon:** `components/editor/project/ProjectNameModal.helpers.ts`

```ts
import type { Project } from "@/lib/types/project";

export type CreateMode = "blank" | "duplicate" | "template";

export interface ExecuteCreateArgs {
  mode: CreateMode;
  name: string;
  activeProjectId: string | null;
  templateBuild: (() => Project) | undefined;
  createProject: (name?: string, fromTemplate?: Project) => Project;
  duplicateProject: (id: string, name?: string) => Project | null;
}

export function executeProjectCreate(args: ExecuteCreateArgs): Project | null {
  const name = args.name.trim();
  if (!name) return null;
  if (args.mode === "blank") return args.createProject(name, undefined);
  if (args.mode === "duplicate") {
    if (!args.activeProjectId) return null;
    return args.duplicateProject(args.activeProjectId, name);
  }
  if (args.mode === "template") {
    if (!args.templateBuild) return null;
    const built = args.templateBuild();
    return args.createProject(name, built);
  }
  return null;
}
```

**Test tekrar:** **GREEN** (6/6 pass).

**Commit:** `feat(project): add executeProjectCreate helper with 6 unit tests`

---

## Task 5 — `<ProjectSelector />` component (stateless UI)

**Amaç:** Topbar'daki dropdown trigger + popover.

Popover primitive için `<Popover>` zaten yok. İki seçenek:
- `@radix-ui/react-popover` ekle (önerilen, dialog ile tutarlı)
- Kendi outside-click detection + `<div>` ile yap

**Karar:** basit `<details>`/kendi popover ile başla (zaten mevcut BackgroundPanel'de `<details>` yok ama benzer pattern `<div>` + state yeterli). Radix popover gereksiz — dropdown küçük.

**Implementasyon:** `components/editor/project/ProjectSelector.tsx`

```tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Copy, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { cn } from "@/lib/utils";

interface Props {
  activeProject: Project;
  projects: Project[];
}

export function ProjectSelector({ activeProject, projects }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setActive = useProjectsStore((s) => s.setActiveProject);
  const duplicate = useProjectsStore((s) => s.duplicateProject);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-1)] px-2.5 py-1.5 text-left hover:bg-[var(--color-surface-2)]"
      >
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[var(--color-ink-strong)]">
            {activeProject.name}
          </div>
          <div className="truncate text-[11px] text-[var(--color-ink-muted)] max-sm:hidden">
            {activeProject.screenshots.length} ekran
          </div>
        </div>
        <ChevronDown size={14} className="text-[var(--color-ink-muted)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white shadow-[var(--shadow-md)]">
          <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
            {projects.map((p) => {
              const active = p.id === activeProject.id;
              return (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "group flex items-center justify-between gap-2 px-3 py-1.5 text-sm hover:bg-[var(--color-surface-1)]",
                    active && "bg-[var(--color-surface-1)]",
                  )}
                >
                  <button
                    onClick={() => {
                      setActive(p.id);
                      setOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    {active ? (
                      <Check size={14} className="shrink-0 text-[var(--color-brand-primary)]" />
                    ) : (
                      <span className="inline-block w-[14px]" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="shrink-0 text-[11px] text-[var(--color-ink-muted)]">
                      {p.screenshots.length}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      duplicate(p.id);
                      setOpen(false);
                    }}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded text-[var(--color-ink-muted)] opacity-0 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink-strong)] group-hover:opacity-100"
                    aria-label="Çoğalt"
                    title="Çoğalt"
                  >
                    <Copy size={11} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Test:** unit test yok (stateful UI); component testi opsiyonel. Tsc doğrulanacak.

**Doğrulama:** `tsc --noEmit` 0 error.

**Commit:** `feat(project): add ProjectSelector dropdown with quick duplicate`

---

## Task 6 — `<DeleteProjectModal />`

**Amaç:** Silme onayı.

**Implementasyon:** `components/editor/project/DeleteProjectModal.tsx`

```tsx
"use client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectsStore } from "@/store/projectsStore";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  projectName: string;
}

export function DeleteProjectModal({ open, onOpenChange, projectId, projectName }: Props) {
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const confirm = () => {
    deleteProject(projectId);
    toast.success(`"${projectName}" silindi`);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Projeyi sil?</DialogTitle>
          <DialogDescription>
            <strong>&quot;{projectName}&quot;</strong> silinecek. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button variant="destructive" onClick={confirm}>Sil</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Button `variant="destructive"`**: `components/ui/button.tsx`'e yok ise eklenir (Tailwind v4 class: `bg-red-600 text-white hover:bg-red-700`).

**Doğrulama:** tsc 0 error.

**Commit:** `feat(project): add DeleteProjectModal with confirmation`

---

## Task 7 — `<TemplatePickerGrid />`

**Amaç:** ProjectNameModal içinde şablon kart grid'i.

**Implementasyon:** `components/editor/project/TemplatePickerGrid.tsx`

```tsx
"use client";
import { TEMPLATES } from "@/lib/templates/registry";
import { Canvas } from "@/components/editor/Canvas";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TemplatePickerGrid({ selectedId, onSelect }: Props) {
  const previews = useMemo(() => TEMPLATES.map((t) => ({ meta: t, built: t.build() })), []);
  return (
    <div className="grid grid-cols-2 gap-3">
      {previews.map(({ meta, built }) => {
        const first = built.screenshots[0];
        const selected = selectedId === meta.id;
        return (
          <button
            key={meta.id}
            type="button"
            onClick={() => onSelect(meta.id)}
            className={cn(
              "group overflow-hidden rounded-[var(--radius-md)] border-2 text-left transition-all",
              selected
                ? "border-[var(--color-brand-primary)] shadow-[var(--shadow-md)]"
                : "border-[var(--color-surface-2)] hover:border-[var(--color-surface-2)]",
            )}
          >
            <div className="relative aspect-[1320/2000] overflow-hidden bg-[var(--color-surface-1)]">
              <div className="pointer-events-none absolute inset-0 origin-top-left">
                <Canvas screenshot={first} locale="tr" scale={140 / 1320} />
              </div>
            </div>
            <div className="px-2 py-1.5">
              <div className="truncate text-xs font-semibold text-[var(--color-ink-strong)]">
                {meta.name}
              </div>
              <div className="truncate text-[11px] text-[var(--color-ink-muted)]">
                {meta.category} · {built.screenshots.length} ekran
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

**Not:** `t.build()` her component mount'ta bir kez çağrılır (useMemo ile). Canvas component'i screenshot objesini alır.

**Doğrulama:** tsc 0 error. Daha önce `Canvas` component'i import'u için dev server'da template seçerken canvas render edilebiliyor mu manuel kontrol.

**Commit:** `feat(project): add TemplatePickerGrid with live canvas preview`

---

## Task 8 — `<ProjectNameModal />`

**Amaç:** Yeni proje + rename modal'ı.

**Implementasyon:** `components/editor/project/ProjectNameModal.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectsStore } from "@/store/projectsStore";
import { TEMPLATES, getTemplate } from "@/lib/templates/registry";
import type { Project } from "@/lib/types/project";
import { toast } from "sonner";
import { executeProjectCreate, type CreateMode } from "./ProjectNameModal.helpers";
import { TemplatePickerGrid } from "./TemplatePickerGrid";

interface Props {
  mode: "new" | "rename";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeProject: Project | null;
}

export function ProjectNameModal({ mode, open, onOpenChange, activeProject }: Props) {
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

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (mode === "rename") {
      if (!activeProject) return;
      renameProject(activeProject.id, trimmed);
      toast.success("Proje yeniden adlandırıldı");
      onOpenChange(false);
      return;
    }
    const tmpl = createMode === "template" && templateId ? getTemplate(templateId) : null;
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

  const submitDisabled =
    !name.trim() || (mode === "new" && createMode === "template" && !templateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Yeni Proje" : "Projeyi Yeniden Adlandır"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
              Proje Adı
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !submitDisabled) submit();
              }}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>

          {mode === "new" && (
            <fieldset className="space-y-2">
              <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                Başlangıç Noktası
              </legend>
              <RadioRow id="blank" value="blank" label="Boş proje" desc="Tek boş ekran" current={createMode} onSelect={setCreateMode} />
              {activeProject && (
                <RadioRow
                  id="duplicate" value="duplicate"
                  label={`Bu projeyi çoğalt`}
                  desc={`"${activeProject.name}" kopyalanır`}
                  current={createMode} onSelect={setCreateMode}
                />
              )}
              <RadioRow id="template" value="template" label="Şablondan başla" desc={`${TEMPLATES.length} şablon`} current={createMode} onSelect={setCreateMode} />
              {createMode === "template" && (
                <div className="pt-2">
                  <TemplatePickerGrid selectedId={templateId} onSelect={setTemplateId} />
                </div>
              )}
            </fieldset>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={submit} disabled={submitDisabled}>
            {mode === "new" ? "Oluştur" : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioRow({ id, value, label, desc, current, onSelect }: {
  id: string; value: CreateMode; label: string; desc: string;
  current: CreateMode; onSelect: (v: CreateMode) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-3 py-2 text-left transition-all ${
        active ? "border-[var(--color-brand-primary)] bg-[var(--color-surface-1)]" : "border-[var(--color-surface-2)] hover:bg-[var(--color-surface-1)]"
      }`}
      aria-pressed={active}
    >
      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 ${active ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]" : "border-[var(--color-surface-2)]"}`}>
        {active && <div className="mx-auto mt-[3px] h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--color-ink-strong)]">{label}</div>
        <div className="text-xs text-[var(--color-ink-muted)]">{desc}</div>
      </div>
    </button>
  );
}
```

**Doğrulama:** tsc 0 error.

**Commit:** `feat(project): add ProjectNameModal for new/rename with template picker`

---

## Task 9 — Topbar yeniden düzenleme

**Amaç:** Inline rename'i kaldır, ProjectSelector + 3 ikon buton ekle.

**Dosya:** `components/editor/Topbar.tsx`

```tsx
"use client";
import Link from "next/link";
import { Download, Home, Languages, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Project, Locale } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "./project/ProjectSelector";
import { ProjectNameModal } from "./project/ProjectNameModal";
import { DeleteProjectModal } from "./project/DeleteProjectModal";
import { toast } from "sonner";

const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe", en: "English", de: "Deutsch", es: "Español",
  fr: "Français", ja: "日本語", pt: "Português",
};

interface Props { project: Project | null; }

export function Topbar({ project }: Props) {
  const setExportOpen = useEditorStore((s) => s.setExportModalOpen);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const setActiveLocale = useEditorStore((s) => s.setActiveLocale);
  const projects = useProjectsStore((s) => s.projects);

  const [newModal, setNewModal] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const openDelete = () => {
    if (projects.length <= 1) {
      toast.info("En az bir proje olmalı.");
      return;
    }
    setDeleteModal(true);
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-[var(--color-surface-2)] bg-white px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-black hover:opacity-70">
            <Home size={16} />
            <span className="hidden sm:inline">
              Frame<span className="text-[var(--color-brand-primary)]">launch</span>
            </span>
          </Link>
          <div className="h-5 w-px bg-[var(--color-surface-2)]" />
          {project && (
            <>
              <ProjectSelector activeProject={project} projects={projects} />
              <div className="flex items-center gap-0.5">
                <IconBtn label="Yeni proje" onClick={() => setNewModal(true)}><Plus size={14} /></IconBtn>
                <IconBtn label="Yeniden adlandır" onClick={() => setRenameModal(true)}><Pencil size={14} /></IconBtn>
                <IconBtn label="Sil" danger onClick={openDelete}><Trash2 size={14} /></IconBtn>
              </div>
            </>
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
                  <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
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

      <ProjectNameModal mode="new" open={newModal} onOpenChange={setNewModal} activeProject={project} />
      <ProjectNameModal mode="rename" open={renameModal} onOpenChange={setRenameModal} activeProject={project} />
      {project && (
        <DeleteProjectModal
          open={deleteModal}
          onOpenChange={setDeleteModal}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </>
  );
}

function IconBtn({ children, onClick, label, danger }: {
  children: React.ReactNode; onClick: () => void; label: string; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors ${
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]"
      }`}
    >
      {children}
    </button>
  );
}
```

**Doğrulama:** tsc 0 error. `pnpm build` başarılı.

**Commit:** `feat(topbar): replace inline rename with ProjectSelector + project modals`

---

## Task 10 — Button variant="destructive" (gerekliyse)

**Amaç:** DeleteProjectModal'da kullanılan destructive variant.

**Kontrol:** `components/ui/button.tsx`'te variant tanımına bak.

Eğer yoksa, `buttonVariants` `cva` objesine:
```ts
destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
```

**Doğrulama:** tsc 0 error, DeleteProjectModal render ediliyor.

**Commit:** `feat(ui): add destructive variant to Button` (only if needed)

---

## Task 11 — Test çalıştır + typecheck + build

```bash
./node_modules/.bin/vitest run
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
```

Hepsi yeşil olmalı. Mevcut 50 test + yeni 6 helper testi = **56 test pass**.

**Eğer failing varsa:** fix et, yeniden çalıştır.

---

## Task 12 — Manuel smoke test (dev server)

```bash
./node_modules/.bin/next dev --turbo
```

Browser'da http://localhost:3000/editor:

**Checklist:**
- [ ] Topbar'da ProjectSelector trigger görünür, "İlk Proje · 1 ekran" yazıyor
- [ ] Trigger'a tıkla → dropdown açılır, tek proje var
- [ ] `+` butonu → ProjectNameModal açılır
- [ ] "Boş proje" seçili, default "Yeni Proje" → Oluştur → yeni proje aktif, toast görünür
- [ ] Dropdown'a yeniden bak → 2 proje var, yeni olan seçili
- [ ] İlk projeye geri dön (dropdown'dan)
- [ ] Kalem ikonu → rename modal "İlk Proje" default ile açılır → "İlk Proje 2026" yaz → Kaydet → topbar güncellenir
- [ ] Yeni proje → template seç → bir şablon → Oluştur → doğru template içeriği görünür
- [ ] Yeni proje → "Bu projeyi çoğalt" → Oluştur → aynı içerikli kopya aktif olur
- [ ] Dropdown'daki bir proje satırına hover → Copy ikon → tıkla → quick duplicate çalışır
- [ ] Çöp ikon → onay modal → Sil → proje silinir
- [ ] Son proje kalınca çöp ikon → toast "En az bir proje olmalı", modal açılmaz
- [ ] Sayfa yenile → aktif proje + isim korunur, localStorage v2 key mevcut

**Sorun yoksa dev server'ı kapat.**

---

## Task 13 — Final commit (eğer ek fixler yapıldıysa) + özet

Her şey yeşilse, `git log --oneline` ile son 10-12 commit'i göster, kullanıcıya özet sun.

---

## Gelecek Adımlar (scope dışı)

- Proje arama (projects > 10 olunca dropdown'a input)
- Kısayollar (⌘N, ⌘⇧R) — alt-proje 15
- Proje thumbnail önizlemesi dropdown'da (ilk screenshot'ın minik canvas'ı) — potansiyel polish
