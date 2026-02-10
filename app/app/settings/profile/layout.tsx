import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Profile Settings",
  description: "Personalize your account details and profile information.",
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
