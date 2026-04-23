"use client";

import { useEditorStore } from "@/store/editorStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VERSION = "0.1.0";

export function AboutModal() {
  const open = useEditorStore((s) => s.aboutModalOpen);
  const close = useEditorStore((s) => s.closeAboutModal);

  return (
    <Dialog open={open} onClose={close} title="Hakkında" maxWidth="480px">
      <div className="space-y-4 text-sm text-[var(--color-ink-body)]">
        <p>
          <strong className="text-[var(--color-ink-strong)]">Framelaunch</strong> — App Store ve
          Play Store pazarlama görsellerini tarayıcıda, hesap veya watermark olmadan üretmeniz
          için tasarlandı. Tüm proje verileri cihazınızda kalır.
        </p>
        <p className="text-xs text-[var(--color-ink-muted)]">Sürüm {VERSION}</p>
        <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
          Bu ürün,{" "}
          <a
            href="https://github.com/yuzu-hub/appscreen"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-ink-strong)] underline decoration-[var(--color-surface-3)] underline-offset-2 hover:decoration-[var(--color-brand-primary)]"
          >
            yuzu-hub/appscreen
          </a>{" "}
          (MIT) projesinden ilham alır; Stefan / yuzuhub.com&apos;a teşekkürler.
        </p>
        <div className="flex justify-end border-t border-[var(--color-surface-2)] pt-4">
          <Button size="sm" onClick={close}>
            Tamam
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
