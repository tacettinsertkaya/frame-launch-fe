import Image from "next/image";

/** Intrinsic pixels of `public/logo.png` (portrait plate, lockup centered). */
export const BRAND_LOGO_WIDTH = 768;
export const BRAND_LOGO_HEIGHT = 1024;

type Props = {
  /** CSS height in px; width follows the image aspect ratio. */
  size: number;
  className?: string;
  /** Use `""` when the wordmark is visible next to the mark to avoid duplicate announcements. */
  alt?: string;
  priority?: boolean;
};

/** Mark asset from `/public/logo.png` (portrait). Pair with `BrandLockup` for the full name. */
export function BrandLogo({ size, className, alt = "FrameLaunch", priority }: Props) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={BRAND_LOGO_WIDTH}
      height={BRAND_LOGO_HEIGHT}
      sizes={`${Math.round(size * (BRAND_LOGO_WIDTH / BRAND_LOGO_HEIGHT))}px`}
      style={{ height: size, width: "auto" }}
      className={["shrink-0 object-contain object-center", className].filter(Boolean).join(" ")}
      priority={priority}
    />
  );
}
