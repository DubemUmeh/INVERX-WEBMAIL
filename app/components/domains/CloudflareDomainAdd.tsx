"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, AlertTriangle, Loader2, Shield, Zap, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { domainsApi, brevoApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CloudflareDomainAdd() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'verification'>('input');
  const [domainInput, setDomainInput] = useState('');
  const [dnsMode, setDnsMode] = useState<'manual' | 'cloudflare-managed'>('manual');
  const [createdDomain, setCreatedDomain] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingCloudflare, setIsCheckingCloudflare] = useState(false);
  const [hasCloudflare, setHasCloudflare] = useState(false);

  // Check if Cloudflare is configured for the account
  useEffect(() => {
    const checkCloudflareConfig = async () => {
      setIsCheckingCloudflare(true);
      try {
        const status = await brevoApi.getStatus();
        setHasCloudflare(!!status.isCloudflareAvailable);
        // setHasCloudflare(true);
      } catch (error) {
        console.error('Failed to check Cloudflare config:', error);
        setHasCloudflare(false);
      } finally {
        setIsCheckingCloudflare(false);
      }
    };
    checkCloudflareConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput) return;

    setIsCreating(true);
    try {
      // Calling the backend Cloudflare domain verification handled at the backend
      const data = await domainsApi.create({ 
        name: domainInput,
        dnsMode: dnsMode 
      });
      
      setCreatedDomain(data);
      
      if (dnsMode === 'cloudflare-managed' && data.status === 'active') {
          toast.success('Domain connected and verified automatically via Cloudflare!');
          router.push(`/domains/${data.name}`);
      } else {
          setStep('verification');
          toast.success(dnsMode === 'cloudflare-managed' 
            ? 'Domain created! Please update your nameservers.' 
            : 'Domain created! Please add DNS records.'
          );
      }
    } catch (error: any) {
      console.error('Error creating domain:', error);
      toast.error(error.response?.data?.message || 'Failed to create domain');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerify = async () => {
    if (!createdDomain) return;
    
    setIsVerifying(true);
    try {
      const data = await domainsApi.verify(createdDomain.name);
      
      if (data.verified) {
        toast.success('Domain verified successfully!');
        router.push(`/domains/${createdDomain.name}`);
      } else {
        toast.warning('Domain not verified yet. Please check your DNS records.');
      }
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkipToView = () => {
    if (createdDomain) {
      router.push(`/domains/${createdDomain.name}`);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8 relative">
      <Link 
        href="/domains" 
        className="absolute top-10 left-10 text-white hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
        >
        <ArrowLeft size={16} />
        Back to Domains
      </Link>

      <div className="text-center space-y-2">
        <div className="mx-auto size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
          <Globe size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connect a Domain</h1>
        <p className="text-text-secondary">
          {step === 'input' 
              ? "Choose how you want to connect your domain for email sending." 
              : `Verify ownership of ${createdDomain?.name || domainInput}`
          }
        </p>
      </div>

      {step === 'input' && (
        <Card className="bg-surface-dark border-surface-border">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <Label htmlFor="domain" className="text-white text-base">Domain Name</Label>
                <Input 
                  id="domain" 
                  placeholder="example.com" 
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="bg-background-dark border-surface-border text-white text-lg h-12 placeholder:text-neutral-500"
                  autoFocus
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-white text-base">Configuration Mode</Label>
                <RadioGroup 
                    value={dnsMode} 
                    onValueChange={(val: any) => setDnsMode(val)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className={cn(
                        "relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200",
                        dnsMode === 'manual' 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "border-surface-border bg-background-dark/50 hover:border-surface-hover"
                    )} onClick={() => setDnsMode('manual')}>
                        <div className="flex items-center gap-3 mb-2">
                            <RadioGroupItem value="manual" id="manual" className="sr-only" />
                            <div className={cn(
                                "p-2 rounded-lg",
                                dnsMode === 'manual' ? "bg-primary/20 text-primary" : "bg-neutral-800 text-neutral-400"
                            )}>
                                <Shield size={20} />
                            </div>
                            <span className="font-semibold text-white">Manual Setup</span>
                        </div>
                        <p className="text-sm text-text-secondary pl-1">
                            Manually add DNS records to your provider. Recommended if you don't use Cloudflare.
                        </p>
                    </div>

                    <div className={cn(
                        "relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200",
                        dnsMode === 'cloudflare-managed' 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "border-surface-border bg-background-dark/50 hover:border-surface-hover",
                        !hasCloudflare && "opacity-60 grayscale cursor-not-allowed"
                    )} onClick={() => hasCloudflare && setDnsMode('cloudflare-managed')}>
                        <div className="flex items-center gap-3 mb-2">
                            <RadioGroupItem value="cloudflare-managed" id="cloudflare-managed" disabled={!hasCloudflare} className="sr-only" />
                            <div className={cn(
                                "p-2 rounded-lg",
                                dnsMode === 'cloudflare-managed' ? "bg-primary/20 text-primary" : "bg-neutral-800 text-neutral-400"
                            )}>
                                <Zap size={20} />
                            </div>
                            <span className="font-semibold text-white">Cloudflare Managed</span>
                            {dnsMode === 'cloudflare-managed' && (
                                <span className="ml-auto text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    FASTEST
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary pl-1">
                            Automatically provision DNS records via your Cloudflare account. Zero configuration.
                        </p>
                        {!hasCloudflare && (
                            <div className="mt-2 text-[10px] text-amber-500 flex items-center gap-1">
                                <Info size={12} />
                                Cloudflare API not configured in settings
                            </div>
                        )}
                    </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className='pt-5'>
              <Button type="submit" size="lg" className="w-full cursor-pointer h-12 text-lg font-bold" disabled={!domainInput || isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Continue to Verification'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === 'verification' && createdDomain && (
        <Card className="bg-surface-dark border-surface-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                {dnsMode === 'cloudflare-managed' ? <Zap className="text-primary" /> : <Shield className="text-primary" />}
                {dnsMode === 'cloudflare-managed' ? 'Update Nameservers' : 'DNS Configuration Required'}
            </CardTitle>
            <CardDescription className="text-text-secondary">
                {dnsMode === 'cloudflare-managed' 
                    ? "Point your domain to Cloudflare to manage DNS. Update the nameservers at your domain registrar." 
                    : "Please add the following records to your DNS provider to complete setup."
                }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {dnsMode === 'cloudflare-managed' ? (
                  <div className="space-y-6">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-blue-400 text-sm">
                          <Info size={18} className="shrink-0 mt-0.5" />
                          <p>Update your domain's nameservers at your registrar to point to Cloudflare.</p>
                      </div>
                      
                      {createdDomain.cloudflare?.nameservers && createdDomain.cloudflare.nameservers.length > 0 ? (
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <Label className="text-white text-sm font-semibold">Cloudflare Nameservers</Label>
                                  <p className="text-xs text-text-secondary">
                                      Log in to your domain registrar and replace your current nameservers with these:
                                  </p>
                              </div>
                              <div className="space-y-2">
                                  {createdDomain.cloudflare.nameservers.map((ns: string, index: number) => (
                                      <div key={index} className="space-y-1 p-4 bg-background-dark rounded-xl border border-surface-border">
                                          <div className="flex justify-between items-center">
                                              <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">NS {index + 1}</span>
                                          </div>
                                          <div className="relative group">
                                              <div className="font-mono text-sm text-white break-all pr-10">
                                                  {ns}
                                              </div>
                                              <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="absolute right-0 top-0 h-8 w-8 p-0 text-text-secondary hover:text-white"
                                                  onClick={() => {
                                                      navigator.clipboard.writeText(ns);
                                                      toast.success('Copied to clipboard');
                                                  }}
                                              >
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                              </Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                                  <strong>Note:</strong> DNS propagation can take up to 24-48 hours. Once Cloudflare detects the nameserver change, your domain will become active.
                              </div>
                          </div>
                      ) : (
                          <div className="text-center py-8 text-text-secondary">
                              No nameservers available. Please try again.
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-500 text-sm">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <p>You must add these records for your domain to work with INVERX.</p>
                    </div>

                    {createdDomain.dnsRecords ? (
                        <div className="space-y-4">
                            {/* Simple render of grouped records from backend */}
                            {Object.entries(createdDomain.dnsRecords).map(([key, record]: [string, any]) => {
                                if (key === 'dkim' && Array.isArray(record)) {
                                    return record.map((dkim, i) => (
                                        <DnsRecordCard key={`dkim-${i}`} type={dkim.type} host={dkim.name} value={dkim.value} purpose="DKIM" />
                                    ));
                                }
                                if (record && record.type) {
                                  return <DnsRecordCard key={key} type={record.type} host={record.name} value={record.value} purpose={key.toUpperCase()} />;
                                }
                                return null;
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-text-secondary">
                            No DNS records found for this domain.
                        </div>
                    )}
                  </div>
              )}
          </CardContent>
          <CardFooter className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-surface-border text-white hover:bg-surface-hover h-11" 
                onClick={handleSkipToView}
              >
                Configure Later
              </Button>
              <Button className="flex-1 h-11 font-semibold" onClick={handleVerify} disabled={isVerifying}>
                  {isVerifying ? (
                      <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Verifying...
                      </>
                  ) : (
                      "Verify DNS"
                  )}
              </Button>
          </CardFooter>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-4">
        <Info className="text-blue-400 shrink-0 mt-1" size={18} />
        <div className="space-y-1">
            <h5 className="text-white text-sm font-semibold">How verification works</h5>
            <p className="text-xs text-text-secondary leading-relaxed">
                Verification ensures you own the domain. <strong>Manual Setup</strong> requires you to log into your DNS provider and add the records. 
                <strong>Cloudflare Managed</strong> automates this using your Cloudflare configuration.
            </p>
        </div>
      </div>
    </div>
  );
}

function DnsRecordCard({ type, host, value, purpose }: any) {
    return (
        <div className="space-y-2 p-4 bg-background-dark rounded-xl border border-surface-border">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">{type}</span>
                    <span className="text-white text-xs font-mono">{host}</span>
                </div>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">{purpose}</span>
            </div>
            <div className="relative group">
                <div className="font-mono text-[11px] text-white bg-black/40 p-3 rounded-lg border border-surface-border/50 break-all pr-10">
                    {value}
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1 h-8 w-8 p-0 text-text-secondary hover:text-white"
                    onClick={() => {
                        navigator.clipboard.writeText(value);
                        toast.success('Copied to clipboard');
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </Button>
            </div>
        </div>
    );
}
