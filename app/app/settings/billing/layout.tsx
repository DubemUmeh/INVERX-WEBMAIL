import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Billing & Subscriptions",
  description: "Manage your billing information, invoices, and subscription plans.",
});

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
