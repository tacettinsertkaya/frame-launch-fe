"use client";

import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Languages,
  ArrowRightLeft,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
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
import { copyScreenshotStyleFromTo } from "@/lib/editor/styleTransfer";

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
  const transferTarget = useEditorStore((s) => s.transferTarget);
  const setTransferTarget = useEditorStore((s) => s.setTransferTarget);
  const openApplyStyleModal = useEditorStore((s) => s.openApplyStyleModal);
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);

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
      toast.info("En az bir ekran kalmalı.");
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

  const handleThumbnailClick = (clickedId: string) => {
    if (transferTarget) {
      if (clickedId === transferTarget) {
        setTransferTarget(null);
        toast.info("Stil aktarımı iptal edildi");
        return;
      }
      const src = project.screenshots.find((s) => s.id === clickedId);
      const tgt = project.screenshots.find((s) => s.id === transferTarget);
      if (!src || !tgt) {
        setTransferTarget(null);
        return;
      }
      updateScreenshot(project.id, transferTarget, (draft) => {
        copyScreenshotStyleFromTo(src, draft);
      });
      updateProject(project.id, (p) => {
        p.lastStyleSource = clickedId;
      });
      setTransferTarget(null);
      toast.success("Stil kopyalandı");
      setActive(clickedId);
      return;
    }
    setActive(clickedId);
  };

  return (
    <aside
      className="flex h-full w-[200px] shrink-0 flex-col border-r border-[var(--color-surface-2)] bg-[var(--color-surface-1)]"
      aria-label="Ekran listesi"
    >
      <div className="flex shrink-0 items-center justify-between px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
          Ekranlar
        </h2>
        <button
          type="button"
          onClick={addScreenshot}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-black text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-dark-surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-1)]"
          aria-label="Yeni ekran ekle"
        >
          <Plus size={14} aria-hidden />
        </button>
      </div>
      {transferTarget && (
        <div
          role="status"
          className="mx-2 mb-2 flex shrink-0 items-center justify-between gap-1 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] leading-tight text-amber-950"
        >
          <span className="min-w-0 flex-1 truncate">Kaynak ekrana tıklayın</span>
          <button
            type="button"
            className="shrink-0 rounded font-medium underline transition-colors hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            onClick={() => {
              setTransferTarget(null);
              toast.info("İptal");
            }}
          >
            İptal
          </button>
        </div>
      )}
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
                  isStyleRecipient={s.id === transferTarget}
                  onThumbnailClick={() => handleThumbnailClick(s.id)}
                  onDuplicate={() => duplicate(s.id)}
                  onRemove={() => remove(s.id)}
                  onTranslations={() => openScreenshotTranslationsModal(s.id)}
                  onMarkStyleRecipient={() => {
                    setTransferTarget(s.id);
                    toast.info("Şimdi stilin alınacağı kaynak ekrana tıklayın");
                  }}
                  onApplyStyleToAll={() => openApplyStyleModal(s.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}

interface RowActionProps {
  onClick: () => void;
  label: string;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}

function RowAction({ onClick, label, title, danger, children }: RowActionProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={title}
      className={cn(
        "grid h-6 w-6 place-items-center rounded text-[var(--color-ink-muted)] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface-1)]",
        danger
          ? "hover:bg-red-50 hover:text-red-500 focus-visible:ring-red-400"
          : "hover:bg-white hover:text-[var(--color-ink-strong)]",
      )}
    >
      {children}
    </button>
  );
}

interface SortableRowProps {
  screenshot: Screenshot;
  index: number;
  active: boolean;
  locale: Locale;
  isStyleRecipient: boolean;
  onThumbnailClick: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onTranslations: () => void;
  onMarkStyleRecipient: () => void;
  onApplyStyleToAll: () => void;
}

function SortableRow({
  screenshot,
  index,
  active,
  locale,
  isStyleRecipient,
  onThumbnailClick,
  onDuplicate,
  onRemove,
  onTranslations,
  onMarkStyleRecipient,
  onApplyStyleToAll,
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
        aria-label={`"${screenshot.name}" ekranını sürükle`}
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 z-10 grid h-6 w-5 cursor-grab place-items-center rounded text-[var(--color-ink-muted)] opacity-0 transition-opacity hover:bg-white/70 focus:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] active:cursor-grabbing"
      >
        <GripVertical size={12} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onThumbnailClick}
        aria-label={`${screenshot.name} ekranını seç`}
        aria-pressed={active}
        className={cn(
          "block w-full overflow-hidden rounded-[var(--radius-md)] border-2 transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-1)]",
          active
            ? "border-[var(--color-brand-primary)] shadow-[var(--shadow-md)]"
            : "border-transparent hover:border-[var(--color-surface-2)]",
          isStyleRecipient && "ring-2 ring-amber-400 ring-offset-1",
        )}
      >
        <div className="pointer-events-none">
          <Canvas screenshot={screenshot} locale={locale} scale={thumbScale} selectedElementId={null} />
        </div>
      </button>
      <div className="mt-1 flex items-center justify-between gap-1">
        <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--color-ink-body)]">
          {String(index + 1).padStart(2, "0")} · {screenshot.name}
        </span>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <RowAction onClick={onMarkStyleRecipient} label="Stil buraya kopyalansın" title="Önce bu hedefi seçin, sonra kaynak ekrana tıklayın">
            <ArrowRightLeft size={11} aria-hidden />
          </RowAction>
          <RowAction onClick={onApplyStyleToAll} label="Stili tüm ekranlara uygula" title="Bu ekranın stilini diğer tüm ekranlara uygula">
            <Layers size={11} aria-hidden />
          </RowAction>
          <RowAction onClick={onTranslations} label="Çevirileri yönet" title="Çeviriler">
            <Languages size={11} aria-hidden />
          </RowAction>
          <RowAction onClick={onDuplicate} label="Ekranı çoğalt" title="Çoğalt">
            <Copy size={11} aria-hidden />
          </RowAction>
          <RowAction onClick={onRemove} label="Ekranı sil" title="Sil" danger>
            <Trash2 size={11} aria-hidden />
          </RowAction>
        </div>
      </div>
    </div>
  );
}
