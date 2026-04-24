"use client";

import { Bell, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsApi, ProfileData } from "@/lib/api/settings";
import { domainsApi } from "@/lib/api/domains";
import { auditLogsApi } from "@/lib/api/audit-logs";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardStatistics } from "@/components/dashboard/dashboard-statistics";
import { DashboardActivityPanel } from "@/components/dashboard/dashboard-activity-panel";

export default function Page() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [profileData, domainsData, logsData] = await Promise.all([
        settingsApi.getProfile(),
        domainsApi.getAll(),
        auditLogsApi.getAll({ limit: 5 }),
      ]);

      setProfile(profileData);
      setDomains(domainsData || []);
      setRecentLogs(logsData || []);

      // Fetch address counts for all domains
      if (domainsData && domainsData.length > 0) {
        const addressPromises = domainsData.map((d: any) => domainsApi.getAddresses(d.id));
        const addressGroups = await Promise.all(addressPromises);
        const totalAddresses = addressGroups.reduce((acc, curr) => acc + (curr?.length || 0), 0);
        setAddressCount(totalAddresses);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
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
    }
  };

  // For Cloudflare-managed domains: check domain.status === 'active' (DNS is ready)
  // For AWS/manual domains: check domain.ses?.verificationStatus === 'verified' (SES email is ready)
  const verifiedDomainsCount = domains.filter(d => 
    d.status === 'active' || 
    d.cloudflare?.status === 'active' || 
    d.ses?.verificationStatus === 'verified'
  ).length;
  
  const unverifiedDomain = domains.find(d => 
    d.status !== 'active' && 
    d.cloudflare?.status !== 'active' && 
    d.ses?.verificationStatus !== 'verified'
  );

  if (isLoading && !profile) {
    return (
      <section className="bg-background dark:bg-background-dark text-primary dark:text-white min-h-screen flex flex-col">
        <div className="bg-card sticky top-0 z-50 border-b border-[#dbdbdb] dark:border-neutral-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
              <div className="mt-3 h-10 w-72 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-5 h-12 w-28" />
                <Skeleton className="mt-4 h-4 w-20" />
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
              <Skeleton className="h-5 w-36" />
              <div className="mt-6 space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <Skeleton key={index} className="h-16 rounded-3xl" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
                <Skeleton className="h-5 w-32" />
                <div className="mt-5 space-y-3">
                  {[1, 2, 3].map((index) => (
                    <Skeleton key={index} className="h-14 rounded-3xl" />
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-dashed border-[#dbdbdb] dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-6 shadow-sm">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-4 h-10 rounded-3xl" />
              </div>
            </div>
          </div>
        </main>
      </section>
    );
  }

  const userDisplayName = profile?.fullName || session?.user?.name || "User";
  const userEmail = profile?.email || session?.user?.email || "";

  return (
    <section className="bg-background dark:bg-background-dark text-primary dark:text-white min-h-screen flex flex-col">
      <div className="bg-card sticky top-0 z-50 border-b border-[#dbdbdb] dark:border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              {/* <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p> */}
              <h1 className="text-3xl font-semibold tracking-tight text-primary dark:text-white">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userDisplayName.split(' ')[0]}
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your Inverx workspace overview and activity at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dbdbdb] bg-background text-neutral-600 transition hover:border-neutral-300 hover:bg-muted dark:border-neutral-800 dark:bg-background-dark dark:text-neutral-300 dark:hover:bg-neutral-900">
              <Bell size={20} />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer border border-[#dbdbdb] dark:border-neutral-800">
                  <AvatarImage src={profile?.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/20 text-white text-xs">
                    {userDisplayName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userDisplayName}</p>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 dark:focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be redirected to the login page and will need to sign in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Log out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 space-y-6">
        <DashboardStatistics
          verifiedDomainsCount={verifiedDomainsCount}
          totalDomains={domains.length}
          addressCount={addressCount}
          messagesSent={0}
          deliveryHealth={100}
          unverifiedDomain={unverifiedDomain}
        />
        <DashboardActivityPanel logs={recentLogs} />
      </main>
    </section>
  );
}

