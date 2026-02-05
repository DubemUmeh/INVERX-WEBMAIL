"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Lock, 
  AtSign, 
  Inbox, 
  Bell, 
  CreditCard,
  Monitor,
  Menu,
  ArrowLeft,
  Settings,
  Send,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/settings/profile", label: "Profile", icon: User },
    { href: "/settings", label: "General", icon: Settings },
    { href: "/settings/security", label: "Security", icon: Lock },
    { href: "/settings/api-keys", label: "API Keys", icon: Key },
    { href: "/settings/domains", label: "Domains", icon: Monitor },
    { href: "/settings/aliases", label: "Aliases", icon: AtSign },
    { href: "/settings/rules", label: "Inbox Rules", icon: Inbox },
    { href: "/settings/notifications", label: "Notifications", icon: Bell },
    { href: "/settings/billing", label: "Billing", icon: CreditCard },
    { href: "/settings/brevo", label: "Brevo", icon: Send },
  ];

  const NavContent = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 h-10 px-3 font-medium ${
                isActive 
                  ? "bg-white dark:bg-white/10 text-foreground shadow-sm border border-gray-100 dark:border-gray-800" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          </Link>
        );
      })}

      <Link href='/dashboard' className="w-full justify-start gap-3 h-10 px-3 font-medium -ml-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 px-3 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Button>
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage preferences</p>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="hidden">Navigation</SheetTitle>
              <div className="py-6">
                 <div className="space-y-1 mb-6 px-1">
                   <h2 className="text-xl font-bold tracking-tight text-foreground">Settings</h2>
                   <p className="text-muted-foreground text-sm">Manage your preferences</p>
                 </div>
                 <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 space-y-6">
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your preferences</p>
              </div>
              <NavContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
