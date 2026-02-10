import { MetadataRoute } from "next";
import { getAllPSEOPaths } from "@/lib/seo-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getAllPSEOPaths();

  const pseoEntries = paths.map((path) => ({
    url: `https://inverx.pro/${path.category}/${path.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticEntries = [
    {
      url: "https://inverx.pro",
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 1,
    },
    {
      url: "https://inverx.pro/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  return [...staticEntries, ...pseoEntries];
}
