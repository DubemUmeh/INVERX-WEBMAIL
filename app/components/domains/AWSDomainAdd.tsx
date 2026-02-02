"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { domainsApi } from '@/lib/api';

export function AWSDomainAdd() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'verification'>('input');
  const [domainInput, setDomainInput] = useState('');
  const [createdDomain, setCreatedDomain] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput) return;

    setIsCreating(true);
    try {
      const data = await domainsApi.create({ name: domainInput });
      
      setCreatedDomain(data);
      setDnsRecords(data.dnsRecords);
      setStep('verification');
      toast.success('Domain created! Please add DNS records.');
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
    <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl space-y-8 relative">
      <Link 
          href="/domains" 
          className="absolute -top-12 left-0 text-text-secondary hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
      >
          <ArrowLeft size={16} />
          Back to Domains
      </Link>

      <div className="text-center space-y-2 mx-auto">
        <div className="mx-auto size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
          <Globe size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connect a Domain (AWS)</h1>
        <p className="text-text-secondary">
          {step === 'input'
              ? "Enter the domain you want to connect to INVERX via AWS SES."
              : `Verify ownership of ${createdDomain?.name || domainInput}`
          }
        </p>
      </div>
      {step === 'input' && (
        <Card className="bg-surface-dark border-surface-border">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-white">Domain Name</Label>
                <input
                  id="domain"
                  placeholder="example.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full bg-background-dark border-surface-border text-white placeholder:text-neutral-500 rounded-md p-2"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
            </CardContent>
            <CardFooter className='pt-5'>
              <Button type="submit" className="w-full cursor-pointer" disabled={!domainInput || isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      {step === 'verification' && dnsRecords && createdDomain && (
        <Card className="bg-surface-dark border-surface-border">
          <CardContent className="pt-6 space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-500 text-sm">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p>Add the following DNS records to your DNS provider to verify ownership.</p>
              </div>
              <div className="space-y-4">
                  {/* SPF Record */}
                  {dnsRecords.spf && (
                  <div className="space-y-2">
                      <Label className="text-white text-sm font-semibold">SPF Record</Label>
                      <div className="space-y-1">
                        <div className="text-xs text-text-secondary">Type: <span className="text-white font-mono">{dnsRecords.spf.type} {dnsRecords.spf.name}</span></div>
                        <div className="font-mono text-xs text-white bg-background-dark p-3 rounded border border-surface-border break-all">
                          {dnsRecords.spf.value}
                        </div>
                      </div>
                  </div>
                  )}
                  {/* Verification Record */}
                  {dnsRecords.verification && (
                  <div className="space-y-2">
                      <Label className="text-white text-sm font-semibold">Verification Record</Label>
                      <div className="space-y-1">
                        <div className="text-xs text-text-secondary">Type: <span className="text-white font-mono">{dnsRecords.verification.type} {dnsRecords.verification.name}</span></div>
                        <div className="font-mono text-xs text-white bg-background-dark p-3 rounded border border-surface-border break-all">
                          {dnsRecords.verification.value}
                        </div>
                      </div>
                  </div>
                  )}
                  {/* DKIM Records */}
                  {dnsRecords.dkim && dnsRecords.dkim.map((record: any, index: number) => (
                  <div key={index} className="space-y-2">
                      <Label className="text-white text-sm font-semibold">DKIM Record {index + 1}</Label>
                      <div className="space-y-1">
                        <div className="text-xs text-text-secondary">Type: <span className="text-white font-mono">{record.type} {record.name}</span></div>
                        <div className="font-mono text-xs text-white bg-background-dark p-3 rounded border border-surface-border break-all">
                          {record.value}
                        </div>
                      </div>
                  </div>
                  ))}
              </div>
          </CardContent>
          <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-surface-border text-white hover:bg-surface-hover cursor-pointer"
                onClick={handleSkipToView}
              >
                View Domain
              </Button>
              <Button className="flex-1 cursor-pointer" onClick={handleVerify} disabled={isVerifying}>
                  {isVerifying ? (
                      <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Verifying...
                      </>
                  ) : (
                      "Verify Now"
                  )}
              </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
