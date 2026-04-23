"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-colors";

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
