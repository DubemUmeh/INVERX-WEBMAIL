"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Plus, ExternalLink, Trash2, Globe } from "lucide-react";
import { domainsApi } from "@/lib/api/domains";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DomainsSettingsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setIsLoading(true);
      const data = await domainsApi.getAll();
      setDomains(data || []);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
      toast.error("Failed to load domains");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    // Confirmation handled by AlertDialog
    try {
      await domainsApi.delete(id);
      setDomains(domains.filter(d => d.id !== id));
      toast.success("Domain deleted successfully");
    } catch (error) {
      toast.error("Failed to delete domain");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
             <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
            Domains
          </h2>
          <p className="text-neutral-500 text-base">
            Manage your custom domains and DNS settings.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/domains/add">
            <Plus className="mr-2 h-4 w-4" /> Add Domain
          </Link>
        </Button>
      </div>

      {domains.length > 0 ? (
        <div className="grid gap-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                      <Globe className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        {domain.name}
                        <Badge variant={domain.status === 'active' ? 'secondary' : 'outline'} className={domain.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200' : ''}>
                          {domain.status}
                        </Badge>
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {domain.verificationStatus === 'verified' ? 'verified' : 'pending verification'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/domains/${domain.name}`}>
                        <ExternalLink className="mr-2 h-4 w-4" /> Manage
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the domain
                            and remove all associated email addresses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteDomain(domain.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <Monitor className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No domains added</h3>
          <p className="text-neutral-500 max-w-sm mt-1">Add a custom domain to send and receive emails from your own brand.</p>
        </div>
      )}
    </div>
  );
}
