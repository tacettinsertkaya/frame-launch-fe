"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import type { Project } from "@/lib/types/project";
import { useProjectsStore } from "@/store/projectsStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleDuplicate = (id: string, name: string) => {
    const created = duplicate(id);
    if (created) {
      toast.success(`"${created.name}" oluşturuldu`);
    } else {
      toast.error(`"${name}" çoğaltılamadı`);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left hover:bg-[var(--color-surface-1)]"
      >
        <div className="min-w-0 max-w-[180px]">
          <div className="truncate text-sm font-medium text-[var(--color-ink-strong)]">
            {activeProject.name}
          </div>
          <div className="truncate text-[11px] text-[var(--color-ink-muted)] max-sm:hidden">
            {activeProject.screenshots.length} ekran
          </div>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-[var(--color-ink-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white shadow-[var(--shadow-md)]">
          <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
            {projects.map((p) => {
              const active = p.id === activeProject.id;
              return (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "group flex items-center justify-between gap-1 px-2 py-1 text-sm transition-colors",
                    active
                      ? "bg-[var(--color-surface-1)]"
                      : "hover:bg-[var(--color-surface-1)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActive(p.id);
                      setOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-left"
                  >
                    {active ? (
                      <Check
                        size={14}
                        className="shrink-0 text-[var(--color-brand-primary)]"
                      />
                    ) : (
                      <span className="inline-block w-[14px]" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1 truncate font-medium text-[var(--color-ink-strong)]">
                      {p.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--color-ink-muted)]">
                      {p.screenshots.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(p.id, p.name)}
                    aria-label={`"${p.name}" projesini çoğalt`}
                    title="Çoğalt"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] opacity-0 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink-strong)] focus:opacity-100 group-hover:opacity-100"
                  >
                    <Copy size={12} />
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
