import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CtaStrip } from "@/components/landing/CtaStrip";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface-0)]">
      <Nav />
      <Hero />
      <Features />
      <CtaStrip />
      <Footer />
    </main>
  );
}
