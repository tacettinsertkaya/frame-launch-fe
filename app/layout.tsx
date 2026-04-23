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
        url: "/logo.png",
        width: 768,
        height: 1024,
        alt: "Framelaunch",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Framelaunch — App Store ekran görüntüleri",
    description:
      "Tarayıcıda saniyeler içinde App Store / Play Store görselleri. %100 ücretsiz, hesap yok, watermark yok.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0c29",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeSync />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
