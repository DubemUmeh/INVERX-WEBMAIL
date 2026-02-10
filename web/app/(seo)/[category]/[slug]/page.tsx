import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSEOPage, getAllPSEOPaths, getRelatedPages } from "@/lib/seo-data";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/breadcrumb";
import { SchemaMarkup } from "@/components/seo/schema-markup";
import { RelatedPages } from "@/components/seo/related-pages";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const paths = await getAllPSEOPaths();
  return paths.map((path) => ({
    category: path.category,
    slug: path.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const page = await getSEOPage(category, slug);

  if (!page) return constructMetadata();

  return constructMetadata({
    title: page.title,
    description: page.description,
    canonicalUrl: `https://inverx.pro/${category}/${slug}`,
  });
}

export default async function PSEOPage({ params }: PageProps) {
  const { category, slug } = await params;
  const page = await getSEOPage(category, slug);

  if (!page) {
    notFound();
  }

  const related = await getRelatedPages(category, page.relatedSlugs);

  const breadcrumbs = [
    { label: category.charAt(0).toUpperCase() + category.slice(1), href: `/${category}` },
    { label: page.heading, href: `/${category}/${slug}` },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <SchemaMarkup
        type="Article"
        data={{
          headline: page.title,
          description: page.description,
          author: {
            "@type": "Organization",
            name: "INVERX",
          },
        }}
      />
      {page.faqs.length > 0 && (
        <SchemaMarkup
          type="FAQPage"
          data={{
            mainEntity: page.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }}
        />
      )}

      <Breadcrumbs items={breadcrumbs} />

      <article>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          {page.heading}
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-neutral-300 leading-relaxed mb-8">
            {page.content}
          </p>
        </div>

        {page.faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-neutral-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      <RelatedPages 
        links={related.map(p => ({
          title: p.title,
          href: `/${p.category}/${p.slug}`,
          description: p.description
        }))} 
      />
    </main>
  );
}
