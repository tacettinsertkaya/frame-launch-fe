"use client";

import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PanelSection({ title, description, children }: Props) {
  return (
    <section className="border-b border-[var(--color-surface-2)] px-4 py-4 last:border-b-0">
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-strong)]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-[11px] leading-snug text-[var(--color-ink-muted)]">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
