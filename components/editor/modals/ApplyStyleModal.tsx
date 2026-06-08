"use client";

import { toast } from "sonner";
import type { Project } from "@/lib/types/project";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { copyScreenshotStyleFromTo } from "@/lib/editor/styleTransfer";

interface Props {
  project: Project;
}

export function ApplyStyleModal({ project }: Props) {
  const open = useEditorStore((s) => s.applyStyleModalOpen);
  const sourceId = useEditorStore((s) => s.applyStyleSourceScreenshotId);
  const close = useEditorStore((s) => s.closeApplyStyleModal);
  const updateScreenshot = useProjectsStore((s) => s.updateScreenshot);
  const updateProject = useProjectsStore((s) => s.updateProject);

  const source = sourceId
    ? project.screenshots.find((s) => s.id === sourceId)
    : undefined;

  const onConfirm = () => {
    if (!sourceId || !source) {
      close();
      return;
    }
    for (const t of project.screenshots) {
      if (t.id === sourceId) continue;
      updateScreenshot(project.id, t.id, (draft) => {
        copyScreenshotStyleFromTo(source, draft);
      });
    }
    updateProject(project.id, (p) => {
      p.lastStyleSource = sourceId;
    });
    toast.success("Stil diğer ekranlara uygulandı");
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Tümüne stil uygula?"
      description="Bu ekranın stilini diğer tüm ekranlara uygular."
      maxWidth="440px"
    >
      <div className="rounded-[22px] border border-[rgba(232,198,16,0.22)] bg-[linear-gradient(135deg,rgba(255,247,207,0.88)_0%,rgba(255,255,255,0.82)_100%)] p-4 shadow-[0_14px_36px_rgba(232,198,16,0.16)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          Style Broadcast
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-body)]">
          Bu işlem, bu ekranın <strong>arka plan</strong>, <strong>cihaz</strong> ve{" "}
          <strong>metin stili</strong> ayarlarını diğer tüm ekranlara kopyalar. Her ekranın
          yazı <em>içeriği</em> aynı kalır. Geri alınamaz.
        </p>
      </div>
      <div className="mt-6 flex flex-col-reverse justify-end gap-2 border-t border-black/6 pt-4 sm:flex-row">
        <Button type="button" variant="outline" onClick={close}>
          Vazgeç
        </Button>
        <Button type="button" onClick={onConfirm}>
          Tümüne uygula
        </Button>
      </div>
    </Dialog>
  );
}
