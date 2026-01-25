"use client";

import React, { useEffect, useState } from "react";
import { 
  Laptop, 
  Smartphone, 
  Monitor, 
  LogOut, 
  Smartphone as PhoneIcon,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsApi, SecurityStatus } from "@/lib/api/settings";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SecuritySettingsPage() {
  const [security, setSecurity] = useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchSecurity();
  }, []);

  const fetchSecurity = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getSecurity();
      setSecurity(data);
    } catch (error) {
      console.error("Failed to fetch security info:", error);
      toast.error("Failed to load security information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both current and new passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    try {
      setIsSavingPassword(true);
      await settingsApi.updateSecurity({ currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to update password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 mb-8">
           <Skeleton className="h-8 w-64" />
           <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Password Skeleton */}
        <Skeleton className="h-[250px] w-full rounded-xl" />

        {/* 2FA Skeleton */}
        <Skeleton className="h-[120px] w-full rounded-xl mt-6" />

        {/* Recent Activity Skeleton */}
         <Skeleton className="h-[300px] w-full rounded-xl mt-6" />
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">Security Settings</h2>
        <p className="text-neutral-500 text-base">Manage your password, 2FA, and connected devices to keep your account safely.</p>
      </div>

      {/* Password Section */}
      <section className="bg-white dark:bg-[#121212] rounded-xl border border-[#ededed] dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#ededed] dark:border-gray-800">
          <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Password & Authentication</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <label className="flex flex-col gap-2">
              <span className="text-[#141414] dark:text-gray-300 text-sm font-medium">Current Password</span>
              <Input
                className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 focus:ring-webmail-primary"
                placeholder="••••••••••••"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <div className="grid gap-6">
              <label className="flex flex-col gap-2">
                <span className="text-[#141414] dark:text-gray-300 text-sm font-medium">New Password</span>
                <Input
                  className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 focus:ring-webmail-primary"
                  placeholder="Enter new password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[#141414] dark:text-gray-300 text-sm font-medium">Confirm New Password</span>
                <Input
                  className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 focus:ring-webmail-primary"
                  placeholder="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-neutral-500 hidden sm:block">
              {security?.lastLoginAt ? `Last active ${formatDistanceToNow(new Date(security.lastLoginAt))} ago` : "Last activity unknown"}
            </p>
            <Button 
              onClick={handleUpdatePassword} 
              disabled={isSavingPassword || !currentPassword || !newPassword}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-200"
            >
              {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </div>
        </div>
      </section>

      {/* Two-Factor Auth Section */}
      <section className="bg-white dark:bg-[#121212] rounded-xl border border-[#ededed] dark:border-gray-800 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-[#ededed] dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Two-Factor Authentication</h3>
          {security?.twoFactorEnabled ? (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1" /> Enabled
            </span>
          ) : (
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-800 flex items-center">
              <ShieldAlert className="w-3 h-3 mr-1" /> Not Enabled
            </span>
          )}
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="shrink-0 size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <PhoneIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[#141414] dark:text-white font-medium mb-1">Authenticator App</h4>
              <p className="text-neutral-500 text-sm max-w-md">Secure your account with TOTP (Time-based One-Time Password) using apps like Google Authenticator or Authy.</p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0">Configure</Button>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="bg-white dark:bg-[#121212] rounded-xl border border-[#ededed] dark:border-gray-800 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-[#ededed] dark:border-gray-800">
          <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {security?.recentActivity && security.recentActivity.length > 0 ? (
            security.recentActivity.map((activity, idx) => (
              <div key={idx} className="p-6 flex items-start gap-4">
                <div className="shrink-0 text-gray-400">
                  {activity.action.toLowerCase().includes('mobile') || activity.action.toLowerCase().includes('app') ? <Smartphone className="w-7 h-7" /> : <Laptop className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[#141414] dark:text-white text-sm font-bold uppercase tracking-wide">{activity.action.replace(/_/g, ' ')}</h4>
                    {idx === 0 && <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wide">Current session</span>}
                  </div>
                  <p className="text-neutral-500 text-xs">
                    {activity.ipAddress || 'Unknown IP'} • {formatDistanceToNow(new Date(activity.createdAt))} ago
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-neutral-500 text-sm">No recent activity detected.</div>
          )}
        </div>
      </section>

      {/* Active API Keys Section */}
      <section className="bg-white dark:bg-[#121212] rounded-xl border border-[#ededed] dark:border-gray-800 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-[#ededed] dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Developer Tools</h3>
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="shrink-0 size-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 border">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[#141414] dark:text-white font-medium mb-1">Active API Keys</h4>
              <p className="text-neutral-500 text-sm max-w-md">You currently have {security?.activeApiKeys || 0} active API keys for your applications.</p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0">Manage API Keys</Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white dark:bg-[#121212] rounded-xl border border-red-200 shadow-sm overflow-hidden mt-10">
        <div className="px-6 py-5 border-b border-red-100 bg-red-50/30 dark:bg-red-900/10">
          <h3 className="text-red-700 dark:text-red-400 text-lg font-bold leading-tight">Danger Zone</h3>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h4 className="text-[#141414] dark:text-white font-medium mb-1">Delete Account</h4>
            <p className="text-neutral-500 text-sm max-w-lg">Once you delete your account, there is no going back. Please be certain. All your emails and aliases will be permanently removed.</p>
          </div>
          <Button variant="destructive" className="shrink-0 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
            Delete Account
          </Button>
        </div>
      </section>
    </>
  );
}
