import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Brevo Integration",
  description: "Configure and monitor your Brevo (Sendinblue) email integration.",
});

export default function BrevoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
