import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Privacy Policy | INVERX",
  description: "Learn how INVERX protects your data and respects your privacy with our transparent data policies.",
  canonicalUrl: "https://inverx.pro/privacy-policy",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
