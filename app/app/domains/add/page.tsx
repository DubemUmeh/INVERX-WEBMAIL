"use client";

import { useState } from 'react';
import CloudflareDomainAdd from '@/components/domains/CloudflareDomainAdd';
import { AWSDomainAdd } from '@/components/domains/AWSDomainAdd';
import { Button } from '@/components/ui/button';
import { Settings, Globe } from 'lucide-react';

type Provider = 'cloudflare' | 'aws';

export default function AddDomainPage() {
  const [provider, setProvider] = useState<Provider>('cloudflare');

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
