import { Metadata } from "next";

export function constructMetadata({
  title = "INVERX - Dashboard",
  description = "Manage your email infrastructure with ease.",
  noIndex = true, // Dashboard pages should generally be private
}: {
  title?: string;
  description?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      template: "%s | INVERX",
      default: title,
    },
    description,
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    icons: "/favicon.ico",
    metadataBase: new URL("https://app.inverx.pro"),
  };
}
