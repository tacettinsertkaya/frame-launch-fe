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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[8px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[30px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(252,250,242,0.94)_100%)] shadow-[0_36px_100px_rgba(0,0,0,0.22)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "focus:outline-none",
          )}
          style={{ maxWidth }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,198,16,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_26%)]" />
          </div>
          {title ? (
            <div className="relative shrink-0 border-b border-black/6 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <DialogPrimitive.Title className="min-w-0 truncate text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink-strong)]">
                    {title}
                  </DialogPrimitive.Title>
                  {description ? (
                    <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--color-ink-muted)]">
                      {description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] sm:inline-flex">
                    Editor Flow
                  </span>
                  <DialogPrimitive.Close asChild>
                    <button
                      type="button"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/6 bg-white/80 text-[var(--color-ink-muted)] shadow-[0_8px_18px_rgba(0,0,0,0.05)] transition-colors hover:bg-white hover:text-[var(--color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                      aria-label="Kapat"
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </DialogPrimitive.Close>
                </div>
              </div>
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
            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
