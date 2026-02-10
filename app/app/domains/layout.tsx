import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Domain Management",
  description: "Verify and manage your sending domains and DNS configurations.",
});

export default function DomainsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
