
"use client";

import React, { useState, useEffect } from 'react';
import ActivitySidebar from '@/components/activity-sidebar';
import {
  Globe,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Menu,
  ShieldCheck,
  Mail,
  Settings,
  Trash2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Copy,
  Download
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { CreateAddressDialog } from "@/components/domains/create-address-dialog";
import { domainsApi } from '@/lib/api';
import { Domain, DnsRecord, DomainAddress } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';

interface DomainPageProps {
  showSidebar?: boolean;
  domainId: string;
}

export default function DomainManagementPage({ showSidebar = true, domainId }: DomainPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOpen, setIsOpen] = useState(false);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [addresses, setAddresses] = useState<DomainAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCloudflare, setIsCloudflare] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    toast.promise(
      domainsApi.verify(domainId)
        .then((result) => {
          // Limit reloads
          setTimeout(() => window.location.reload(), 1500);
          return 'Domain verification initiated';
        })
        .finally(() => setIsVerifying(false)),
      {
        loading: 'Verifying domain configuration...',
        success: (msg) => msg,
        error: 'Failed to verify domain'
      }
    );
  };

  const handleCopy = (text: string, label: string) => {
    toast.promise(
      navigator.clipboard.writeText(text),
      {
        loading: 'Copying to clipboard...',
        success: () => `${label} copied to clipboard`,
        error: 'Failed to copy to clipboard'
      }
    );
  };

  const handleDownloadZoneFile = async () => {
    const downloadPromise = async () => {
      let records = dnsRecords;
      if (records.length === 0) {
        const response = await domainsApi.getDnsRecords(domainId);
        records = response.storedRecords;
        setDnsRecords(records);
      }

      // Generate Cloudflare-compatible zone file content
      // Format: name type value [priority] [ttl]
      const lines = records.map(r => {
        // Remove domain name from record name if it's there (Cloudflare expects relative names)
        let recordName = r.name;
        if (recordName.endsWith('.' + domainName)) {
          recordName = recordName.slice(0, -(domainName.length + 1));
        }
        if (recordName === domainName) {
          recordName = '@';
        }
        if (!recordName) {
          recordName = '@';
        }

        // For MX records, parse priority and server
        if (r.type === 'MX') {
          let priority = '10';
          let server = r.value;
          
          const parts = r.value.trim().split(/\s+/);
          // If the first part is a number and there's more text, assume it's priority + server
          if (parts.length > 1 && /^\d+$/.test(parts[0])) {
            priority = parts[0];
            server = parts.slice(1).join(' ');
          }
          
          return `${recordName}\t${r.ttl || '3600'}\tIN\tMX\t${priority} ${server}`;
        }
        
        // For TXT records, ensure value is quoted
        if (r.type === 'TXT') {
          let txtValue = r.value;
          if (!txtValue.startsWith('"')) {
            txtValue = `"${txtValue}"`;
          }
          return `${recordName}\t${r.ttl || '3600'}\tIN\tTXT\t${txtValue}`;
        }

        // Standard format for other records: name ttl IN type value
        return `${recordName}\t${r.ttl || '3600'}\tIN\t${r.type}\t${r.value}`;
      });

      const content = lines.join('\n');

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${domainName}-zone.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return 'Zone file downloaded';
    };

    toast.promise(downloadPromise(), {
      loading: 'Preparing zone file...',
      success: (msg) => msg,
      error: 'Failed to download zone file'
    });
  };

  const handleDnsCheck = async () => {
    setIsVerifying(true);
    toast.promise(
      (async () => {
        const result = await domainsApi.checkDns(domainId);

        // Handle detailed verification results if available
        if (result.identifiers) {
          const { spf, dkim } = result.identifiers;
          const dnsValid = spf.valid && dkim.valid;
          
          if (!dnsValid) {
            const errors = [];
            if (!spf.valid) errors.push('SPF');
            if (!dkim.valid) errors.push('DKIM');
            throw new Error(`${errors.join(' and ')} records are missing or incorrect`);
          }
          
          // Refresh DNS records to get updated status
          const records = await domainsApi.getDnsRecords(domainId);
          setDnsRecords(records.storedRecords);
          
          // Use the message from backend which might say "Waiting for AWS"
          return result.message || 'DNS records are valid';
        }

        // Refresh records on any tab after check
        if (activeTab === 'dns-records' || activeTab === 'dns') {
          const records = await domainsApi.getDnsRecords(domainId);
          setDnsRecords(records.storedRecords);
        }

        // Fallback to simple check
        if (!result.verified) {
          throw new Error('Some DNS records are missing or incorrect');
        }
        
        return 'DNS records are valid';
      })().finally(() => setIsVerifying(false)), 
      {
        loading: 'Checking DNS records...',
        success: (msg) => msg,
        error: (err) => err.message || 'Failed to check DNS records'
      }
    );
  };

  // Load domain details
  useEffect(() => {
    if (!domainId) return;

    async function loadDomainData() {
      try {
        const domainData = await domainsApi.getById(domainId);
        setDomain(domainData);
      } catch (error) {
        console.error('Failed to load domain', error);
        toast.error('Failed to load domain details');
      } finally {
        setIsLoading(false);
      }
    }
    loadDomainData();
  }, [domainId]);

  // Load DNS records when tab is active
  useEffect(() => {
    if ((activeTab === 'dns-records' || activeTab === 'dns') && domainId) {
      domainsApi.getDnsRecords(domainId)
        .then((response) => setDnsRecords(response.storedRecords))
        .catch(() => toast.error('Failed to load DNS records'));
    }
  }, [activeTab, domainId]);

  // Load Addresses when tab is active
  useEffect(() => {
    if (activeTab === 'addresses' && domainId) {
      domainsApi.getAddresses(domainId)
        .then((addresses) => setAddresses(addresses))
        .catch(() => toast.error('Failed to load addresses'));
    }
  }, [activeTab, domainId]);


  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove #
      if (hash) {
        setActiveTab(hash);
      } else {
        setActiveTab('overview');
        window.location.hash = 'overview';
      }
    };

    // Initial check
    handleHashChange();

    // Listen for changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabClick = (tab: string) => {
    const slug = tab.toLowerCase().replace(' ', '-');
    window.location.hash = slug;
    setActiveTab(slug);
  };

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden min-h-screen">
        <div className="relative flex h-screen w-full overflow-hidden">
          {showSidebar && (
            <div className="hidden lg:block h-full shrink-0 w-[240px] border-r border-surface-border bg-surface-dark">
              <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
            {/* Skeleton Header */}
            <header className="flex items-center justify-between border-b border-surface-border px-4 md:px-16 py-4 bg-background-dark shrink-0">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </header>
            {/* Skeleton Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
              <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
                {/* Skeleton Domain Card */}
                <div className="rounded-xl border border-surface-border bg-surface-dark p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-16 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
                {/* Skeleton Tabs */}
                <div className="flex items-center gap-4 border-b border-surface-border pb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                  ))}
                </div>
                {/* Skeleton Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface-dark border border-surface-border p-5 rounded-xl">
                      <Skeleton className="h-4 w-24 mb-3" />
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Domain Not Found</h1>
            <p className="text-text-secondary">The requested domain could not be found.</p>
          </div>
      </div>
    );
  }

  const domainName = domain.name;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden min-h-screen">
      <div className="relative flex h-screen w-full overflow-hidden">
        
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div className="hidden lg:block h-full shrink-0">
            <ActivitySidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
          
          {/* Top Navigation */}
          <header
            className="flex items-center justify-between whitespace-nowrap border-b border-surface-border px-4 md:px-16 py-4 bg-background-dark z-10 shrink-0">
            <div className="flex items-center gap-4">
              
              {/* Mobile Menu Toggle */}
              {showSidebar && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-white hover:bg-white/10">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 w-[280px] bg-surface-dark text-white">
                        <SheetTitle className="hidden">Menu</SheetTitle>
                        <div className="h-full" onClick={() => setIsOpen(false)}>
                            <ActivitySidebar />
                        </div>
                    </SheetContent>
                </Sheet>
              )}

              <div className="flex items-center gap-2 text-text-secondary sm:text-sm text-xs">
                <Link href={showSidebar ? '/activity/domains' : '/domains'} className="hidden sm:inline">Domains</Link>
                <span className="hidden sm:inline">/</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  {domainName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`https://${domainName}`} target="_blank"  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light border border-surface-border hover:bg-surface-hover transition-colors text-sm text-white">
                <ExternalLink size={16} />
                <span className="hidden sm:inline">Visit Site</span>
              </Link>
              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-primary hover:bg-blue-400 transition-colors duration-200 ease-in-out text-accent px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isVerifying ? <RefreshCw className="animate-spin size-4" /> : null}
                Verify Config
              </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
              {/* Domain Header Card */}
              <div className="rounded-xl border border-surface-border bg-surface-dark p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-center gap-4 z-10">
                  <div className="size-16 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <span className="text-2xl font-bold">{domainName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{domainName}</h1>
                      <div className="flex items-center gap-2">
                        {domain.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle size={12} fill="currentColor" /> Active
                          </span>
                        )}
                        {domain.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <AlertTriangle size={12} className="text-amber-400" /> Pending
                          </span>
                        )} 
                        <span className="text-text-secondary text-sm">• {domain.verificationStatus}</span>
                      </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:pr-8 z-10">
                  <div className="flex flex-col">
                    <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Plan</span>
                    <span className="text-white font-medium">Pro Plan</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Expires</span>
                    <span className="text-white font-medium">{domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Auto-renew</span>
                    <span className={domain.autoRenew ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                      {domain.autoRenew ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center border-b border-surface-border overflow-x-auto">
                {['Overview', 'Addresses', 'DNS Records', 'Security', 'Settings'].map((tab) => {
                    const slug = tab.toLowerCase().replace(' ', '-');
                    const isActive = activeTab === slug;
                    return (
                      <button
                          key={tab}
                          onClick={() => handleTabClick(tab)}
                          className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            isActive
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-white'
                          }`}
                      >
                          {tab}
                          {isActive && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                          )}
                      </button>
                    );
                })}
              </div>

              {/* TAB CONTENT SECTIONS */}
              <div className="mt-6">

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-surface-dark border border-surface-border p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <ShieldCheck size={20} />
                          </div>
                          <h3 className="font-bold text-white">Domain Status</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">Active</p>
                        <p className="text-sm text-text-secondary">Next verified check in 24h</p>
                      </div>
                      <div className="bg-surface-dark border border-surface-border p-5 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                              <Mail size={20} />
                            </div>
                            <h3 className="font-bold text-white">Addresses</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{addresses.length > 0 ? 'Active' : 'Inactive'}</p>
                        <p className="text-sm text-text-secondary">{addresses.length} configured addresses</p>
                      </div>
                      <div className="bg-surface-dark border border-surface-border p-5 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                              <RefreshCw size={20} />
                            </div>
                            <h3 className="font-bold text-white">Auto-Renew</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{domain.status === 'active' ? 'Active' : 'Pending'}</p>
                        <p className="text-sm text-text-secondary">Expires {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <CreateAddressDialog 
                            domainId={domainId} 
                            domainName={domainName} 
                            onSuccess={() => {/* Typically would refresh addresses but we are in overview tab */}}
                            trigger={
                              <Button variant="outline" className="h-auto py-4 justify-start gap-4 border-surface-border bg-surface-dark hover:bg-surface-hover hover:text-white">
                                  <Plus className="size-5 text-primary" />
                                  <div className="text-left">
                                    <div className="font-semibold">Add Address</div>
                                    <div className="text-xs text-muted-foreground font-normal">Create new address</div>
                                  </div>
                              </Button>
                            }
                          />
                          <Button 
                            variant="outline" 
                            className="h-auto py-4 justify-start gap-4 border-surface-border bg-surface-dark hover:bg-surface-hover hover:text-white"
                            onClick={handleDnsCheck}
                            disabled={isVerifying}
                          >
                            <Search className="size-5 text-purple-500" />
                            <div className="text-left">
                              <div className="font-semibold">DNS Check</div>
                              <div className="text-xs text-muted-foreground font-normal">Verify records</div>
                            </div>
                          </Button>

                          <Button 
                              variant="outline" 
                              className="h-auto py-4 justify-start gap-4 border-surface-border bg-surface-dark hover:bg-surface-hover hover:text-white"
                              onClick={handleDownloadZoneFile}
                          >
                            <Download className="size-5 text-blue-400" />
                            <div className="text-left">
                              <div className="font-semibold">Download Config</div>
                              <div className="text-xs text-muted-foreground font-normal">Zone file for import</div>
                            </div>
                          </Button>

                          {isCloudflare && (
                            <Button 
                              variant="outline" 
                              className="h-auto py-4 justify-start gap-4 border-surface-border bg-surface-dark hover:bg-surface-hover hover:text-white"
                              onClick={() => window.open('https://dash.cloudflare.com/', '_blank')}
                            >
                              <div className="size-5 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#F38020] size-5">
                                  <path d="M11.666 9.614c-1.33 0-1.872.632-1.996.936-.8-1.554-3.007-1.396-3.235.32h-.032C3.593 10.87 2.015 13.568 4.297 16h13.1c3.21-.065 4.352-3.837 2.001-5.717-.551-3.233-4.062-4.048-5.871-2.146-.358-1.425-1.574-1.923-1.861-1.923z"/>
                                </svg>
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Cloudflare</div>
                                <div className="text-xs text-muted-foreground font-normal">Configure DNS</div>
                              </div>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* 2. DNS RECORDS TAB */}
                {(activeTab === 'dns-records' || activeTab === 'dns') && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                          <h3 className="text-lg font-bold text-white">DNS Configuration</h3>
                          <p className="text-text-secondary text-sm">Manage your domain's DNS records for email delivery.</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                            <input 
                              type="text" 
                              placeholder="Search records..." 
                              className="bg-surface-dark border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                          </div>
                          <button className="p-2 border border-surface-border rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover transition-colors">
                            <Filter size={18} />
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                            <Plus size={16} />
                            Add Record
                          </button>
                      </div>
                    </div>

                    <div className="w-full overflow-hidden rounded-xl border border-surface-border bg-surface-dark shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#161616] border-b border-surface-border">
                              <tr>
                                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Value</th>
                                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">TTL</th>
                                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                  <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                              {dnsRecords.map((record, index) => (
                                  <tr key={index} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-white/5 text-white border border-white/10 min-w-[50px]">
                                          {record.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 group/name" onClick={() => handleCopy(record.name, 'Record Name')}>
                                          <span className="text-sm font-medium text-white font-mono">{record.name}</span>
                                          <button 
                                            onClick={() => handleCopy(record.name, 'Record Name')}
                                            className="opacity-0 group-hover/name:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-text-secondary hover:text-white"
                                            title="Copy Name"
                                          >
                                              <Copy size={12} />
                                          </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-xs xl:max-w-md group/value" onClick={() => handleCopy(record.value, 'Record Value')}>
                                          <span className="text-sm text-text-secondary truncate font-mono" title={record.value}>{record.value}</span>
                                          <button 
                                            onClick={() => handleCopy(record.value, 'Record Value')}
                                            className="opacity-0 group-hover/value:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-text-secondary hover:text-white"
                                            title="Copy Value"
                                          >
                                              <Copy size={12} />
                                          </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{record.ttl}</td>
                                    <td className="px-6 py-4">
                                        {record.status === 'active' && (
                                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                              <CheckCircle size={10} fill="currentColor" /> Active
                                          </span>
                                        )}
                                        {record.status === 'pending' && (
                                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                              <RefreshCw size={10} className="animate-spin" /> Pending
                                          </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-text-secondary hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                          <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                  </tr>
                              ))}
                            </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ADDRESSES TAB */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">Domain Addresses</h3>
                        <p className="text-text-secondary text-sm">Manage your custom domain email addresses and aliases.</p>
                      </div>
                      <CreateAddressDialog 
                        domainId={domainId} 
                        domainName={domainName} 
                        onSuccess={() => {
                          // Refresh addresses
                          domainsApi.getAddresses(domainId).then(setAddresses);
                        }}
                      />
                    </div>
                    
                    {addresses.length === 0 ? (
                        <div className="bg-surface-dark border border-surface-border rounded-xl p-8 text-center">
                          <div className="size-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
                              <Mail size={32} />
                          </div>
                          <h3 className="text-white font-bold text-lg">No addresses configured</h3>
                          <p className="text-text-secondary max-w-sm mx-auto mt-2 mb-6">Start receiving emails by creating your first custom domain address.</p>
                          <CreateAddressDialog 
                            domainId={domainId} 
                            domainName={domainName} 
                            onSuccess={() => {
                              domainsApi.getAddresses(domainId).then(setAddresses);
                            }}
                            trigger={
                              <Button variant="outline" className="border-surface-border text-text-secondary hover:bg-surface-hover cursor-pointer">
                                Create Address
                              </Button>
                            }
                          />
                        </div>
                    ) : (
                      <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                          <table className="min-w-full divide-y divide-border-dark">
                              <thead className="bg-[#161616]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border-dark">
                                {addresses.map((addr) => (
                                    <tr key={addr.id} className="hover:bg-background-dark/50 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Mail size={16} />
                                            </div>
                                            <span className="text-white font-medium">{addr.email}</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-text-secondary">
                                        {new Date(addr.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-text-secondary hover:text-red-400 hover:bg-red-500/10">
                                              <Trash2 size={16} />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-background border-surface-border">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-white">Delete Address</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete <span className="font-medium text-white">{addr.email}</span>? This action cannot be undone and you will no longer receive emails at this address.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="bg-surface-light border-surface-border text-white hover:bg-surface-hover">Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                onClick={() => {
                                                  toast.promise(
                                                    domainsApi.deleteAddress(domainId, addr.id)
                                                      .then(() => {
                                                        setAddresses(prev => prev.filter(a => a.id !== addr.id));
                                                        return 'Address deleted successfully';
                                                      }),
                                                    {
                                                      loading: 'Deleting address...',
                                                      success: (msg) => msg,
                                                      error: 'Failed to delete address'
                                                    }
                                                  );
                                                }}
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </td>
                                    </tr>
                                ))}
                              </tbody>
                          </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SECURITY TAB */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-white">Security Policies</h3>
                        <p className="text-text-secondary text-sm">Configure DMARC, SPF, and other security protocols.</p>
                      </div>

                      <div className="bg-surface-dark border border-surface-border rounded-xl divide-y divide-surface-border">
                        <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">SPF Records</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Valid</span>
                              </div>
                              <p className="text-sm text-text-secondary">Sender Policy Framework prevents spoofing.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">DKIM Signing</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Active</span>
                              </div>
                              <p className="text-sm text-text-secondary">DomainKeys Identified Mail adds a digital signature.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">DMARC Policy</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Quarantine</span>
                              </div>
                              <p className="text-sm text-text-secondary">Domain-based Message Authentication, Reporting, and Conformance.</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-xs border-surface-border text-text-secondary hover:text-white hover:bg-surface-hover">Configuration</Button>
                        </div>
                      </div>
                  </div>
                )}

                {/* 5. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-8">
                      <div className="grid gap-6">
                        <div className="bg-surface-dark border border-surface-border rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">General Settings</h3>
                            <div className="flex items-center justify-between">
                              <div>
                                  <div className="font-medium text-white">Auto-Renew Domain</div>
                                  <p className="text-sm text-text-secondary">Automatically renew this domain before it expires.</p>
                              </div>
                              <Switch checked={true} />
                            </div>
                        </div>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
                        <p className="text-sm text-red-200/60 mb-6">Irreversible actions for your domain.</p>
                        
                        <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">Remove Domain</div>
                              <p className="text-sm text-text-secondary">Remove this domain from your account. DNS records will stop working.</p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                                  <Trash2 size={16} className="mr-2" />
                                  Remove Domain
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-surface-dark border-surface-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Remove Domain</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove <span className="font-medium text-white">{domainName}</span>? This will:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                      <li>Stop all email delivery for this domain</li>
                                      <li>Delete all associated email addresses</li>
                                      <li>Remove all DNS configuration</li>
                                    </ul>
                                    <p className="mt-2 text-red-400 font-medium">This action cannot be undone.</p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-surface-light border-surface-border text-white hover:bg-surface-hover">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => {
                                      domainsApi.delete(domainId)
                                        .then(() => {
                                          toast.success('Domain removed successfully');
                                          window.location.href = '/domains';
                                        })
                                        .catch(() => toast.error('Failed to remove domain'));
                                    }}
                                  >
                                    Remove Domain
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                  </div>
                )}

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
