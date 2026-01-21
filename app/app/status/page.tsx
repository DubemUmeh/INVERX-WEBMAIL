import React from "react";
import Link from "next/link";
import { Check, CheckCircle, Bell, ArrowLeft, ArrowRight, AlertTriangle, Activity } from "lucide-react";

export default function StatusPage() {
  return (
    <div className="bg-background dark:bg-background-dark text-primary dark:text-white font-display antialiased min-h-screen flex flex-col">
      
      {/* Header with Back Link */}
      <div className="w-full border-b border-[#ededed] dark:border-neutral-800 bg-white dark:bg-background-dark sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
             <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Live Status</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        {/* Page Heading & Subscription */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-primary dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">System Status</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-base">Real-time performance and reliability updates.</p>
          </div>
          <div className="w-full md:w-auto">
            <button
              className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg border border-[#ededed] dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-primary dark:text-white shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <Bell className="w-4 h-4" />
              Subscribe to Updates
            </button>
          </div>
        </div>

        {/* Hero Status Card */}
        <div className="rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-6 flex items-center gap-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-green-700 dark:text-green-400">All Systems Operational</h2>
            <p className="text-green-600/80 dark:text-green-400/70 text-sm mt-1 font-medium">Last updated: Just now</p>
          </div>
        </div>

        {/* Services Status List */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-primary dark:text-white px-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-neutral-400" />
            Current Status by Service
          </h3>
          <div className="flex flex-col rounded-xl border border-[#ededed] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden divide-y divide-[#f5f5f5] dark:divide-neutral-800">
            
            {/* Service Item: Web Application */}
            <div className="flex flex-col p-5 gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-primary dark:text-white font-bold text-base">Web Application</span>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-green-100 dark:bg-green-500/20 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:text-green-300 tracking-wide">
                    OPERATIONAL
                  </span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="text-sm font-bold">100%</span>
                  <CheckCircle className="w-5 h-5 fill-current/20" />
                </div>
              </div>
              {/* Uptime Visualization (90 days) */}
              <div aria-label="90 day uptime history" className="flex gap-0.5 h-8 items-end w-full">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-300 hover:opacity-100 ${i === 45 ? "bg-amber-400 dark:bg-amber-500 opacity-80" : "bg-green-400 dark:bg-green-500 opacity-60"}`}
                    style={{ height: i === 45 ? '60%' : '100%' }}
                    title={i === 45 ? "Minor degradation 15 days ago" : "Operational"}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs font-medium text-neutral-400 dark:text-neutral-500">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Service Item: SMTP Relay */}
            <div className="flex flex-col p-5 gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-primary dark:text-white font-bold text-base">SMTP Relay</span>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-green-100 dark:bg-green-500/20 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:text-green-300 tracking-wide">
                    OPERATIONAL
                  </span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="text-sm font-bold">99.99%</span>
                  <CheckCircle className="w-5 h-5 fill-current/20" />
                </div>
              </div>
              <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-[99.9%] rounded-full"></div>
              </div>
            </div>

            {/* Service Item: API */}
            <div className="flex flex-col p-5 gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-primary dark:text-white font-bold text-base">API</span>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-green-100 dark:bg-green-500/20 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:text-green-300 tracking-wide">
                    OPERATIONAL
                  </span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="text-sm font-bold">100%</span>
                  <CheckCircle className="w-5 h-5 fill-current/20" />
                </div>
              </div>
              <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-full rounded-full"></div>
              </div>
            </div>

            {/* Service Item: Third-party Integrations */}
            <div className="flex flex-col p-5 gap-5 bg-amber-50/30 dark:bg-amber-900/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-primary dark:text-white font-bold text-base">Integrations</span>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wide">
                    DEGRADED
                  </span>
                </div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <span className="text-sm font-bold">98.5%</span>
                  <AlertTriangle className="w-5 h-5 fill-current/20" />
                </div>
              </div>
              <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                 <div className="h-full bg-green-500 w-[90%]"></div>
                 <div className="h-full bg-amber-500 w-[10%]"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Incident History */}
        <div className="flex flex-col gap-8 mt-4">
          <h3 className="text-lg font-bold text-primary dark:text-white px-1">Past Incidents</h3>
          <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800">
            
            {/* Incident 1 */}
            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 size-4 rounded-full border-[3px] border-white dark:border-neutral-900 bg-neutral-400 dark:bg-neutral-600 ring-1 ring-neutral-200 dark:ring-neutral-800"></div>
              <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-[#ededed] dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h4 className="font-bold text-lg text-primary dark:text-white">Scheduled Maintenance</h4>
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">November 14, 2023</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 min-w-[80px] pt-1">Completed</span>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                      Scheduled maintenance for the primary database cluster has been completed successfully. All services are back to normal performance levels.
                    </p>
                </div>
              </div>
            </div>

            {/* Incident 2 */}
            <div className="relative">
              <div className="absolute -left-[29px] top-1.5 size-4 rounded-full border-[3px] border-white dark:border-neutral-900 bg-amber-500 ring-1 ring-amber-200 dark:ring-amber-900/30"></div>
              <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-[#ededed] dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h4 className="font-bold text-lg text-primary dark:text-white">Email Delivery Delays</h4>
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">October 2, 2023</span>
                </div>
                <div className="space-y-6">
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col min-w-[80px] gap-1 pt-0.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-500">Resolved</span>
                      <span className="text-[10px] text-neutral-400 font-mono">14:30 UTC</span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        The backlog of outgoing emails has been fully processed. Delivery times have returned to normal.
                    </p>
                  </div>

                  <div className="flex gap-4">
                     <div className="flex flex-col min-w-[80px] gap-1 pt-0.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-500">Update</span>
                      <span className="text-[10px] text-neutral-400 font-mono">13:45 UTC</span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        We are continuing to work on processing the queue. We expect full resolution within the next hour.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col min-w-[80px] gap-1 pt-0.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-500">Investigating</span>
                      <span className="text-[10px] text-neutral-400 font-mono">13:10 UTC</span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        We are currently investigating reports of delayed email delivery for some users in the EU region.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative pt-2">
              <button className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-primary dark:hover:text-white transition-colors">
                View older incidents
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
