import ComposerSpotlight from "@/components/home/composer-spotlight";
import CrossPlatform from "@/components/home/cross-platform";
import CTA from "@/components/home/cta-section";
import FeatureGrid from "@/components/home/focus-feature-grid";
import Hero from "@/components/home/hero";
import KeyboardShortcuts from "@/components/home/keyboard-shortcuts";
// import Hero2 from "@/components/home/hero2";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      {/* <Hero2 /> */}
      <FeatureGrid />
      <ComposerSpotlight />
      <KeyboardShortcuts />
      <CrossPlatform />
      <CTA />
    </main>
  );
}
