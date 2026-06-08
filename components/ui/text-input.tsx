"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-[18px] border border-black/6 bg-[rgba(255,255,255,0.8)] px-3 py-2.5 text-sm text-[var(--color-ink-strong)] shadow-[0_8px_20px_rgba(0,0,0,0.03)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(232,198,16,0.22)] transition-colors disabled:cursor-not-allowed disabled:bg-[var(--color-surface-1)] disabled:opacity-60 aria-[invalid=true]:border-[var(--color-danger)] aria-[invalid=true]:focus:ring-[var(--color-danger)]";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(inputBase, className)} {...props} />;
  },
);
TextInput.displayName = "TextInput";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(inputBase, "min-h-[72px] resize-y", className)}
      {...props}
    />
  );
});
TextArea.displayName = "TextArea";
