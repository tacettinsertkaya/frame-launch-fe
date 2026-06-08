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
        <div className="rounded-[22px] border border-red-100 bg-[linear-gradient(180deg,rgba(255,245,245,0.94)_0%,rgba(255,255,255,0.82)_100%)] p-4 shadow-[0_14px_36px_rgba(239,68,68,0.08)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">
            Destructive Action
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-body)]">
            <strong className="text-[var(--color-ink-strong)]">&quot;{projectName}&quot;</strong>{" "}
            silinecek. Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-black/6 pt-4 sm:flex-row sm:items-center sm:justify-end">
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
