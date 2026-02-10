import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageLink {
  title: string;
  href: string;
  description?: string;
}

interface RelatedPagesProps {
  links: PageLink[];
  title?: string;
  className?: string;
}

export const RelatedPages: React.FC<RelatedPagesProps> = ({
  links,
  title = "Related Resources",
  className,
}) => {
  if (!links.length) return null;

  return (
    <section className={cn("mt-12 pt-8 border-t border-neutral-800", className)}>
      <h2 className="text-xl font-semibold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group block p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700 transition-all"
          >
            <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
              {link.title}
            </h3>
            {link.description && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                {link.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};
