

import CTA from "@/components/home/cta-section";
import FeatureGrid from "@/components/home/focus-feature-grid";
import Hero from "@/components/home/hero";

// import Hero2 from "@/components/home/hero2";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      {/* <Hero2 /> */}
      <FeatureGrid />
      <CTA />
    </main>
  );
}
