import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Join the Waitlist | INVERX",
  description: "Request early access to the next generation of email automation and infrastructure tools.",
  canonicalUrl: "https://inverx.pro/waitlists",
});

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
