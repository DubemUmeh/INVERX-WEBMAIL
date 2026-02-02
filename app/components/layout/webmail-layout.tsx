"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings,
  Search,
  HelpCircle,
  Bell, 
  ChevronDown,
  Menu,
  User,
  LogOut,
  Loader2
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { settingsApi, ProfileData } from "@/lib/api/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import SidebarContent from "../webmail-sidebar";

export default function WebmailLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await settingsApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile in webmail layout:", error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "http://localhost:1000/login";
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userDisplayName = profile?.fullName || session?.user?.name || "User";
  const userEmail = profile?.email || session?.user?.email || "";

  // Helper to determine if a link is active
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const getLinkClass = (href: string) => 
    isActive(href)
      ? "flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/15 text-white font-medium border border-white/5"
      : "flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors";

  return (
    <div className="flex h-screen w-full overflow-x-hidden bg-background font-sans text-background dark:text-white no-scrollbar">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] text-white shrink-0 flex-col justify-between py-4 px-2 h-full border-r border-transparent no-scrollbar">
        <SidebarContent setIsMobileMenuOpen={setIsMobileMenuOpen} getLinkClass={getLinkClass} />
      </aside>

      {/* Main Application Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121212]">
        {/* Global Header */}
        <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] z-20 shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5" suppressHydrationWarning>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-background no-scrollbar">
                <SheetTitle className="hidden">Navigation</SheetTitle>
                <div className="h-full p-4 overflow-y-auto">
                  <SidebarContent setIsMobileMenuOpen={setIsMobileMenuOpen} getLinkClass={getLinkClass} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-webmail-primary pointer-events-none transition-colors w-5 h-5" />
                <input
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-webmail-primary dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-webmail-primary/10 focus:bg-white dark:focus:bg-[#252525] transition-all"
                  placeholder="Search emails..."
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-6">
            <button aria-label="Help" className="hidden sm:flex w-9 h-9 items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button aria-label="Notifications" className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#121212]"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" suppressHydrationWarning>
                  <Avatar className="h-8 w-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={profile?.avatarUrl || ""} />
                    <AvatarFallback className="bg-background text-white text-[10px] rounded-none">
                      {userDisplayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden sm:block text-gray-400 w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{userDisplayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-800" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800">
                  <Link href="/settings/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-800" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 dark:focus:text-red-500"
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Child Content */}
        <div className="flex-1 overflow-hidden relative">
            {children}
        </div>
      </main>
    </div>
  );
}
