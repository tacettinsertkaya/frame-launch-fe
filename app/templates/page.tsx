import Link from "next/link";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { buildMetadata } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  path: "/templates",
  title: "Free App Screenshot Template Gallery — Frame Launch",
  description:
    "Free app screenshot template ideas for SaaS, AI, fitness, finance, utilities, and launch pages.",
  locale: "en",
});

const templates = [
  {
    title: "SaaS dashboard",
    body: 'Lead with a crisp dashboard screenshot, a one-line outcome, and two small proof badges such as "Realtime reports" and "Export-ready."',
  },
  {
    title: "AI assistant",
    body: "Use a chat or result screen, then frame the value as speed, clarity, or automation. Keep prompt text short enough to read on mobile.",
  },
  {
    title: "Fitness tracker",
    body: "Show progress, streak, or workout detail screens. Use energetic color, but keep the data legible and the caption focused on habit formation.",
  },
  {
    title: "Finance utility",
    body: "Use restrained backgrounds, clear numbers, and a privacy-forward caption. Avoid visual clutter around balances, charts, or exchange rates.",
  },
  {
    title: "Creator tool",
    body: "Show the before and after state. Put the output, not the settings panel, at the center of the screenshot.",
  },
  {
    title: "Local service app",
    body: "Use map, booking, or schedule screens with a caption that explains the practical result: find, book, save, share, or arrive.",
  },
];

export default function TemplatesPage() {
  return (
    <ContentLayout>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        Templates
      </p>
      <Prose>
        <h1>Free screenshot layout ideas for app launches.</h1>
        <p>
          Use these patterns as starting points inside <Link href="/editor">Frame Launch</Link>. Pick
          the message structure first, then adjust color, device frame, background, and text for your
          product. These templates are intentionally described as workflows rather than locked files,
          which keeps them flexible for App Store, Google Play, social cards, and launch-page hero
          images.
        </p>
      </Prose>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <div
            key={t.title}
            className="rounded-xl border border-[var(--color-surface-2)] p-5"
          >
            <h2 className="text-lg font-semibold text-[var(--color-ink-strong)]">{t.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{t.body}</p>
          </div>
        ))}
      </div>

      <Prose>
        <h2>How to use a template in Frame Launch</h2>
        <ol>
          <li>Open the editor and upload screenshots in story order.</li>
          <li>Choose the output size for the store or marketing channel.</li>
          <li>Write the headline before styling the background.</li>
          <li>Transfer the first screenshot style to the rest of the set.</li>
          <li>Export one proof PNG, then export the full ZIP.</li>
        </ol>
        <h2>Related guides</h2>
        <p>
          <Link href="/guides/app-store-screenshot-sizes">App Store sizes</Link>,{" "}
          <Link href="/guides/google-play-graphics">Google Play graphics</Link>,{" "}
          <Link href="/guides/marketing-screenshot-design">design examples</Link>, and the{" "}
          <Link href="/guides/frame-launch-workflow">workflow tutorial</Link>.
        </p>
      </Prose>
    </ContentLayout>
  );
}
