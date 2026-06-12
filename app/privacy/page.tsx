import Link from "next/link";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { buildMetadata } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  path: "/privacy",
  title: "Privacy Policy — Frame Launch",
  description:
    "Privacy policy for Frame Launch, a free browser-based screenshot generator for App Store and Google Play marketing images.",
  locale: "en",
});

export default function PrivacyPage() {
  return (
    <ContentLayout>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        Privacy
      </p>
      <Prose>
        <h1>Your screenshots stay in your browser.</h1>
        <p>
          Frame Launch is designed as a client-side editor. This policy explains what the site stores
          locally, what third-party services may be contacted, and how ads will work after
          monetization is enabled.
        </p>
        <h2>What Frame Launch collects</h2>
        <p>
          Frame Launch does not require an account, does not ask for payment details, and does not
          upload your project files to a Frame Launch server. The editor runs in your browser using
          HTML Canvas, IndexedDB, localStorage, and local file APIs.
        </p>
        <h2>Local browser storage</h2>
        <p>
          The app saves projects, screenshots, text, design settings, language selections, theme
          choices, and API keys you choose to enter in your own browser storage. This includes
          IndexedDB for larger project data and localStorage for small preferences. Removing site
          data in your browser will remove these saved projects and settings.
        </p>
        <h2>Uploaded screenshots and generated exports</h2>
        <p>
          Images you upload are processed locally in your browser. Exports are generated locally and
          downloaded by your browser. Frame Launch does not receive, inspect, sell, or train on your
          uploaded screenshots.
        </p>
        <h2>AI translation and title generation</h2>
        <p>
          If you use AI features, you may enter your own API key for a supported provider such as
          Claude, OpenAI, or Google. Those keys are stored locally in your browser. When you trigger
          an AI feature, the relevant text and your key are sent directly from your browser to the
          selected provider. Their terms and privacy policies apply to those requests.
        </p>
        <h2>Fonts, models, and CDN dependencies</h2>
        <p>
          The editor may request Google Fonts metadata or font files when you use the font picker. It
          also loads JavaScript libraries for ZIP export and 3D rendering from public CDNs. The 3D
          device model files are served from this site. These third parties may receive standard web
          request data such as IP address, browser information, and referrer data.
        </p>
        <h2>Ads and monetization</h2>
        <p>
          Frame Launch is free and plans to fund the site with advertising. Ads are disabled by
          default in the code until real publisher and slot IDs are configured. When Google ads are
          enabled, Google and its partners may use cookies, local storage, web beacons, IP addresses,
          and other identifiers to deliver, measure, and personalize ads where permitted. For
          visitors in the European Economic Area, the United Kingdom, and Switzerland, Frame Launch
          will use an ad consent flow before personalized ads are shown.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions, use the options on the <Link href="/contact">contact page</Link>.
          This policy may be updated as the site launches, adds ad partners, or changes hosting
          providers.
        </p>
      </Prose>
    </ContentLayout>
  );
}
