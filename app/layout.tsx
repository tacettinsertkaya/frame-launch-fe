import type { Metadata, Viewport } from "next";
import { ThemeSync } from "@/components/ThemeSync";
import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Framelaunch — App Store ekran görüntüleri saniyeler içinde",
  description:
    "Framelaunch ile tarayıcıda %100 ücretsiz, kayıt olmadan App Store ve Play Store görselleri oluşturun. Cihaz çerçeveleri, gradient arka planlar, çok dilli metinler ve şablonlar.",
  keywords: [
    "app store ekran görüntüsü oluşturucu",
    "screenshot generator",
    "framelaunch",
    "play store mockup",
  ],
  metadataBase: new URL("https://framelaunch.store"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Framelaunch — App Store ekran görüntüleri",
    description:
      "Tarayıcıda saniyeler içinde App Store / Play Store görselleri. %100 ücretsiz, hesap yok, watermark yok.",
    url: "https://framelaunch.store",
    siteName: "Framelaunch",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Framelaunch — App Store ekran görüntüleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Framelaunch — App Store ekran görüntüleri",
    description:
      "Tarayıcıda saniyeler içinde App Store / Play Store görselleri. %100 ücretsiz, hesap yok, watermark yok.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0c29",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Framelaunch",
  url: "https://framelaunch.store",
  description:
    "Tarayıcıda %100 ücretsiz, kayıt olmadan App Store ve Play Store görselleri oluşturun.",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeSync />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
