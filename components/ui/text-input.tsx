"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-colors disabled:cursor-not-allowed disabled:bg-[var(--color-surface-1)] disabled:opacity-60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500";

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
