import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "API Keys",
  description: "Generate and manage API keys for programmatic access to INVERX.",
});

export default function ApiKeysLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
