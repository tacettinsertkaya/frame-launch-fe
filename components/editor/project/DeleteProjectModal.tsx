"use client";

import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectsStore } from "@/store/projectsStore";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  projectName: string;
}

export function DeleteProjectModal({
  open,
  onOpenChange,
  projectId,
  projectName,
}: Props) {
  const deleteProject = useProjectsStore((s) => s.deleteProject);

  const confirm = () => {
    deleteProject(projectId);
    toast.success(`"${projectName}" silindi`);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title="Projeyi sil"
      maxWidth="440px"
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-ink-body)]">
          <strong className="text-[var(--color-ink-strong)]">&quot;{projectName}&quot;</strong>{" "}
          silinecek. Bu işlem geri alınamaz.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button variant="destructive" size="sm" onClick={confirm}>
            Sil
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
