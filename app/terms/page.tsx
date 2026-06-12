import Link from "next/link";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { buildMetadata } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  path: "/terms",
  title: "Terms of Use — Frame Launch",
  description: "Terms of use for Frame Launch, a free screenshot generator for app marketing assets.",
  locale: "en",
});

export default function TermsPage() {
  return (
    <ContentLayout>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        Terms
      </p>
      <Prose>
        <h1>Use Frame Launch freely and responsibly.</h1>
        <p>
          These terms describe the basic rules for using the free web editor and the public content
          on this site.
        </p>
        <h2>Free browser tool</h2>
        <p>
          Frame Launch is provided as a free browser-based tool for creating app store, launch, and
          marketing screenshots. No account is required for the web editor.
        </p>
        <h2>Your content</h2>
        <p>
          You keep ownership of screenshots, text, logos, and other assets you upload or create. You
          are responsible for having the rights to use any content you import into the editor.
        </p>
        <h2>Acceptable use</h2>
        <p>
          Do not use Frame Launch to create illegal, deceptive, infringing, harmful, or abusive
          content. Do not attempt to disrupt the site, bypass security controls, or misuse any ad or
          analytics systems that may be added later.
        </p>
        <h2>No warranty</h2>
        <p>
          The site is provided as-is. App store requirements and advertising policies can change, so
          you should verify final assets against the latest requirements before submitting them.
        </p>
        <h2>Third-party services</h2>
        <p>
          Optional AI features, fonts, CDN libraries, and future ad services are provided by third
          parties. Their own terms and policies apply when your browser contacts those services.
        </p>
        <h2>Changes</h2>
        <p>
          These terms may be updated as Frame Launch moves through production launch, adds content
          pages, enables ads, or changes hosting infrastructure.
        </p>
        <p>
          See also our <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/contact">Contact page</Link>.
        </p>
      </Prose>
    </ContentLayout>
  );
}
