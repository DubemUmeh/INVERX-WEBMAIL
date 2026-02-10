import { Metadata } from "next";

export function constructMetadata({
  title = "INVERX - Scalable Email & SMTP Management",
  description = "The ultimate platform for managing SMTP, domains, and transactional emails at scale. Built for developers and marketers who need reliability.",
  image = "/inverx.svg",
  icons = "/favicon.ico",
  noIndex = false,
  canonicalUrl,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@inverx",
    },
    icons,
    metadataBase: new URL("https://inverx.pro"), // Placeholder domain, should be configurable
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
