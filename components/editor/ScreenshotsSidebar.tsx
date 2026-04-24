"use client";

import { motion } from "framer-motion";
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
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-[min(92vw,320px)] shrink-0 flex-col overflow-hidden rounded-[26px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,244,228,0.9)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.08)] md:w-[272px]"
      aria-label="Ekran listesi"
    >
      <div className="shrink-0 border-b border-black/6 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
              Storyboard
            </p>
            <h2 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-[var(--color-ink-strong)]">
              Prompt akisini yonetin
            </h2>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              Siralayin, varyasyon cikarın ve ceviri akislarini tek yerden kontrol edin.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
              {project.screenshots.length} kare
            </div>
            <button
              type="button"
              onClick={addScreenshot}
              className="grid h-9 w-9 place-items-center rounded-full bg-black text-[var(--color-ink-inverse)] shadow-[0_10px_26px_rgba(0,0,0,0.16)] transition-transform hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Yeni ekran ekle"
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SidebarStat label="Aktif diller" value={String(project.activeLocales.length)} />
          <SidebarStat label="Son islem" value={transferTarget ? "Stil secimi" : "Hazir"} />
        </div>
      </div>
      {transferTarget && (
        <button
          type="button"
          onClick={() => {
            setTransferTarget(null);
            toast.info("Stil aktarimi iptal edildi");
          }}
          className="mx-3 mt-3 flex shrink-0 items-center justify-between gap-2 rounded-[20px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,243,176,0.8)_0%,rgba(255,255,255,0.88)_100%)] px-3 py-2 text-left text-[11px] leading-tight text-amber-950 shadow-[0_12px_28px_rgba(232,198,16,0.16)]"
        >
          <span className="min-w-0 flex-1">
            Hedef ekran secildi. Simdi gorunum stilini kopyalamak icin kaynak ekrana dokunun.
          </span>
          <span className="shrink-0 rounded-full bg-amber-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-50">
            Iptal
          </span>
        </button>
      )}
      <div className="flex-1 overflow-y-auto px-3 pb-3 pt-3">
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
    </motion.aside>
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
        "grid h-7 w-7 place-items-center rounded-full border border-black/6 bg-white/80 text-[var(--color-ink-muted)] shadow-[0_6px_14px_rgba(0,0,0,0.05)] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface-1)]",
        danger
          ? "hover:border-red-100 hover:bg-red-50 hover:text-red-500 focus-visible:ring-red-400"
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
        className="absolute left-2 top-2 z-10 grid h-7 w-7 cursor-grab place-items-center rounded-full border border-black/8 bg-white/90 text-[var(--color-ink-muted)] opacity-100 shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-opacity md:opacity-0 md:hover:bg-white md:focus:opacity-100 md:group-hover:opacity-100 md:group-focus-within:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] active:cursor-grabbing"
      >
        <GripVertical size={12} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onThumbnailClick}
        aria-label={`${screenshot.name} ekranını seç`}
        aria-pressed={active}
        className={cn(
          "block w-full overflow-hidden rounded-[22px] border-2 bg-white transition-all shadow-[0_16px_38px_rgba(0,0,0,0.08)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-1)]",
          active
            ? "border-[var(--color-brand-primary)] -translate-y-0.5"
            : "border-transparent hover:-translate-y-0.5 hover:border-black/10",
          isStyleRecipient && "ring-2 ring-amber-400 ring-offset-1",
        )}
      >
        <div className="pointer-events-none">
          <Canvas screenshot={screenshot} locale={locale} scale={thumbScale} selectedElementId={null} />
        </div>
      </button>
      <div className="mt-2 rounded-[20px] border border-black/6 bg-white/80 px-3 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Sahne {String(index + 1).padStart(2, "0")}
            </p>
            <span className="mt-1 block min-w-0 truncate text-xs font-semibold text-[var(--color-ink-body)]">
              {screenshot.name}
            </span>
          </div>
          {active && (
            <span className="rounded-full bg-[rgba(232,198,16,0.16)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-strong)]">
              Aktif
            </span>
          )}
        </div>
        <div className="mt-2 flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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

interface SidebarStatProps {
  label: string;
  value: string;
}

function SidebarStat({ label, value }: SidebarStatProps) {
  return (
    <div className="rounded-[18px] border border-black/6 bg-white/75 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[var(--color-ink-strong)]">
        {value}
      </div>
    </div>
  );
}
