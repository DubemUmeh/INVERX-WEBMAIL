"use client";

import React, { useState } from 'react';
import DomainsPage from "@/app/domains/page";
import ActivitySidebar from "@/components/activity-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

export default function ActivityDomainsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark text-white font-display">
      <div className="hidden lg:block shrink-0 h-full">
        <ActivitySidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 border-r-0 w-[280px] bg-surface-dark text-white">
            <SheetTitle className="hidden">Menu</SheetTitle>
            <div className="h-full" onClick={() => setIsOpen(false)}>
              <ActivitySidebar />
            </div>
          </SheetContent>
          <DomainsPage 
            headerPrefix={
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-white hover:bg-white/10 shrink-0">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
            } 
          />
        </Sheet>
      </main>
    </div>
  )
}