"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Dialog({ open, onClose, title, children, maxWidth = "640px" }: DialogProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-0)] shadow-[var(--shadow-xl)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "focus:outline-none",
          )}
          style={{ maxWidth }}
        >
          {title ? (
            <div className="flex items-center justify-between border-b border-[var(--color-surface-2)] px-5 py-4">
              <DialogPrimitive.Title className="text-base font-semibold text-[var(--color-ink-strong)]">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button
                  className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)]"
                  aria-label="Kapat"
                >
                  <X size={16} />
                </button>
              </DialogPrimitive.Close>
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
          )}
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
