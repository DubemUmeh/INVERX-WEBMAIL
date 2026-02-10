import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Domain Settings",
  description: "Detailed configuration for your verified sending domains.",
});

export default function DomainsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
