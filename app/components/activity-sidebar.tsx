'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  List,
  Globe,
  Key,
  Server,
  Shield,
  Layout,
  LogOut,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/ui/sidebar';
import { useSession, signOut } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { settingsApi, ProfileData } from '@/lib/api/settings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function ActivitySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await settingsApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile in sidebar:", error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.replace(`${process.env.NEXT_PUBLIC_WEB_ORIGIN}/login`);
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => pathname === path;
  const userDisplayName = profile?.fullName || session?.user?.name || "User";

  return (
    <Sidebar className="bg-surface-dark border-r border-border-dark z-20">
      <Link href="/dashboard" className="p-5 flex flex-col gap-1">
        <h1 className="text-white text-lg font-bold leading-normal tracking-tight">Inverx</h1>
        <p className="text-text-secondary text-xs font-normal uppercase tracking-wider">Infrastructure</p>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/activity') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/activity"
        >
          <BarChart2 size={20} className={cn("transition-colors", isActive('/activity') ? "text-primary" : "group-hover:text-white")} />
          <span className="text-sm font-medium">Overview</span>
        </Link>
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/activity/domains') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/activity/domains"
        >
          <Layout size={20} className={cn("transition-colors", isActive('/activity/domains') ? "text-primary" : "group-hover:text-white")} />
          <span className="text-sm font-medium">Domains</span>
        </Link>
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/activity/logs') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/activity/logs"
        >
          <List size={20} className={cn("transition-colors", isActive('/activity/logs') ? "text-primary" : "group-hover:text-white")} />
          <span className="text-sm font-medium">Logs</span>
        </Link>
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/activity/webhooks') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/activity/webhooks"
        >
          <Globe size={20} className={cn("transition-colors", isActive('/activity/webhooks') ? "text-primary" : "group-hover:text-white")} />
          <span className="text-sm font-medium">Webhooks</span>
        </Link>
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/activity/api-keys') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/activity/api-keys"
        >
          <Key size={20} className={cn("transition-colors", isActive('/activity/api-keys') ? "text-primary" : "group-hover:text-white")} />
          <span className="text-sm font-medium">API Keys</span>
        </Link>
        <div className="mt-4 mb-2 px-3">
          <p className="text-text-secondary/60 text-xs font-semibold uppercase tracking-wider">Settings</p>
        </div>
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/smtp') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/smtp"
        >
          <Server size={20} className="group-hover:text-white transition-colors" />
          <span className="text-sm font-medium">SMTP Config</span>
        </Link>
        <Link 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
            isActive('/access-control') 
              ? "bg-primary/20 text-white border-l-2 border-primary" 
              : "text-text-secondary hover:bg-border-dark hover:text-white"
          )}
          href="/access-control"
        >
          <Shield size={20} className="group-hover:text-white transition-colors" />
          <span className="text-sm font-medium">Access Control</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-border-dark space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border-dark">
            <AvatarImage src={profile?.avatarUrl || ""} />
            <AvatarFallback className="bg-primary text-white text-[10px]">
              {userDisplayName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{userDisplayName}</span>
            <span className="text-xs text-text-secondary">Admin</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors group"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
          )}
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </Sidebar>
  );
}
