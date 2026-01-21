
"use client";

import React, { useState } from 'react';
import ActivitySidebar from '@/components/activity-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Menu } from 'lucide-react';
import {
  Download,
  RefreshCw,
  ChevronDown,
  Clock,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  AlertCircle,
  RotateCw,
  Globe
} from 'lucide-react';

export default function DomainActivityPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden h-screen flex">
      <div className="hidden lg:block h-full shrink-0">
        <ActivitySidebar />
      </div>
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
        {/* Header Section */}
        <header className="shrink-0 border-b border-border-dark bg-background-dark z-10">
          <div className="px-6 py-5 flex flex-col gap-6">
            {/* Title Row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-white hover:bg-white/10 shrink-0">
                      <Menu size={24} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-r-0 w-[280px] bg-surface-dark text-white">
                    <SheetTitle className="hidden">Menu</SheetTitle>
                    <div className="h-full" onClick={() => setIsOpen(false)}>
                      <ActivitySidebar />
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Domain Activity</h2>
                  <p className="text-text-secondary text-sm">Real-time SMTP logs and delivery status for your domains.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-sm font-medium text-white hover:bg-border-dark transition-colors">
                  <Download size={18} />
                  Export
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(19,127,236,0.3)]">
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>
            {/* Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Domain Select */}
              <div className="relative min-w-[200px]">
                <label className="sr-only">Select Domain</label>
                <Select defaultValue="example.com">
                  <SelectTrigger className="w-full bg-surface-dark border border-border-dark text-white text-sm rounded-lg py-2.5 h-auto focus:ring-primary focus:ring-offset-0">
                    <div className="flex items-center gap-2">
                       <Globe className="text-text-secondary" size={18} />
                       <SelectValue placeholder="Select Domain" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="example.com">example.com</SelectItem>
                    <SelectItem value="app.example.com">app.example.com</SelectItem>
                    <SelectItem value="mail.example.com">mail.example.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Time Range */}
              <div className="relative min-w-[160px]">
                <label className="sr-only">Time Range</label>
                <Select defaultValue="Last 1 Hour">
                  <SelectTrigger className="w-full bg-surface-dark border border-border-dark text-white text-sm rounded-lg py-2.5 h-auto focus:ring-primary focus:ring-offset-0">
                    <div className="flex items-center gap-2">
                      <Clock className="text-text-secondary" size={18} />
                      <SelectValue placeholder="Time Range" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Last 1 Hour">Last 1 Hour</SelectItem>
                    <SelectItem value="Last 24 Hours">Last 24 Hours</SelectItem>
                    <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                    <SelectItem value="Custom Range">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-px h-8 bg-border-dark mx-1"></div>
              {/* Search */}
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={20} />
                <input
                  className="w-full bg-surface-dark border border-border-dark text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary/50 transition-all"
                  placeholder="Search by Message-ID, Sender, or Recipient..." type="text" />
              </div>
            </div>
          </div>
        </header>
        {/* Log Table Area */}
        <div className="flex-1 overflow-auto p-6 pt-0">
          <div className="min-w-full inline-block align-middle">
            <div className="border border-border-dark rounded-lg overflow-hidden bg-surface-dark">
              <table className="min-w-full divide-y divide-border-dark">
                <thead className="bg-surface-dark/50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-[180px]"
                      scope="col">Timestamp</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-[120px]"
                      scope="col">Direction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                      scope="col">From</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                      scope="col">To</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-[140px]"
                      scope="col">Status</th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider w-[80px]"
                      scope="col"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark bg-background-dark">
                  {/* Row 1: Delivered */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-text-secondary">Oct 24, 14:32:11</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowUp size={18} className="text-primary rotate-45" />
                        <span className="text-sm">Outbound</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">notifications@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">john.doe@gmail.com</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-text-secondary ml-auto" />
                    </td>
                  </tr>
                  {/* Row 2: Bounced (Active/Expanded State) */}
                  <tr className="bg-surface-dark cursor-pointer border-l-2 border-l-red-500">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-white">Oct 24, 14:30:45</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-white">
                        <ArrowUp size={18} className="text-primary rotate-45" />
                        <span className="text-sm font-medium">Outbound</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">marketing@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">invalid-user@corporate.net</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        Bounced
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronDown size={20} className="text-white ml-auto" />
                    </td>
                  </tr>
                  {/* Expanded Detail View for Row 2 */}
                  <tr className="bg-surface-dark border-l-2 border-l-red-500">
                    <td className="px-4 pb-4 pt-0" colSpan={6}>
                      <div className="rounded-lg bg-[#0d141c] border border-border-dark p-4 flex flex-col gap-4 ml-10">
                        {/* Indented slightly */}
                        {/* Error Summary & Actions */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 rounded-md bg-red-500/10 text-red-400">
                              <AlertCircle size={20} />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">Permanent Failure</p>
                              <p className="text-text-secondary text-sm mt-0.5">The recipient server rejected the message.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-white hover:bg-border-dark transition-colors border border-transparent hover:border-border-dark">View
                              Raw Log</button>
                            <button
                              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
                              <RotateCw size={14} />
                              Retry Delivery
                            </button>
                          </div>
                        </div>
                        {/* Technical Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-dark pt-4 mt-2">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-1">SMTP
                              Error Response</p>
                            <div
                              className="font-mono text-xs text-red-300 bg-red-950/20 border border-red-900/30 rounded p-2 break-all">
                              550 5.1.1 &lt;invalid-user@corporate.net&gt;: Recipient address rejected: User unknown in
                              virtual mailbox table
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-1">Message
                              ID</p>
                            <div
                              className="font-mono text-xs text-text-secondary bg-background-dark/50 border border-border-dark rounded p-2 break-all">
                              &lt;20231024143045.1827.48291@example.com&gt;
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* Row 3: Deferred */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-text-secondary">Oct 24, 14:15:22</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowDown size={18} className="text-sky-400 rotate-225" />
                        <span className="text-sm">Inbound</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">support@partner-company.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">helpdesk@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Deferred
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-text-secondary ml-auto" />
                    </td>
                  </tr>
                  {/* Row 4: Delivered */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-text-secondary">Oct 24, 13:58:01</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowUp size={18} className="text-primary rotate-45" />
                        <span className="text-sm">Outbound</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">auth@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">sarah.j@outlook.com</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-text-secondary ml-auto" />
                    </td>
                  </tr>
                  {/* Row 5: Delivered */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-text-secondary">Oct 24, 13:55:12</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowDown size={18} className="text-sky-400 rotate-225" />
                        <span className="text-sm">Inbound</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">alerts@monitoring.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">devops@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-text-secondary ml-auto" />
                    </td>
                  </tr>
                  {/* Row 6: Bounced */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-text-secondary">Oct 24, 13:42:19</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <ArrowUp size={18} className="text-primary rotate-45" />
                        <span className="text-sm">Outbound</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">marketing@example.com</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">old-user@yahoo.com</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        Bounced
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-text-secondary ml-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-xs text-text-secondary">
                Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">6</span> of
                <span className="font-medium text-white">2,492</span> results
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded border border-border-dark bg-surface-dark text-text-secondary text-xs hover:text-white hover:bg-border-dark transition-colors disabled:opacity-50"
                  disabled>Previous</button>
                <button
                  className="px-3 py-1 rounded border border-border-dark bg-surface-dark text-text-secondary text-xs hover:text-white hover:bg-border-dark transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
