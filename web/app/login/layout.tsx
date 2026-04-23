import { constructMetadata } from "@/lib/seo";
import { Suspense } from "react";
import Page from "./page";

export const metadata = constructMetadata({
  title: "Login | INVERX",
  description: "Access your INVERX workspace to manage your email infrastructure, SMTP relays, and domain reputation.",
  canonicalUrl: "https://inverx.pro/login",
});

export default function LoginLayout() {
  return <Suspense><Page /></Suspense>;
}
