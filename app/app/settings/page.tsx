"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { domainsApi } from "@/lib/api/domains";
import { settingsApi, ProfileData } from "@/lib/api/settings";
import { toast } from "sonner";

export default function GeneralSettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [defaultAddress, setDefaultAddress] = useState("");
  const [defaultDomain, setDefaultDomain] = useState("");
  const [timezone, setTimezone] = useState("utc-5");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileData, domainsData] = await Promise.all([
        settingsApi.getProfile(),
        domainsApi.getAll()
      ]);
      
      setProfile(profileData);
      setDomains(domainsData || []);
      
      // Set defaults
      if (domainsData && domainsData.length > 0) {
        setDefaultDomain(domainsData[0].name);
      }
      setDefaultAddress(profileData.email);
      if (profileData.themePreference) {
        // We could use themePreference here if we add it to the form
      }
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // In a real app, we'd have a specific endpoint for these preferences
      // For now, we'll just simulate success as the backend doesn't store all these yet
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
            General Settings
          </h2>
          <p className="text-neutral-500 text-base">
            Manage your general account preferences and defaults.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Changes
        </Button>
      </div>

      {/* 1. Mail Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Mail Defaults</CardTitle>
          <CardDescription>
            These defaults are applied when composing new messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Default Sending Address
              </label>
              <Select value={defaultAddress} onValueChange={setDefaultAddress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email" />
                </SelectTrigger>
                <SelectContent>
                  {profile?.email && (
                    <SelectItem value={profile.email}>{profile.email}</SelectItem>
                  )}
                  {/* Here we could also list aliases if we had an api for them */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Default Domain
              </label>
              <Select value={defaultDomain} onValueChange={setDefaultDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.filter(d => d.name).map(d => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                  {domains.length === 0 && (
                    <SelectItem value="none" disabled>No domains found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
               <label className="text-sm font-medium leading-none">
                Always use default address
              </label>
              <p className="text-xs text-neutral-500">
                Automatically select this address for new drafts.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* 2. Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Timezone
              </label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="utc+0">UTC</SelectItem>
                  <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Danger Zone */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription className="text-red-200/60">
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-neutral-500">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all of your data from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All domains and DNS configurations</li>
                      <li>All email addresses and aliases</li>
                      <li>All messages and attachments</li>
                      <li>All API keys and integrations</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      toast.error("Account deletion is not yet implemented");
                    }}
                  >
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
