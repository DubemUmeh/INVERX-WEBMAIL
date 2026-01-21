"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ActivitySidebar from "@/components/activity-sidebar";
import { cn } from "@/lib/utils";

export default function ActivityShell({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <ActivitySidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Mobile Header (Visible only on lg and below) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-surface-border bg-background-dark shrink-0 z-20">
            <div className="flex items-center gap-3">
                 <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2 text-white hover:bg-white/10">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 w-[280px] bg-surface-dark text-white">
                        <SheetTitle className="hidden">Menu</SheetTitle>
                        <div className="h-full" onClick={() => setIsOpen(false)}>
                            <ActivitySidebar />
                        </div>
                    </SheetContent>
                </Sheet>
                <span className="font-bold text-lg">Inverx</span>
            </div>
        </div>
        
        {/* Page Content */}
        <main className={cn("flex-1 overflow-y-auto", className)}>
            {children}
        </main>
      </div>
    </div>
  );
}
