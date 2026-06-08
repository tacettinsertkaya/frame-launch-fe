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
      description="Yüklenen dosya mevcut bir ekranla çakışıyor."
      maxWidth="520px"
    >
      <div className="rounded-[22px] border border-[rgba(232,198,16,0.22)] bg-[linear-gradient(135deg,rgba(255,247,207,0.88)_0%,rgba(255,255,255,0.82)_100%)] p-4 shadow-[0_14px_36px_rgba(232,198,16,0.16)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          Duplicate Check
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-body)]">
          Bu dosya, projede zaten yüklenmiş bir ekranın (
          <strong className="break-words">{d.baseFilename}</strong>){" "}
          <strong>{d.locale.toUpperCase()}</strong> sürümüyle çakışıyor.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-ink-muted)]">
            Mevcut
          </p>
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-[22px] border border-black/6 bg-white/75 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
            {existingUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={existingUrl}
                alt="Mevcut ekran önizlemesi"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-[var(--color-ink-muted)]">Önizleme yok</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-ink-muted)]">Yeni</p>
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-[22px] border border-black/6 bg-white/75 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
            {newUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={newUrl}
                alt="Yeni ekran önizlemesi"
                className="max-h-full max-w-full object-contain"
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse flex-wrap justify-end gap-2 border-t border-black/6 pt-4 sm:flex-row">
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
