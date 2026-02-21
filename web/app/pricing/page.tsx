import FeatureComparison from "@/components/pricing/feature-comparison";
import PrcingFAQ from "@/components/pricing/pricing-faq";
import PricingHero from "@/components/pricing/pricing-hero";
import SecurityGurantee from "@/components/pricing/security-gurantee";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Pricing Plans | INVERX",
  description: "Flexible pricing plans designed to scale with your business. From individual developers to global enterprises.",
  canonicalUrl: "https://inverx.pro/pricing",
});


export default function Page() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background">
      <main className="flex-1">
        <PricingHero />
        <FeatureComparison />
        <SecurityGurantee />
        <PrcingFAQ />
      </main>
    </div>
  )
}