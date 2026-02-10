"use client";

import { useState, useEffect } from 'react';
import CloudflareDomainAdd from '@/components/domains/CloudflareDomainAdd';
import { AWSDomainAdd } from '@/components/domains/AWSDomainAdd';
import { Button } from '@/components/ui/button';
import { Settings, Globe } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';
import { domainsApi } from '@/lib/api';
import { VerificationRequired } from '@/components/auth/VerificationRequired';

type Provider = 'cloudflare' | 'aws';

export default function AddDomainPage() {
  const [provider, setProvider] = useState<Provider>('cloudflare');
  const [domains, setDomains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const isVerified = session?.user?.emailVerified;

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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col items-center justify-center p-4 relative">
        <div className='w-full max-w-2xl space-y-8 relative'>
          <div className='pt-6 px-4 space-y-8'>
            <Skeleton className='h-12 w-full' />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <div className='flex items-center justify-center '>
            <Skeleton className='h-12 w-32' />
          </div>
        </div>
      </section>
    );
  }

  if (!isVerified) {
    return <VerificationRequired />;
  }
  
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center">
        {provider === 'cloudflare' ? (
          <CloudflareDomainAdd />
        ) : (
          <AWSDomainAdd />
        )}

        <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
                <span>Domain Provider: </span>
                <span className="font-bold text-white uppercase tracking-wider">
                  {provider === 'cloudflare' ? 'Cloudflare Managed' : 'Manual / AWS'}
                </span>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setProvider(provider === 'cloudflare' ? 'aws' : 'cloudflare')}
                className="text-[10px] text-text-secondary hover:text-primary transition-colors flex items-center gap-1 uppercase font-bold tracking-widest opacity-50 hover:opacity-100"
            >
                {provider === 'cloudflare' ? (
                    <>
                        <Settings size={12} />
                        Switch to Manual / AWS
                    </>
                ) : (
                    <>
                        <Globe size={12} />
                        Switch to Cloudflare Managed
                    </>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}
