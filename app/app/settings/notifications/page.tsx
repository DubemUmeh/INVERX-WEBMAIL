"use client";

import React, { useEffect, useState } from "react";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Globe, 
  Mail, 
  Shield,
  User,
  Key
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { auditLogsApi } from "@/lib/api/audit-logs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  createdAt: string;
}

function getActionIcon(action: string, resourceType: string) {
  if (resourceType === 'domain') return <Globe className="h-4 w-4" />;
  if (resourceType === 'address' || resourceType === 'email') return <Mail className="h-4 w-4" />;
  if (resourceType === 'user') return <User className="h-4 w-4" />;
  if (resourceType === 'api_key') return <Key className="h-4 w-4" />;
  if (action.includes('security') || action.includes('password')) return <Shield className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

function getActionColor(action: string) {
  if (action.includes('create') || action.includes('add') || action.includes('verify')) {
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  }
  if (action.includes('delete') || action.includes('remove')) {
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
  if (action.includes('update') || action.includes('change')) {
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
  if (action.includes('fail') || action.includes('error')) {
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  }
  return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await auditLogsApi.getAll({ limit: 20 });
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
          Notifications
        </h2>
        <p className="text-neutral-500 text-base">
          View recent activity and events on your account.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No notifications yet</h3>
          <p className="text-neutral-500 max-w-sm mt-1">Account activity will appear here as it happens.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${getActionColor(notification.action)}`}>
                {getActionIcon(notification.action, notification.resourceType)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                  {formatAction(notification.action)}
                </h4>
                <p className="text-sm text-neutral-500 truncate">
                  {notification.resourceType}: {notification.resourceId}
                </p>
              </div>
              <span className="text-xs text-neutral-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
