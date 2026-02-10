import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Inbox Rules",
  description: "Automate your inbox with custom filtering and routing rules.",
});

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
