"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useProjectsStore } from "@/store/projectsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DuplicateUploadAction } from "@/store/editorStore";
import { getBlobUrl } from "@/lib/persistence/blobStore";

export function DuplicateUploadModal() {
  const d = useEditorStore((s) => s.duplicateUploadDialog);
  const resolvedRef = useRef(false);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const projects = useProjectsStore((s) => s.projects);

  const existingBlobId = useMemo(() => {
    if (!d?.open || !activeProjectId) return null;
    const p = projects.find((x) => x.id === activeProjectId);
    const shot = p?.screenshots.find((s) => s.id === d.matchedScreenshotId);
    return shot?.uploads?.[d.locale] ?? null;
  }, [d, activeProjectId, projects]);

  const [existingUrl, setExistingUrl] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (d?.open) resolvedRef.current = false;
  }, [d?.open, d?.matchedScreenshotId, d?.pendingFile?.name]);

  useEffect(() => {
    if (!d?.open || !d.pendingFile) {
      setNewUrl(null);
      setExistingUrl(null);
      return;
    }
    const nu = URL.createObjectURL(d.pendingFile);
    setNewUrl(nu);
    let cancelled = false;
    if (existingBlobId) {
      void getBlobUrl(existingBlobId).then((u) => {
        if (!cancelled) setExistingUrl(u ?? null);
      });
    } else {
      setExistingUrl(null);
    }
    return () => {
      cancelled = true;
      URL.revokeObjectURL(nu);
    };
  }, [d?.open, d?.pendingFile, existingBlobId]);

  if (!d?.open) return null;

  const finish = (action: DuplicateUploadAction) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    d.resolve(action);
  };

  return (
    <Dialog
      open={d.open}
      onClose={() => finish("ignore")}
      title="Aynı isimde görsel"
      maxWidth="520px"
    >
      <p className="text-sm text-[var(--color-ink-muted)]">
        Bu dosya, projede zaten yüklenmiş bir ekranın (
        <strong>{d.baseFilename}</strong>) <strong>{d.locale.toUpperCase()}</strong>{" "}
        sürümüyle çakışıyor.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-ink-muted)]">
            Mevcut
          </p>
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-surface-2)] bg-[var(--color-surface-1)]">
            {existingUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={existingUrl} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-[var(--color-ink-muted)]">Önizleme yok</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-ink-muted)]">Yeni</p>
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-surface-2)] bg-[var(--color-surface-1)]">
            {newUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={newUrl} alt="" className="max-h-full max-w-full object-contain" />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => finish("ignore")}>
          Yoksay
        </Button>
        <Button type="button" variant="outline" onClick={() => finish("create")}>
          Yeni ekran oluştur
        </Button>
        <Button type="button" onClick={() => finish("replace")}>
          Değiştir
        </Button>
      </div>
    </Dialog>
  );
}
