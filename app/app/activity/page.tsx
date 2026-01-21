
"use client";

import ActivityShell from "@/components/layout/activity-shell";
import Link from 'next/link';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Globe,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Key
} from 'lucide-react';

export default function ActivityOverviewPage() {
  return (
    <ActivityShell className="bg-background-dark p-4 md:p-8">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Observability Overview</h1>
            <p className="text-text-secondary">Real-time insights into your infrastructure performance and health.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-surface-border bg-surface-dark flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Globe size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} />
                  100%
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">12</span>
                <p className="text-sm text-text-secondary">Active Domains</p>
              </div>
            </div>
            
            <div className="p-5 rounded-xl border border-surface-border bg-surface-dark flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <TrendingUp size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} />
                  +12.5%
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">84.3k</span>
                <p className="text-sm text-text-secondary">Emails Sent (24h)</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-surface-border bg-surface-dark flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <Clock size={20} />
                </div>
                 <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} />
                  -5ms
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">124ms</span>
                <p className="text-sm text-text-secondary">Avg. Delivery Time</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-surface-border bg-surface-dark flex flex-col gap-4">
               <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <CheckCircle size={20} />
                </div>
                 <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} />
                  99.9%
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Healthy</span>
                <p className="text-sm text-text-secondary">System Status</p>
              </div>
            </div>
          </div>

          {/* Charts / Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart Placeholder */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-surface-border bg-surface-dark">
              <h3 className="text-lg font-bold text-white mb-6">Traffic Volume</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                 {[40, 65, 45, 80, 55, 70, 40, 65, 45, 80, 55, 70].map((h, i) => (
                    <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group">
                        <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-primary rounded-t-sm group-hover:bg-primary-dark transition-colors"></div>
                    </div>
                 ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-text-secondary">
                 <span>00:00</span>
                 <span>04:00</span>
                 <span>08:00</span>
                 <span>12:00</span>
                 <span>16:00</span>
                 <span>20:00</span>
              </div>
            </div>

            {/* Recent Events */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4">Recent Events</h3>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                
                <div className="flex gap-3 items-start">
                   <div className="mt-1 p-1.5 rounded-full bg-red-500/10 text-red-500">
                      <AlertCircle size={14} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">DNS Verification Failed</span>
                      <span className="text-xs text-text-secondary">example.com - 2 min ago</span>
                   </div>
                </div>

                <div className="flex gap-3 items-start">
                   <div className="mt-1 p-1.5 rounded-full bg-green-500/10 text-green-500">
                      <CheckCircle size={14} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Webhook Created</span>
                      <span className="text-xs text-text-secondary">payment.success - 1 hr ago</span>
                   </div>
                </div>

                <div className="flex gap-3 items-start">
                   <div className="mt-1 p-1.5 rounded-full bg-blue-500/10 text-blue-500">
                      <Activity size={14} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Spike in Traffic</span>
                      <span className="text-xs text-text-secondary">High volume detected - 3 hrs ago</span>
                   </div>
                </div>

                 <div className="flex gap-3 items-start">
                   <div className="mt-1 p-1.5 rounded-full bg-purple-500/10 text-purple-500">
                      <Key size={14} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">API Key Revoked</span>
                      <span className="text-xs text-text-secondary">prod-key-1 - 5 hrs ago</span>
                   </div>
                </div>

              </div>
              <Link href="/activity/logs" className="mt-4 text-center text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                 View All Logs
              </Link>
            </div>

          </div>

        </div>
    </ActivityShell>
  );
}
