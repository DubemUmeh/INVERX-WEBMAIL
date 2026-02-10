import React from "react";

type SchemaType = "Article" | "FAQPage" | "BreadcrumbList" | "Product";

interface SchemaMarkupProps {
  type: SchemaType;
  data: Record<string, any>;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type, data }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
