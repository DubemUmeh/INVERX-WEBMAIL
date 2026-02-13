"use client";

import {
  Mail,
  Bell,
  AlertTriangle,
  FileDigit,
  AtSign,
  Send,
  BarChart,
  CheckCircle,
  User,
  Edit,
  PlusCircle,
  StickyNote,
  Settings,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Activity,
  LogOut,
  Globe,
  ActivityIcon,
} from "lucide-react";
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
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

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
        {/* Skeleton Navigation */}
        <div className="w-full border-b border-[#ededed] dark:border-neutral-800 bg-muted dark:bg-background-dark sticky top-0 z-50">
          <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
        </div>
        {/* Skeleton Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 space-y-8">
          {/* Skeleton Header */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-40" />
          </div>
          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl p-6 border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="size-6 rounded" />
                </div>
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          {/* Skeleton Activity & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Skeleton className="h-6 w-36" />
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <Skeleton className="size-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
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
      {/* <!-- Top Navigation --> */}
      <div className="w-full border-b border-[#ededed] dark:border-neutral-800 bg-muted dark:bg-background-dark sticky top-0 z-50">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-primary dark:text-white">
            <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
              <Mail size={20} />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              Inverx
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="flex items-center justify-center size-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
              <Bell className="text-neutral-600 dark:text-neutral-400" size={20} />
              {/* Conditional badge could go here */}
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity border border-neutral-200 dark:border-neutral-800">
                  <AvatarImage src={profile?.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/20 text-white text-xs">
                    {userDisplayName.split(' ').map(n => n[0]).join('')}
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
      {/* <!-- Main Content --> */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 space-y-8">
        {/* <!-- Header Section --> */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-medium text-primary dark:text-white tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userDisplayName.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
              <Link href="/status" className="text-neutral-500 hover:text-primary dark:hover:text-white text-base font-medium transition-colors">
                All systems operational.
              </Link>
            </div>
          </div>
          <div className="text-sm text-neutral-400 font-medium">
            Last updated: {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM d yyyy') : format(new Date(), 'MMM d yyyy')}
          </div>
        </div>

        {/* <!-- Alert Banner --> */}
        {unverifiedDomain && (
          <div className="w-full bg-primary/10 dark:bg-neutral-800 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-primary/20">
            <div className="flex items-start md:items-center gap-4">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-primary dark:text-white font-bold text-lg leading-tight">
                  Action Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base">
                  Verify domain '{unverifiedDomain.name}' to ensure delivery.
                </p>
              </div>
            </div>
            <Button asChild className="w-full md:w-auto px-6">
              <Link href={`/domains/${unverifiedDomain.name}`}>
                Verify Now
              </Link>
            </Button>
          </div>
        )}

        {/* <!-- Stats Grid --> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-3 rounded-xl p-6 border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">
                Domains
              </p>
              <Globe className="text-neutral-400" size={24} />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-primary dark:text-white text-3xl font-bold tracking-tight">
                {verifiedDomainsCount}
                <span className="text-neutral-400 text-xl font-medium">/{domains.length}</span>
              </p>
            </div>
            <p className="text-sm font-medium text-neutral-500">
              Verified / Total
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl p-6 border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">
                Addresses
              </p>
              <AtSign className="text-neutral-400" size={24} />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-primary dark:text-white text-3xl font-bold tracking-tight">
                {addressCount}
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
              <CheckCircle size={16} />
              <span>Active</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl p-6 border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">
                Messages Sent
              </p>
              <Send className="text-neutral-400" size={24} />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-primary dark:text-white text-3xl font-bold tracking-tight">
                0
              </p>
            </div>
            <p className="text-sm font-medium text-neutral-500">This month</p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl p-6 border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">
                Delivery Health
              </p>
              <BarChart className="text-neutral-400" size={24} />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-primary dark:text-white text-3xl font-bold tracking-tight">
                100%
              </p>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 mt-1">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* <!-- Split Layout: Feed & Actions --> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* <!-- Left: Recent Activity (2/3 width on large screens) --> */}
          <div className="lg:col-span-2">
            <ActivityFeed logs={recentLogs} />
          </div>

          {/* <!-- Right: Quick Actions (1/3 width on large screens) --> */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-primary dark:text-white">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <Link href="/mails/compose" className="group flex items-center justify-between w-full p-4 rounded-lg bg-primary/20 hover:bg-primary/50 text-white shadow-lg transition-all transform active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <Edit size={24} />
                  <span className="font-bold">Send New Message</span>
                </div>
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </Link>
              <Link href="/domains" className="group flex items-center justify-between w-full p-4 rounded-lg border border-[#dbdbdb] dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-primary dark:text-white transition-all">
                <div className="flex items-center gap-3">
                  <PlusCircle className="text-neutral-500" size={24} />
                  <span className="font-bold">Add Domain</span>
                </div>
                <ChevronRight
                  className="text-neutral-400 group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </Link>
              <Link href="/settings" className="group flex items-center justify-between w-full p-4 rounded-lg border border-[#dbdbdb] dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-primary dark:text-white transition-all">
                <div className="flex items-center gap-3">
                  <Settings className="text-neutral-500" size={24} />
                  <span className="font-bold">Configuration</span>
                </div>
                <ChevronRight
                  className="text-neutral-400 group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </Link>
              <Link href="/activity" className="group flex items-center justify-between w-full p-4 rounded-lg border border-[#dbdbdb] dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-primary dark:text-white transition-all">
                <div className="flex items-center gap-3">
                  <BarChart className="text-neutral-500" size={24} />
                  <span className="font-bold">Activity</span>
                </div>
                <ChevronRight
                  className="text-neutral-400 group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </Link>
              <Link href="/status" className="group flex items-center justify-between w-full p-4 rounded-lg border border-[#dbdbdb] dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-primary dark:text-white transition-all">
                <div className="flex items-center gap-3">
                  <Activity className="text-neutral-500" size={24} />
                  <span className="font-bold">System Status</span>
                </div>
                <ChevronRight
                  className="text-neutral-400 group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </Link>
            </div>
            {/* <!-- Mini promo/helper card --> */}
            <div className="mt-4 p-5 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700">
              <p className="text-sm text-neutral-500 mb-3">
                Need help setting up DKIM?
              </p>
              <a
                className="text-primary dark:text-white text-sm font-bold underline decoration-neutral-300 underline-offset-4 hover:decoration-primary transition-all"
                href="https://docs.inverx.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}

// Add necessary UI components
function Button({ children, className, asChild, ...props }: any) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
