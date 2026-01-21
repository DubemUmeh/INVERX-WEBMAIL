import DomainManagementPage from "@/components/DomainPage";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DomainDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  return (
    <DomainManagementPage domainId={slug} />
  );
}
