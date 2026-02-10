import SmtpConfigurationPage from "@/components/smtp/smtp-page";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "SMTP Configuration",
  description: "Configure your custom SMTP servers and relay settings.",
});


export default function Page() {
  return <SmtpConfigurationPage />
}