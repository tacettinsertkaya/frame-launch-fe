import Link from "next/link";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { buildMetadata } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  path: "/alternatives",
  title: "App Screenshot Tool Alternatives — Frame Launch",
  description:
    "Compare Frame Launch with common app screenshot tools, design templates, and hosted screenshot generators.",
  locale: "en",
});

const comparisons = [
  {
    kind: "Alternative",
    title: "AppLaunchpad alternative",
    body: "For teams that want a local browser workflow.",
  },
  {
    kind: "Alternative",
    title: "AppScreens alternative",
    body: "Compare no-watermark export and privacy-first editing.",
  },
  {
    kind: "Alternative",
    title: "Appure alternative",
    body: "Use Frame Launch when speed and no signup matter most.",
  },
  {
    kind: "Alternative",
    title: "Storeshots alternative",
    body: "Prepare store screenshots without hosted project friction.",
  },
  {
    kind: "Comparison",
    title: "Canva vs Frame Launch",
    body: "General design tool or dedicated app screenshot editor?",
  },
  {
    kind: "Comparison",
    title: "Figma templates vs Frame Launch",
    body: "Choose templates or a purpose-built export workflow.",
  },
];

export default function AlternativesPage() {
  return (
    <ContentLayout>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        Alternatives
      </p>
      <Prose>
        <h1>Compare screenshot tools before you build launch assets.</h1>
        <p>
          Frame Launch is best when you need a fast, free, browser-only workflow with no account, no
          upload, and no watermark. The comparisons below outline where it fits against common
          hosted generators and general design tools.
        </p>
      </Prose>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {comparisons.map((c) => (
          <div key={c.title} className="rounded-xl border border-[var(--color-surface-2)] p-5">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
              {c.kind}
            </span>
            <h2 className="mt-1 text-lg font-semibold text-[var(--color-ink-strong)]">{c.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{c.body}</p>
          </div>
        ))}
      </div>

      <Prose>
        <p className="mt-8">
          Ready to try it yourself? <Link href="/editor">Open the free editor</Link> and export a
          store-ready screenshot in your browser.
        </p>
      </Prose>
    </ContentLayout>
  );
}
