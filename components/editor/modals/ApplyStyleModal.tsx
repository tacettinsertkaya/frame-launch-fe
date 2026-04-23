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
      maxWidth="440px"
    >
      <p className="text-sm text-[var(--color-ink-muted)]">
        Bu işlem, bu ekranın <strong>arka plan</strong>, <strong>cihaz</strong> ve{" "}
        <strong>metin stili</strong> ayarlarını diğer tüm ekranlara kopyalar. Her ekranın
        yazı <em>içeriği</em> (diller) aynı kalır. Geri alınamaz.
      </p>
      <div className="mt-6 flex justify-end gap-2">
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
