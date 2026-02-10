import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Notifications & Activity",
  description: "Review your account activity logs and notification settings.",
});

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
