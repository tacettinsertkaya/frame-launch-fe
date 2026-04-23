import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

/** One mark + wordmark scale for app chrome (nav, top bar, footer). */
export const BRAND_LOCKUP_SIZE = 40;

function defaultWordmarkClass(size: number) {
  if (size <= 32) return "text-xs sm:text-sm";
  if (size < 45) return "text-base sm:text-lg";
  return "text-xl sm:text-2xl";
}

function defaultGapClass(size: number) {
  if (size <= 32) return "gap-1.5";
  if (size < 45) return "gap-2";
  return "gap-2.5";
}

type Variant = "on-dark" | "on-surface";

type Props = {
  /** Mark height in px; defaults to `BRAND_LOCKUP_SIZE` everywhere. */
  size?: number;
  /** `on-dark`: white “Frame”. `on-surface`: ink for light UI chrome. */
  variant: Variant;
  className?: string;
  imageClassName?: string;
  wordmarkClassName?: string;
  priority?: boolean;
};

/**
 * Mark + “Frame**Launch**” (Launch uses `--color-brand-primary`).
 */
export function BrandLockup({
  size = BRAND_LOCKUP_SIZE,
  variant,
  className,
  imageClassName,
  wordmarkClassName,
  priority,
}: Props) {
  const frameClass =
    variant === "on-dark" ? "text-white" : "text-[var(--color-ink-strong)]";
  const textClass = wordmarkClassName ?? defaultWordmarkClass(size);
  const gap = defaultGapClass(size);

  return (
    <span
      className={cn("flex min-w-0 items-center", gap, className)}
    >
      <BrandLogo
        size={size}
        className={imageClassName}
        alt=""
        priority={priority}
      />
      <span
        className={cn(
          "shrink-0 whitespace-nowrap font-bold leading-none tracking-tight",
          textClass,
        )}
      >
        <span className={frameClass}>Frame</span>
        <span className="text-[var(--color-brand-primary)]">Launch</span>
      </span>
    </span>
  );
}
