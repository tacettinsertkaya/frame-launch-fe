const loaded = new Set<string>();
const loading = new Map<string, Promise<void>>();

function googleFontStylesheetHref(family: string): string {
  const q = encodeURIComponent(family);
  return `https://fonts.googleapis.com/css2?family=${q}:wght@300;400;500;600;700;800;900&display=swap`;
}

/**
 * Injects Google Fonts stylesheet and waits for `document.fonts` (best effort).
 * No-op on server. Safe to call repeatedly for the same family.
 */
export function ensureGoogleFontLoaded(
  family: string,
  weights: number[] = [400, 600],
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve();
  }

  const existing = loading.get(family);
  if (existing) return existing;
  if (loaded.has(family)) {
    return touchWeights(family, weights);
  }

  const p = (async () => {
    const href = googleFontStylesheetHref(family);
    const id = `framelaunch-font-${family.replace(/\s+/g, "-").slice(0, 80)}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      await new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load font stylesheet: ${family}`));
        document.head.appendChild(link);
      });
    }

    if (document.fonts?.load) {
      try {
        await Promise.all(
          weights.map((w) => document.fonts.load(`${w} 16px "${family}"`)),
        );
      } catch {
        /* ignore — font may still paint */
      }
    }
    loaded.add(family);
  })().finally(() => {
    loading.delete(family);
  });

  loading.set(family, p);
  return p;
}

function touchWeights(family: string, weights: number[]): Promise<void> {
  if (!document.fonts?.load) return Promise.resolve();
  return Promise.all(weights.map((w) => document.fonts!.load(`${w} 16px "${family}"`))).then(
    () => undefined,
  );
}

/** Test helper */
export function __resetGoogleFontCacheForTests(): void {
  loaded.clear();
  loading.clear();
}
