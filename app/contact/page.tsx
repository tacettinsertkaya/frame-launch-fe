import Link from "next/link";
import type { Metadata } from "next";
import { ContentLayout, Prose } from "@/components/content/ContentLayout";
import { buildMetadata } from "@/lib/i18n";

export const metadata: Metadata = buildMetadata({
  path: "/contact",
  title: "Contact — Frame Launch",
  description: "Contact Frame Launch for product, privacy, and launch questions.",
  locale: "en",
});

export default function ContactPage() {
  return (
    <ContentLayout>
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
        Contact
      </p>
      <Prose>
        <h1>Questions, bugs, privacy requests, and partnerships.</h1>
        <p>
          Use the channels below for production launch issues, product feedback, privacy questions,
          or future sponsorship discussions.
        </p>
        <h2>Product and support</h2>
        <p>
          For product feedback, bug reports, feature requests, launch questions, or support, email{" "}
          <a href="mailto:tacettinsertkaya@outlook.com">tacettinsertkaya@outlook.com</a> or open an
          issue in the GitHub repository.
        </p>
        <h2>Privacy and legal</h2>
        <p>
          For privacy questions about local browser storage, AI provider keys, advertising, or
          content on this site, include the page URL and a short description of the request.
        </p>
        <h2>Advertising and partnerships</h2>
        <p>
          Frame Launch will start with conservative ad placements on public content pages. Direct
          sponsorships, template partnerships, and relevant developer-tool placements can be
          considered after the first production launch data is available.
        </p>
        <h2>Useful links</h2>
        <ul>
          <li>
            <a href="https://github.com/YUZU-Hub/appscreen">GitHub repository</a>
          </li>
          <li>
            <Link href="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms">Terms of Use</Link>
          </li>
          <li>
            <Link href="/editor">Open the editor</Link>
          </li>
        </ul>
      </Prose>
    </ContentLayout>
  );
}
