import AdminDashShowcase from "@/components/teams/admin-dash-showcase";
import TeamsCTA from "@/components/teams/cta-banner";
import PricingCallout from "@/components/teams/pricing-callout";
import SecurityAndcompliance from "@/components/teams/security-and-compliance";
// import SocialProof from "@/components/teams/social-proof";
import TeamCoreFeatures from "@/components/teams/team-core-features";
import TeamsHero from "@/components/teams/teams-hero";

export default function Page() {
  return (
    <main className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background/80">
      <TeamsHero />
      {/* <SocialProof /> */}
      <TeamCoreFeatures />
      <AdminDashShowcase />
      <SecurityAndcompliance />
      <PricingCallout />
      <TeamsCTA />
    </main>
  )
}