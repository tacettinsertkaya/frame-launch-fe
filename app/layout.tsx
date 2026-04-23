import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeSync } from "@/components/ThemeSync";
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
  },
  icons: { icon: "/favicon.ico" },
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
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
