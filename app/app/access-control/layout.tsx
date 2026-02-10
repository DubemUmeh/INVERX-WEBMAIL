import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Access Control & Team",
  description: "Manage team members, roles, and security settings.",
});

export default function AccessControlLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
