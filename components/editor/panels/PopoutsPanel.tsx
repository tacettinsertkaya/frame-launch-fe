"use client";

import { PanelSection } from "./PanelSection";

/** #12 — popout düzenleyici; şimdilik yer tutucu. */
export function PopoutsPanel() {
  return (
    <div className="h-full overflow-y-auto pb-4">
      <PanelSection title="Popout'lar" description="Yakında: ekran içi büyütülmüş alanlar ve kırpma.">
        <p className="text-[11px] text-[var(--color-ink-muted)]">
          Bu sürümde popout katmanı henüz düzenlenemiyor; veri modeli projede saklanıyor.
        </p>
      </PanelSection>
    </div>
  );
}
