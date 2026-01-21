
"use client";

import React, { useState } from 'react';
import ActivitySidebar from '@/components/activity-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, CheckCircle, AlertTriangle, Menu } from 'lucide-react';

export default function WebhooksPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex">
      <div className="hidden lg:block h-full shrink-0">
        <ActivitySidebar />
      </div>
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
        <header className="shrink-0 border-b border-border-dark bg-background-dark z-10 px-6 py-5">
            <div className="flex items-center justify-between lg:pl-10">
              <div className="flex items-center gap-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-white hover:bg-white/10 shrink-0">
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
                <div>
                  <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Webhooks</h2>
                  <p className="text-text-secondary text-sm">Manage event notifications and callback URLs.</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-accent px-2 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
                <Plus size={18} />
                Add Webhook
              </button>
            </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-border-dark">
              <thead className="bg-[#161616]">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Endpoint URL</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Events</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Delivery</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                  <tr className="hover:bg-background-dark/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white text-sm font-mono">https://api.mysite.com/hooks/email</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Delivered</span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Bounced</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-emerald-400 text-sm">Active</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        2 mins ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-text-secondary hover:text-white transition-colors">
                          <MoreVertical size={18} />
                        </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-background-dark/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white text-sm font-mono">https://staging.mysite.com/hooks</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">All Events</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-amber-500" />
                          <span className="text-amber-400 text-sm">Failing</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        1 hour ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-text-secondary hover:text-white transition-colors">
                          <MoreVertical size={18} />
                        </button>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
