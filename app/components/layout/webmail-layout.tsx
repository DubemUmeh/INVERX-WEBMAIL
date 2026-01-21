"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, 
  PenSquare, 
  Inbox, 
  Star, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  Plus, 
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

export default function WebmailLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
        <div className="flex flex-col gap-6">
          {/* Branding */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 pt-2">
            <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
              <Mail className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none text-white">Inverx</h1>
              <p className="text-[10px] text-white/50 font-medium">Pro Workspace</p>
            </div>
          </Link>
          {/* Primary Action */}
          <Link href="/mail/compose"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-3 w-full bg-white text-webmail-primary hover:bg-gray-100 transition-all font-bold h-12 rounded-lg shadow-sm group">
            <PenSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Compose</span>
          </Link>
          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 mt-2">
            <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/15 text-white font-medium border border-white/5" href="/mail/inbox">
              <div className="flex items-center gap-3">
                <Inbox className="w-5 h-5" />
                <span className="text-sm">Inbox</span>
              </div>
              <span className="text-xs bg-white text-webmail-primary px-1.5 py-0.5 rounded font-bold min-w-[20px] text-center">12</span>
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors" href="/mail/starred">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">Starred</span>
              </div>
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors" href="/mail/sent">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5" />
                <span className="text-sm font-medium">Sent</span>
              </div>
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors" href="/mail/drafts">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Drafts</span>
              </div>
              <span className="text-xs text-white/40 font-medium">2</span>
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors" href="/mail/archive">
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5" />
                <span className="text-sm font-medium">Archive</span>
              </div>
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors" href="/mail/trash">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Trash</span>
              </div>
            </Link>
          </nav>
          {/* Custom Labels */}
          <div className="mt-2">
            <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Labels</h3>
              <Plus className="text-white/20 w-4 h-4 group-hover:text-white/60 transition-colors" />
            </div>
            <nav className="flex flex-col gap-0.5">
              <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
                <span className="w-2 h-2 rounded-full border-2 border-blue-400"></span>
                <span className="text-sm font-medium">Personal</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
                <span className="w-2 h-2 rounded-full border-2 border-purple-400"></span>
                <span className="text-sm font-medium">Work</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
                <span className="w-2 h-2 rounded-full border-2 border-green-400"></span>
                <span className="text-sm font-medium">Finance</span>
              </Link>
            </nav>
          </div>
        </div>
        {/* Sidebar Footer */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/settings" className="flex items-center gap-3 px-3 py-2 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-webmail-primary dark:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-webmail-primary text-white shrink-0 flex-col justify-between p-4 h-full border-r border-transparent">
        <SidebarContent />
      </aside>

      {/* Main Application Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121212]">
        {/* Global Header */}
        <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] z-20 shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
             {/* Mobile Menu Trigger */}
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-webmail-primary">
                   <SheetTitle className="hidden">Navigation</SheetTitle>
                   <div className="h-full p-4 overflow-y-auto">
                     <SidebarContent />
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
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Avatar className="h-8 w-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={profile?.avatarUrl || ""} />
                    <AvatarFallback className="bg-webmail-primary text-white text-[10px] rounded-none">
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
