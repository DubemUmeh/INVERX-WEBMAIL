"use client";

import React, { useEffect, useState } from "react";
import { Camera, LogOut, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsApi, ProfileData } from "@/lib/api/settings";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getProfile();
      setProfile(data);
      setFullName(data.fullName || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      const updated = await settingsApi.updateProfile({ fullName });
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = `${process.env.AUTH_APP_ORIGIN}login/`;
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 mb-8">
           <Skeleton className="h-8 w-64" />
           <Skeleton className="h-4 w-96" />
        </div>
        
        <Skeleton className="h-[400px] w-full rounded-xl" />
        
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
          Profile Settings
        </h2>
        <p className="text-neutral-500 text-base">
          Manage your personal identity and account information.
        </p>
      </div>

      {/* 1. Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information is used across your INVERX account and outgoing messages.
            </CardDescription>
          </div>
          <Button 
            onClick={handleUpdateProfile} 
            disabled={isSaving || fullName === (profile?.fullName || "")}
            className="bg-primary text-primary-foreground"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <Avatar className="h-20 w-20 border border-neutral-200 dark:border-neutral-800">
                <AvatarImage src={profile?.avatarUrl || "https://github.com/shadcn.png"} alt={profile?.fullName || "User"} />
                <AvatarFallback>{profile?.fullName?.split(' ').map(n => n[0]).join('') || 'UN'}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white h-6 w-6" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
               <h4 className="text-sm font-medium">Profile Photo</h4>
               <p className="text-xs text-neutral-500">Click to upload a new avatar. JPG, GIF or PNG.</p>
               <Button variant="outline" size="sm" className="w-fit mt-2">Upload New</Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Full Name
              </label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Your full name" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Primary Email
              </label>
              <Input value={profile?.email || ""} readOnly className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Account Name
              </label>
              <Input defaultValue={profile?.fullName?.split(' ')[0] + "'s Personal"} readOnly className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Account ID
              </label>
              <div className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 p-2.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                {profile?.id || "N/A"}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium">Account Plan</span>
              <p className="text-xs text-neutral-500">Current subscription tier</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Pro Plan
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 3. Sign Out */}
      <Card className="border-red-200 dark:border-red-900 overflow-hidden">
        <CardContent className="p-6">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</span>
                <p className="text-xs text-neutral-500">
                  Sign out of your account on this device.
                </p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
