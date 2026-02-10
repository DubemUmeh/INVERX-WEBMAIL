import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Terms of Service | INVERX",
  description: "Read the terms and conditions for using INVERX services and products.",
  canonicalUrl: "https://inverx.pro/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
