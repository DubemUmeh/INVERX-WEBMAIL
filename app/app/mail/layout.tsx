import React from "react";
import WebmailLayout from "@/components/layout/webmail-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WebmailLayout>{children}</WebmailLayout>;
}
