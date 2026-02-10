"use client";

import React from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Globe, CheckCircle, AlertTriangle, ExternalLink, Mail, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from 'react';
import { domainsApi } from '@/lib/api';
import { Domain } from '@/types';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function DomainsPage({ headerPrefix }: { headerPrefix?: React.ReactNode }) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDomains() {
      try {
        const response = await domainsApi.getAll();
        setDomains(response || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load domains');
      } finally {
        setIsLoading(false);
      }
    }

    loadDomains();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen text-base">
        <div className="max-w-6xl mx-auto px-6 py-10">
           <div className="flex justify-between items-center mb-10">
              <div className="space-y-2">
                 <Skeleton className="h-8 w-48" />
                 <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
           </div>
           
           <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
           </div>

           <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen text-base">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            {headerPrefix}
            <div>
              <span className="flex items-center gap-2">
                <Link href="/dashboard" className="hidden sm:inline underline underline-offset-4">Dashboard</Link>
                <span className="hidden sm:inline">/</span>
                <h1 className="text-3xl font-bold text-white mb-2">Domains</h1>
              </span>
              <p className="text-text-secondary text-base">Manage your verified domains and DNS configurations.</p>
            </div>
          </div>
          <Link href="/domains/add">
            <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-accent px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20 cursor-pointer w-full">
              <Plus size={18} />
              Add Domain
            </button>
          </Link>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search domains..." 
              className="w-full bg-surface-dark border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-text-secondary hidden sm:inline-block mr-2">Sort by:</span>
            <Select defaultValue="Date Added (Newest)">
              <SelectTrigger className="w-full sm:w-[180px] bg-surface-dark border-surface-border text-white h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Date Added (Newest)">Date Added (Newest)</SelectItem>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
        </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {domains.map((domain) => (
            <Link 
              href={`/domains/${domain.name}`} 
              key={domain.id}
              className="group block bg-surface-dark border border-surface-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-lg bg-background-dark border border-surface-border flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:border-primary/30 transition-colors">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      {domain.name}
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary" />
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                       {/* Cloudflare-managed domains */}
                       {domain.cloudflare?.mode === 'managed' && domain.cloudflare?.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400">
                          <CheckCircle size={12} fill="currentColor" className="text-blue-400/20" /> DNS Ready
                        </span>
                      )}
                       {domain.cloudflare?.mode === 'managed' && domain.cloudflare?.status !== 'active' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                          <AlertTriangle size={12} className="text-amber-400" /> Pending DNS
                        </span>
                      )}
                      {/* AWS/Manual domains without Cloudflare */}
                      {!domain.cloudflare && domain.ses?.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle size={12} fill="currentColor" className="text-emerald-400/20" /> Email Ready
                        </span>
                      )}
                      {!domain.cloudflare && domain.ses?.verificationStatus !== 'verified' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                          <AlertTriangle size={12} className="text-amber-400" /> Pending Verification
                        </span>
                      )}
                      {domain.status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <AlertTriangle size={12} className="text-red-400" /> Configuration Error
                        </span>
                      )}
                      {/* Cloudflare badge */}
                      {domain.cloudflare?.mode === 'managed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400">
                          <span className="size-1.5 bg-orange-400 rounded-full" /> Cloudflare
                        </span>
                      )}
                      <span className="text-text-secondary text-xs">• Added {domain.createdAt ? new Date(domain.createdAt).toLocaleDateString() : 'recently'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:gap-12 pl-16 md:pl-0">
                  <div className="flex flex-col">
                    <span className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold mb-0.5">Plan</span>
                    <span className="text-white text-sm font-medium">Pro Plan</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold mb-0.5">Expires</span>
                    <span className="text-white text-sm font-medium">{domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold mb-0.5">Auto-renew</span>
                    <span className={domain.autoRenew ? "text-emerald-400 text-sm font-medium" : "text-red-400 text-sm font-medium"}>
                      {domain.autoRenew ? "On" : "Off"}
                    </span>
                  </div>
                  <div className="ml-2" onClick={(e) => e.preventDefault()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors outline-none">
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] bg-background border-surface-border text-white">
                        <DropdownMenuItem className="cursor-pointer focus:bg-surface-hover focus:text-white" asChild>
                          <Link href={`/domains/${domain.name}`} className="flex items-center gap-2">
                              <ExternalLink size={14} className="text-text-secondary" />
                              <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer focus:bg-surface-hover focus:text-white" asChild>
                          <Link href={`/domains/${domain.name}#addresses`} className="flex items-center gap-2">
                              <Mail size={14} className="text-text-secondary" />
                              <span>Add Address</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-surface-border" />
                        <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400 flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" onClick={(e) => e.stopPropagation()} className="bg-red-600 hover:bg-red-700 text-white">
                                <Trash2 size={16} className="mr-2" />
                                Remove Domain
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background border-surface-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Remove Domain</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div>
                                    <span>
                                      Are you sure you want to remove <span className="font-medium text-white">{domain.name}</span>? This will:
                                      <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Stop all email delivery for this domain</li>
                                        <li>Delete all associated email addresses</li>
                                        <li>Remove all DNS configuration</li>
                                      </ul>
                                    </span>
                                    <p className="mt-2 text-red-400 font-medium">This action cannot be undone.</p>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-surface-light border-surface-border text-white hover:bg-surface-hover">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    domainsApi.delete(domain.id)
                                      .then(() => {
                                        toast.success('Domain removed successfully');
                                        // Refresh the list instead of reloading
                                        setDomains(domains.filter(d => d.id !== domain.id));
                                      })
                                      .catch(() => toast.error('Failed to remove domain'));
                                  }}
                                >
                                  Remove Domain
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}