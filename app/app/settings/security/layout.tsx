import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Security & Authentication",
  description: "Secure your account with multi-factor authentication and password management.",
});

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
