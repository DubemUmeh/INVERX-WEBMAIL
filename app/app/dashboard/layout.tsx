import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Dashboard",
  description: "Overview of your email infrastructure, domain health, and recent activities.",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
