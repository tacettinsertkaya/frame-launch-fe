"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional accessible description; rendered visually-hidden if omitted to silence Radix warning. */
  description?: string;
  children: ReactNode;
  maxWidth?: string;
  /** When true, body skips default padding so the modal can lay out its own sections (e.g. tab bars). */
  bodyPadding?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "640px",
  bodyPadding = true,
}: DialogProps) {
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
            "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-0)] shadow-[var(--shadow-xl)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "focus:outline-none",
          )}
          style={{ maxWidth }}
        >
          {title ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-surface-2)] px-5 py-4">
              <DialogPrimitive.Title className="min-w-0 truncate text-base font-semibold text-[var(--color-ink-strong)]">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-1)] hover:text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                  aria-label="Kapat"
                >
                  <X size={16} aria-hidden />
                </button>
              </DialogPrimitive.Close>
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
          )}
          {description ? (
            <DialogPrimitive.Description className="sr-only">
              {description}
            </DialogPrimitive.Description>
          ) : (
            // Always render a Description to satisfy Radix a11y expectations.
            <DialogPrimitive.Description className="sr-only">
              {title ?? "Modal pencere"}
            </DialogPrimitive.Description>
          )}
          {bodyPadding ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
