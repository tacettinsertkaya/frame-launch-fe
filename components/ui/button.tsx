"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand-primary)] text-black hover:bg-[var(--color-brand-primary-hover)] shadow-[var(--shadow-md)]",
  secondary:
    "bg-black text-white hover:bg-[var(--color-dark-surface-2)]",
  ghost: "bg-transparent text-[var(--color-ink-strong)] hover:bg-[var(--color-surface-2)]",
  outline:
    "bg-transparent text-[var(--color-ink-strong)] border border-[var(--color-surface-3)] hover:border-black hover:bg-[var(--color-surface-1)]",
  destructive: "bg-red-500 text-white hover:bg-red-600",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-md)]",
  md: "h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-base gap-2 rounded-[var(--radius-lg)]",
  icon: "h-9 w-9 p-0 rounded-[var(--radius-md)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          VARIANT[variant],
          SIZE[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
