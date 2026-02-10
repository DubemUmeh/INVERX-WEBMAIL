export interface SEOPageData {
  slug: string;
  category: string;
  title: string;
  description: string;
  heading: string;
  content: string;
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

// In a real scenario, this would be a database call or a high-performance fetch.
// For demonstration and scalability, we use a structured lookup.
const PSEO_DATA: Record<string, Record<string, SEOPageData>> = {
  solutions: {
    "smtp-relay-for-saas": {
      slug: "smtp-relay-for-saas",
      category: "solutions",
      title: "Reliable SMTP Relay for SaaS Applications | INVERX",
      description:
        "Scale your SaaS communication with INVERX's high-performance SMTP relay. Ensure 99.9% deliverability for transactional emails.",
      heading: "Enterprise-Grade SMTP Relay for SaaS",
      content:
        "As a SaaS founder, managing email deliverability is critical. INVERX provides a robust infrastructure that handles millions of emails without breaking a sweat...",
      faqs: [
        {
          question: "How does INVERX ensure high deliverability?",
          answer:
            "We use dedicated IP pools and automated SPF/DKIM management to maintain high sender reputation.",
        },
      ],
      relatedSlugs: ["transactional-email-api", "domain-reputation-management"],
    },
    "transactional-email-api": {
      slug: "transactional-email-api",
      category: "solutions",
      title: "Powerful Transactional Email API for Developers | INVERX",
      description:
        "Integrate email capabilities into your app in minutes with our developer-friendly API. Robust, fast, and scalable.",
      heading: "Smarter Transactional Email API",
      content:
        "Stop wrestling with complex email protocols. INVERX's API is designed for modern developers who value speed and reliability...",
      faqs: [
        {
          question: "Does it support template management?",
          answer:
            "Yes, you can manage and version your email templates directly within the INVERX dashboard.",
        },
      ],
      relatedSlugs: ["smtp-relay-for-saas", "bulk-email-solutions"],
    },
  },
};

export async function getSEOPage(
  category: string,
  slug: string,
): Promise<SEOPageData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 50));
  return PSEO_DATA[category]?.[slug] || null;
}

export async function getAllPSEOPaths() {
  const paths: { category: string; slug: string }[] = [];
  for (const category in PSEO_DATA) {
    for (const slug in PSEO_DATA[category]) {
      paths.push({ category, slug });
    }
  }
  return paths;
}

export async function getRelatedPages(
  currentCategory: string,
  relatedSlugs: string[],
) {
  const related: SEOPageData[] = [];
  for (const slug of relatedSlugs) {
    const page = await getSEOPage(currentCategory, slug);
    if (page) related.push(page);
  }
  return related;
}
