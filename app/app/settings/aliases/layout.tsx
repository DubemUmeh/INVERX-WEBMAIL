import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Email Aliases",
  description: "Create and manage email aliases for your domains.",
});

export default function AliasesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
