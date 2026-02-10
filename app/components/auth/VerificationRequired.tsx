"use client";

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Forward, Mail, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VerificationRequiredProps {
  title?: string;
  description?: string;
  onResend?: () => void;
  isLoading?: boolean;
}

export function VerificationRequired({
  title = "Unverified Account",
  description = "Your email address is not verified. You must verify your email before you can access all features of INVERX.",
  onResend,
  isLoading = false,
}: VerificationRequiredProps) {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <Card className="w-full max-w-lg border-amber-500/20 bg-amber-500/5 backdrop-blur-sm overflow-hidden relative">
        {/* Abstract Background Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center relative z-10">
          <div className="mb-6 p-4 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 animate-pulse">
            <Mail size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-amber-500 mb-3 tracking-tight">
            {title}
          </h2>
          
          <p className="text-amber-500/80 text-sm max-w-sm mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <Button 
              asChild
              className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/20 py-6"
            >
              <Link href="/dashboard" className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs">
                <Forward size={16} className="rotate-180" />
                Back to Dashboard
              </Link>
            </Button>
            
            {onResend && (
              <Button 
                variant="outline"
                disabled={isLoading}
                onClick={onResend}
                className="w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-500 py-6"
              >
                <span className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs">
                  {isLoading ? (
                    <RefreshCcw size={16} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={16} />
                  )}
                  Resend Email
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex items-center gap-2 text-amber-500/40 text-[10px] font-bold uppercase tracking-[0.2em]">
        <AlertTriangle size={12} />
        <span>Restricted Access Mode</span>
      </div>
    </section>
  );
}
