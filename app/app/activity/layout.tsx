import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Observability & Activity",
  description: "Real-time insights and logs for your infrastructure performance.",
});

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
