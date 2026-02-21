import DeveloperRelease from "@/components/resources/developer-release";
import MainTopic from "@/components/resources/main-topic";
import Migration from "@/components/resources/migration";
import ResHero from "@/components/resources/res-hero";
import SupportCTA from "@/components/resources/support-cta";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Resources & Documentation | INVERX",
  description: "Explore guides, developer documentation, and migration resources to get the most out of INVERX.",
  canonicalUrl: "https://inverx.pro/resources",
});

export default function Page() {
  return (
    <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-40 bg-background">
      <section className="flex flex-col max-w-[960px] flex-1 w-full gap-8">
        <ResHero />
        <Migration />
        <MainTopic />
        <DeveloperRelease />
        <SupportCTA />
      </section>
    </main>
  )
}