"use client";

import { Plus, Trash2, Copy, GripVertical, Languages } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Project, Screenshot, Locale } from "@/lib/types/project";
import { useProjectsStore, makeBlankScreenshot } from "@/store/projectsStore";
import { useEditorStore } from "@/store/editorStore";
import { Canvas } from "./Canvas";
import { cn, uid } from "@/lib/utils";

interface Props {
  project: Project;
}

export function ScreenshotsSidebar({ project }: Props) {
  const activeId = useEditorStore((s) => s.activeScreenshotId);
  const setActive = useEditorStore((s) => s.setActiveScreenshot);
  const activeLocale = useEditorStore((s) => s.activeLocale);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const removeScreenshot = useProjectsStore((s) => s.removeScreenshot);
  const reorderScreenshots = useProjectsStore((s) => s.reorderScreenshots);
  const openScreenshotTranslationsModal = useEditorStore(
    (s) => s.openScreenshotTranslationsModal,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addScreenshot = () => {
    const next = makeBlankScreenshot(`Ekran ${project.screenshots.length + 1}`);
    updateProject(project.id, (p) => {
      p.screenshots.push(next);
    });
    setActive(next.id);
  };

  const duplicate = (id: string) => {
    const src = project.screenshots.find((s) => s.id === id);
    if (!src) return;
    const next = structuredClone(src);
    next.id = uid("s_");
    next.name = `${src.name} kopya`;
    updateProject(project.id, (p) => {
      const idx = p.screenshots.findIndex((s) => s.id === id);
      p.screenshots.splice(idx + 1, 0, next);
    });
    setActive(next.id);
  };

  const remove = (id: string) => {
    if (project.screenshots.length === 1) {
      alert("En az bir ekran kalmalı.");
      return;
    }
    const idx = project.screenshots.findIndex((s) => s.id === id);
    removeScreenshot(project.id, id);
    if (activeId === id) {
      const next = project.screenshots[idx + 1] ?? project.screenshots[idx - 1];
      setActive(next?.id ?? null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const fromIdx = project.screenshots.findIndex((s) => s.id === active.id);
    const toIdx = project.screenshots.findIndex((s) => s.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;
    reorderScreenshots(project.id, fromIdx, toIdx);
  };

  const items = project.screenshots.map((s) => s.id);

  return (
    <aside className="flex h-full w-[200px] flex-col border-r border-[var(--color-surface-2)] bg-[var(--color-surface-1)]">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
          Ekranlar
        </h2>
        <button
          onClick={addScreenshot}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-black text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-dark-surface-2)]"
          aria-label="Yeni ekran"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {project.screenshots.map((s, i) => (
                <SortableRow
                  key={s.id}
                  screenshot={s}
                  index={i}
                  active={s.id === activeId}
                  locale={activeLocale}
                  onSelect={() => setActive(s.id)}
                  onDuplicate={() => duplicate(s.id)}
                  onRemove={() => remove(s.id)}
                  onTranslations={() => openScreenshotTranslationsModal(s.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}

interface SortableRowProps {
  screenshot: Screenshot;
  index: number;
  active: boolean;
  locale: Locale;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onTranslations: () => void;
}

function SortableRow({
  screenshot,
  index,
  active,
  locale,
  onSelect,
  onDuplicate,
  onRemove,
  onTranslations,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: screenshot.id });

  const thumbScale = 168 / 1320;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="group relative"
    >
      <button
        type="button"
        aria-label="Sürükle"
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 z-10 grid h-6 w-5 cursor-grab place-items-center rounded text-[var(--color-ink-muted)] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical size={12} />
      </button>
      <button
        onClick={onSelect}
        className={cn(
          "block w-full overflow-hidden rounded-[var(--radius-md)] border-2 transition-all",
          active
            ? "border-[var(--color-brand-primary)] shadow-[var(--shadow-md)]"
            : "border-transparent hover:border-[var(--color-surface-2)]",
        )}
      >
        <div className="pointer-events-none">
          <Canvas screenshot={screenshot} locale={locale} scale={thumbScale} />
        </div>
      </button>
      <div className="mt-1 flex items-center justify-between gap-1">
        <span className="truncate text-[11px] text-[var(--color-ink-body)]">
          {String(index + 1).padStart(2, "0")} · {screenshot.name}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTranslations();
            }}
            className="grid h-6 w-6 place-items-center rounded text-[var(--color-ink-muted)] hover:bg-white hover:text-[var(--color-ink-strong)]"
            aria-label="Çeviriler"
            title="Çeviriler"
          >
            <Languages size={11} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="grid h-6 w-6 place-items-center rounded text-[var(--color-ink-muted)] hover:bg-white hover:text-[var(--color-ink-strong)]"
            aria-label="Çoğalt"
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="grid h-6 w-6 place-items-center rounded text-[var(--color-ink-muted)] hover:bg-red-50 hover:text-red-500"
            aria-label="Sil"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
