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
      description={`"${projectName}" projesi kalıcı olarak silinecek.`}
      maxWidth="440px"
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-ink-body)]">
          <strong className="text-[var(--color-ink-strong)]">&quot;{projectName}&quot;</strong>{" "}
          silinecek. Bu işlem geri alınamaz.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            onClick={confirm}
          >
            Sil
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
