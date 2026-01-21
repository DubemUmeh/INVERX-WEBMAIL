
"use client";

import React, { useState } from 'react';
import ActivitySidebar from '@/components/activity-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2, Eye, Menu } from 'lucide-react';

export default function ApiKeysPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background dark:bg-background-dark font-display text-white overflow-hidden h-screen flex">
      <div className="hidden lg:block h-full shrink-0">
        <ActivitySidebar />
      </div>
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative px-4 lg:px-10">
        <header className="shrink-0 border-b border-border-dark bg-background-dark z-10 px-6 py-5">
            <div className="flex items-center justify-between">
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
                  <h2 className="text-white text-2xl font-bold tracking-tight mb-1">API Keys</h2>
                  <p className="text-text-secondary text-sm">Manage programmatic access to the Inverx API.</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-primary hover:bg-accent-foreground cursor-pointer text-accent px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
                <Plus size={18} />
                Create New Key
              </button>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 gap-4">
              {/* API Key Card */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex items-center justify-between group hover:border-text-secondary/30 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold">Production Backend</h3>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">Active</span>
                    </div>
                    <p className="text-text-secondary text-sm font-mono mt-1">inv_live_....................482a</p>
                    <p className="text-text-secondary/60 text-xs mt-1">Created on Oct 12, 2023 • Last used 2m ago</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-text-secondary hover:text-white bg-background-dark border border-border-dark rounded-lg transition-colors">
                        <Copy size={18} />
                    </button>
                    <button className="p-2 text-text-secondary hover:text-white bg-background-dark border border-border-dark rounded-lg transition-colors">
                        <Eye size={18} />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent rounded-lg transition-colors">
                        <Trash2 size={18} />
                    </button>
                  </div>
              </div>

              {/* API Key Card 2 */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex items-center justify-between group hover:border-text-secondary/30 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold">Development Key</h3>
                        <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-wide">Test Mode</span>
                    </div>
                    <p className="text-text-secondary text-sm font-mono mt-1">inv_test_....................93x2</p>
                    <p className="text-text-secondary/60 text-xs mt-1">Created on Nov 05, 2023 • Last used 1d ago</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-text-secondary hover:text-white bg-background-dark border border-border-dark rounded-lg transition-colors">
                        <Copy size={18} />
                    </button>
                      <button className="p-2 text-text-secondary hover:text-white bg-background-dark border border-border-dark rounded-lg transition-colors">
                        <Eye size={18} />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent rounded-lg transition-colors">
                        <Trash2 size={18} />
                    </button>
                  </div>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
