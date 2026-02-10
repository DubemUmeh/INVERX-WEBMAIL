import ActivityShell from "@/components/layout/activity-shell";
import SmtpConfigurationPage from "@/components/smtp/smtp-page";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "SMTP Configuration",
  description: "Configure and manage your SMTP relay settings and credentials.",
});

export default function SmtpPage() {
  return (
    <ActivityShell>
      <SmtpConfigurationPage />
    </ActivityShell>
  )
}