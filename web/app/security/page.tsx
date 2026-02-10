import ComplianceBadges from "@/components/security/compliance-badges";
import SecurityDiagram from "@/components/security/diagram";
import SecurityFeature from "@/components/security/feature";
import SecurityCTA from "@/components/security/security-cta";
import SecurityFAQ from "@/components/security/security-faq";
import SecurityHero from "@/components/security/security-hero";
import SecurityStats from "@/components/security/stats";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Security & Compliance | INVERX",
  description: "Discover how INVERX ensures enterprise-grade security, data encryption, and compliance with global standards.",
  canonicalUrl: "https://inverx.pro/security",
});


export default function Page() {
  return (
    <main className="flex flex-col items-center w-full bg-background">
      <SecurityHero />
      <SecurityStats />
      <SecurityFeature />
      <SecurityDiagram />
      <ComplianceBadges />
      <SecurityFAQ />
      <SecurityCTA />
    </main>
  )
}