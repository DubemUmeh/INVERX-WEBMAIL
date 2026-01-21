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
  Loader2
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { domainsApi } from '@/lib/api';
import { Domain, DnsRecord, DomainAddress } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

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
      <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
        <Loader2 className="animate-spin size-8 text-primary" />
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
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light border border-surface-border hover:bg-surface-hover transition-colors text-sm text-white">
                <ExternalLink size={16} />
                <span className="hidden sm:inline">Visit Site</span>
              </button>
              <button className="bg-primary hover:bg-blue-600 text-accent px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
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
                            <span className="text-text-secondary text-sm">• Verified {domain.verificationStatus}</span>
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
                           <Button variant="outline" className="h-auto py-4 justify-start gap-4 border-surface-border bg-surface-dark hover:bg-surface-hover hover:text-white">
                              <Plus className="size-5 text-primary" />
                              <div className="text-left">
                                <div className="font-semibold">Add Address</div>
                                <div className="text-xs text-muted-foreground font-normal">Create new address</div>
                              </div>
                           </Button>
                           <Button variant="outline" className="h-auto py-4 justify-start gap-4 border-surface-border bg-surface-dark hover:bg-surface-hover hover:text-white">
                              <Search className="size-5 text-purple-500" />
                              <div className="text-left">
                                <div className="font-semibold">DNS Check</div>
                                <div className="text-xs text-muted-foreground font-normal">Verify records</div>
                              </div>
                           </Button>
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
                                          <span className="text-sm font-medium text-white font-mono">{record.name}</span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2 max-w-xs xl:max-w-md">
                                            <span className="text-sm text-text-secondary truncate font-mono" title={record.value}>{record.value}</span>
                                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-text-secondary hover:text-white">
                                                <RefreshCw size={12} />
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
                          <Button className="bg-primary hover:bg-blue-600 text-white">
                            <Plus size={16} className="mr-2" />
                            Create Address
                          </Button>
                       </div>
                       
                       {addresses.length === 0 ? (
                           <div className="bg-surface-dark border border-surface-border rounded-xl p-8 text-center">
                              <div className="size-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
                                 <Mail size={32} />
                              </div>
                              <h3 className="text-white font-bold text-lg">No addresses configured</h3>
                              <p className="text-text-secondary max-w-sm mx-auto mt-2 mb-6">Start receiving emails by creating your first custom domain address.</p>
                              <Button variant="outline" className="border-surface-border text-white hover:bg-surface-hover">
                                 Create Address
                              </Button>
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
                                             <Button variant="ghost" size="icon" className="text-text-secondary hover:text-red-400 hover:bg-red-500/10">
                                                <Trash2 size={16} />
                                             </Button>
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
                             <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                                <Trash2 size={16} className="mr-2" />
                                Remove Domain
                             </Button>
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
