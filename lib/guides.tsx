import Link from "next/link";
import type { ReactNode } from "react";

export type Guide = {
  slug: string;
  eyebrow: string;
  title: string;
  /** H1 shown on the page (sentence form). */
  heading: string;
  description: string;
  body: ReactNode;
};

const Editor = () => <Link href="/editor">Frame Launch</Link>;

export const guides: Guide[] = [
  {
    slug: "app-store-screenshot-sizes",
    eyebrow: "App Store guide",
    title: "App Store Screenshot Sizes and Export Planning",
    heading: "App Store screenshot sizes and export planning",
    description:
      "Plan App Store screenshot sizes, device families, captions, and export order with Frame Launch.",
    body: (
      <>
        <p>
          A screenshot set is not only a design task. It is a store listing plan, a message
          hierarchy, and an export checklist that should be finished before release day.
        </p>
        <h2>Start with the device families you actually need</h2>
        <p>
          Apple accepts screenshots for different iPhone and iPad display families. Most teams should
          begin with the largest current iPhone size they support, then prepare smaller iPhone and
          iPad variants only when the app experience genuinely benefits from separate framing. A
          smaller checklist beats a perfect-looking set that never ships.
        </p>
        <h2>Plan the first three screenshots as a sequence</h2>
        <p>
          The first screenshot should state the core promise. The second should prove the main
          workflow. The third should answer a practical question: speed, privacy, compatibility,
          reporting, sharing, or another reason a visitor would hesitate. Later screenshots can cover
          secondary features.
        </p>
        <h2>Use captions that survive cropping</h2>
        <p>
          Keep the main caption short enough to read at thumbnail size. Put the important noun early:
          &ldquo;Track every workout&rdquo; reads faster than &ldquo;The easiest way to track every
          workout.&rdquo; In <Editor />, test captions with the side previews and export a small
          draft before committing to the whole set.
        </p>
        <h2>Export order checklist</h2>
        <ul>
          <li>Choose the output device size before detailed text tuning.</li>
          <li>Create the first screenshot style, then transfer style to the rest of the set.</li>
          <li>Review line breaks in every language you plan to publish.</li>
          <li>Export one PNG first, inspect it, then export the full ZIP.</li>
        </ul>
        <blockquote>
          Good screenshots do not show every feature. They make the next tap feel obvious.
        </blockquote>
        <h2>Next step</h2>
        <p>
          Open <Editor />, choose an App Store output size, and create a rough five-screen sequence
          before polishing colors or 3D device angles.
        </p>
      </>
    ),
  },
  {
    slug: "google-play-graphics",
    eyebrow: "Google Play guide",
    title: "Google Play Screenshots and Feature Graphics",
    heading: "Build Play Store graphics that explain the app quickly",
    description:
      "Plan Google Play screenshots and feature graphics with clear messages, safe framing, and export checks.",
    body: (
      <>
        <p>
          Google Play visitors scan fast. Your screenshot set should make the category, main benefit,
          and user workflow clear before the user reads the long description.
        </p>
        <h2>Separate screenshots from feature graphics</h2>
        <p>
          Screenshots should show real product states. Feature graphics can be more editorial, but
          they still need to describe the product honestly. Use <Editor /> for screenshots first,
          then adapt the strongest message into a wider marketing size if you need a feature graphic
          or launch image.
        </p>
        <h2>Design for small previews</h2>
        <p>
          Many Play Store impressions happen on mobile. Use larger type, fewer words, and strong
          contrast. Avoid placing important text near the edges. If a caption needs two lines, make
          the first line meaningful by itself.
        </p>
        <h2>Keep Android screenshots realistic</h2>
        <p>
          Use Android device framing when Android UI details matter. If your app is cross-platform
          and the UI is identical, a simple 2D frame with clear captions can be stronger than a
          complex mockup.
        </p>
        <h2>Suggested screenshot sequence</h2>
        <ol>
          <li>Core value: the job the app does.</li>
          <li>Main workflow: the screen a user will touch most.</li>
          <li>Proof point: speed, privacy, integrations, or result quality.</li>
          <li>Personalization or settings: show that the app adapts.</li>
          <li>Outcome: the final report, saved item, plan, or share result.</li>
        </ol>
        <h2>Next step</h2>
        <p>
          Try the <Link href="/templates">template gallery</Link> to pick a layout pattern before
          exporting your Google Play screenshot set.
        </p>
      </>
    ),
  },
  {
    slug: "screenshot-localization",
    eyebrow: "Localization guide",
    title: "Screenshot Localization Guide",
    heading: "Translate screenshots without losing clarity",
    description:
      "Localize app screenshots with language-specific captions, filenames, and review workflows.",
    body: (
      <>
        <p>
          Localized screenshots usually fail because the design assumes English text length. Plan for
          longer words, different proof points, and reviewer feedback before export day.
        </p>
        <h2>Localize the promise, not only the words</h2>
        <p>
          A literal translation can be technically correct and still weak. Rewrite the caption so the
          local user understands the benefit instantly. For example, a productivity app might
          emphasize time saved in one market and team coordination in another.
        </p>
        <h2>Use filename language hints</h2>
        <p>
          Frame Launch can detect language codes in filenames such as <code>screen-01_de.png</code>{" "}
          or <code>onboarding_pt-br.png</code>. This makes it easier to upload language-specific
          screenshots and keep them attached to the same project screen instead of creating a messy
          duplicate list.
        </p>
        <h2>Design for expansion</h2>
        <p>
          German, French, Spanish, and Turkish captions often need more room than English. Leave
          extra width, avoid tiny badge text, and test line breaks in every target language. When a
          caption gets too long, cut the idea instead of shrinking the type until it becomes
          unreadable.
        </p>
        <h2>Review workflow</h2>
        <ul>
          <li>Export a draft ZIP for each language.</li>
          <li>Ask a native speaker to check store context, not only grammar.</li>
          <li>Review screenshots on a phone-sized display.</li>
          <li>Keep a changelog of which captions changed after review.</li>
        </ul>
        <h2>Next step</h2>
        <p>
          Open <Editor />, add your target languages, and test the longest caption first. The longest
          language usually reveals the layout problem fastest.
        </p>
      </>
    ),
  },
  {
    slug: "marketing-screenshot-design",
    eyebrow: "Design guide",
    title: "Marketing Screenshot Design Examples",
    heading: "Choose a screenshot layout that matches the job",
    description:
      "Marketing screenshot layout patterns for app store pages, launch pages, social posts, and campaigns.",
    body: (
      <>
        <p>
          The best marketing screenshot layout depends on what the user needs to believe: that the
          app is useful, easy, trustworthy, beautiful, or different.
        </p>
        <h2>Feature-first layout</h2>
        <p>
          Use one large device frame and one direct headline. This layout works for simple utilities,
          calculators, trackers, and apps where the screen itself explains most of the value.
        </p>
        <h2>Outcome-first layout</h2>
        <p>
          Lead with the final result: a saved plan, a report, a generated image, a cleaner inbox, or
          a completed habit. This is useful when the workflow is less interesting than the result.
        </p>
        <h2>Comparison layout</h2>
        <p>
          Show before and after states when the product improves something visible. Keep the
          comparison honest and readable. Do not bury the improvement inside small UI details.
        </p>
        <h2>Proof layout</h2>
        <p>
          Use badges, short metrics, or concise labels to show credibility. Avoid fake social proof.
          A strong proof screenshot can show local processing, export quality, time saved, or
          supported device sizes.
        </p>
        <h2>Design rules that travel well</h2>
        <ul>
          <li>One main idea per screenshot.</li>
          <li>Enough contrast for thumbnail scanning.</li>
          <li>Captions short enough to localize.</li>
          <li>Consistent background rhythm across the full set.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "frame-launch-workflow",
    eyebrow: "Workflow tutorial",
    title: "Frame Launch Workflow Tutorial",
    heading: "From raw screenshots to launch-ready exports",
    description:
      "A step-by-step Frame Launch workflow for turning raw screenshots into exported PNG and ZIP assets.",
    body: (
      <>
        <p>
          This workflow keeps the design process calm: create the message sequence first, then style,
          localize, review, and export.
        </p>
        <h2>1. Create a project per app listing</h2>
        <p>
          Use a separate project for each app or major campaign. That keeps App Store, Google Play,
          and social screenshots from sharing accidental settings.
        </p>
        <h2>2. Upload screenshots in final order</h2>
        <p>
          Start with the order you want users to see. It is easier to write a coherent story when the
          screenshots already move from promise to proof to outcome.
        </p>
        <h2>3. Style one screen, then transfer style</h2>
        <p>
          Pick the background, frame, shadow, and typography on the first screenshot. Then transfer
          the style to the rest of the set and make only the adjustments each screen needs.
        </p>
        <h2>4. Add localization last</h2>
        <p>
          Once the English set is stable, add translated text and localized screenshot files. Use
          language suffixes in filenames so Frame Launch can match uploads to the correct screen.
        </p>
        <h2>5. Export drafts before final PNGs</h2>
        <p>
          Export one PNG and inspect it at actual size. Then export all screenshots as a ZIP. For
          multi-language launches, export each language and verify the folder names before handing
          assets to the release owner.
        </p>
      </>
    ),
  },
];

export const guideMap = new Map(guides.map((g) => [g.slug, g]));
