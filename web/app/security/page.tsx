import ComplianceBadges from "@/components/security/compliance-badges";
import SecurityDiagram from "@/components/security/diagram";
import SecurityFeature from "@/components/security/feature";
import SecurityCTA from "@/components/security/security-cta";
import SecurityFAQ from "@/components/security/security-faq";
import SecurityHero from "@/components/security/security-hero";
import SecurityStats from "@/components/security/stats";

export default function Page() {
  return (
    <main className="flex flex-col items-center w-full">
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