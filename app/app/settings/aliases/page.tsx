"use client";

import React, { useEffect, useState } from "react";
import { AtSign, Loader2, Plus, Trash2, Mail, Shield, CheckCircle2, XCircle } from "lucide-react";
import { domainsApi } from "@/lib/api/domains";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function AliasesSettingsPage() {
  const [aliases, setAliases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAliases();
  }, []);

  const fetchAliases = async () => {
    try {
      setIsLoading(true);
      const domains = await domainsApi.getAll();
      
      const aliasesPromises = (domains || []).map((domain: any) => 
        domainsApi.getAddresses(domain.id).then(addresses => 
          (addresses || []).map((addr: any) => ({ ...addr, domainName: domain.name }))
        )
      );

      const resolvedAliasesGroups = await Promise.all(aliasesPromises);
      const allAliases = resolvedAliasesGroups.flat();
      
      setAliases(allAliases);
    } catch (error) {
      console.error("Failed to fetch aliases:", error);
      toast.error("Failed to load aliases");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAlias = async (domainId: string, addressId: string) => {
    if (!confirm("Are you sure you want to delete this alias? You will no longer receive emails sent to this address.")) {
      return;
    }
    try {
      await domainsApi.deleteAddress(domainId, addressId);
      setAliases(aliases.filter(a => a.id !== addressId));
      toast.success("Alias deleted successfully");
    } catch (error) {
      toast.error("Failed to delete alias");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
            Aliases
          </h2>
          <p className="text-neutral-500 text-base">
            Manage email aliases and forwarding rules.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/aliases/add">
            <Plus className="mr-2 h-4 w-4" /> Create Alias
          </Link>
        </Button>
      </div>

      {aliases.length > 0 ? (
        <div className="grid gap-4">
          {aliases.map((alias) => (
            <Card key={alias.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        {alias.name}@{alias.domainName}
                        {alias.isPrimary && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
                             Primary
                          </Badge>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Enabled
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          {alias.status === 'active' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                          {alias.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteAlias(alias.domainId, alias.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <AtSign className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No aliases found</h3>
          <p className="text-neutral-500 max-w-sm mt-1">Create aliases to protect your primary email address.</p>
        </div>
      )}
    </div>
  );
}
