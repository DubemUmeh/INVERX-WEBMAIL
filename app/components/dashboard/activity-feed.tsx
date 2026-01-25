import Link from "next/link";
import { Activity, Globe, Mail, User, Shield, Info, Key } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  createdAt: string;
}

interface ActivityFeedProps {
  logs: AuditLog[];
}

function getActionIcon(action: string, resourceType: string) {
  if (resourceType === 'domain') return <Globe className="h-4 w-4" />;
  if (resourceType === 'address' || resourceType === 'email') return <Mail className="h-4 w-4" />;
  if (resourceType === 'user') return <User className="h-4 w-4" />;
  if (resourceType === 'api_key') return <Key className="h-4 w-4" />;
  if (action.includes('security') || action.includes('password')) return <Shield className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}

function getActionColor(action: string) {
  if (action.includes('create') || action.includes('add') || action.includes('verify')) {
    return 'bg-emerald-500/10 text-emerald-500';
  }
  if (action.includes('delete') || action.includes('remove')) {
    return 'bg-red-500/10 text-red-500';
  }
  return 'bg-primary/10 text-primary';
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary dark:text-white">
          Recent Activity
        </h2>
        <Link href="/settings/notifications" className="text-sm font-semibold text-neutral-500 hover:text-primary transition-colors">
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 group hover:border-primary/20 transition-colors">
              <div className={`p-2.5 rounded-full shrink-0 ${getActionColor(log.action)}`}>
                {getActionIcon(log.action, log.resourceType)}
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <h3 className="text-primary dark:text-white font-medium capitalize text-sm">
                  {log.action.replace(/_/g, ' ')}
                </h3>
                <p className="text-neutral-500 text-xs">
                  {log.resourceType}: <span className="font-mono">{log.resourceId}</span>
                </p>
              </div>
              <span className="text-xs font-medium text-neutral-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="bg-neutral-100 dark:bg-neutral-800 size-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Info size={20} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-sm">No recent activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
