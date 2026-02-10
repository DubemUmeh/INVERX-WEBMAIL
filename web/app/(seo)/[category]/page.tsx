import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPSEOPaths } from "@/lib/seo-data";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/breadcrumb";

interface HubProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: HubProps): Promise<Metadata> {
  const { category } = await params;
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  
  return constructMetadata({
    title: `${capitalized} Solutions & Resources | INVERX`,
    description: `Explore all our ${category} solutions designed for high-scale email management and reliability.`,
    canonicalUrl: `https://inverx.pro/${category}`,
  });
}

export default async function CategoryHub({ params }: HubProps) {
  const { category } = await params;
  const allPaths = await getAllPSEOPaths();
  const categoryPaths = allPaths.filter(p => p.category === category);

  if (categoryPaths.length === 0) {
    notFound();
  }

  const breadcrumbs = [
    { label: category.charAt(0).toUpperCase() + category.slice(1), href: `/${category}` },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 capitalize">
          {category} Resources
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          Deep dives into our {category} capabilities, best practices, and enterprise-grade infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryPaths.map((path) => (
          <Link
            key={path.slug}
            href={`/${path.category}/${path.slug}`}
            className="group p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700 transition-all flex flex-col h-full"
          >
            <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-400 transition-colors capitalize">
              {path.slug.replace(/-/g, ' ')}
            </h2>
            <p className="text-neutral-400 line-clamp-3">
              Learn how our {path.slug.replace(/-/g, ' ')} can transform your business communications.
            </p>
            <div className="mt-auto pt-6 text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Read more →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
