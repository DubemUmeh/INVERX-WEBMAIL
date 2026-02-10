import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Sign Up | INVERX",
  description: "Create your INVERX account and start building enterprise-grade email infrastructure in minutes.",
  canonicalUrl: "https://inverx.pro/sign-up",
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
