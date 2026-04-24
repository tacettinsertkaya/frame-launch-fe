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
        aria-label={`Aktif proje: ${activeProject.name}. Projeyi değiştir`}
        className="flex max-w-[60vw] items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-2 text-left shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 sm:max-w-[280px]"
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
          aria-hidden
          className={cn(
            "shrink-0 text-[var(--color-ink-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-[24px] border border-black/8 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
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
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                  >
                    {active ? (
                      <Check
                        size={14}
                        aria-hidden
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
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-black/6 bg-white/80 text-[var(--color-ink-muted)] opacity-100 transition-colors hover:bg-white hover:text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
                  >
                    <Copy size={12} aria-hidden />
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
