"use client";

import React from "react";
import { 
  Filter, 
  Search, 
  Send,
  Eye, 
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Download,
  Filter as FilterIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SentPage() {
  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header Section */}
      <div className="shrink-0 px-8 pt-8 pb-4">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h2 className="text-[#0d121b] dark:text-white text-3xl font-black leading-tight tracking-tight">
              Sent Archive & Delivery Intelligence
            </h2>
            <p className="text-[#4c669a] dark:text-gray-400 text-base font-normal">
              Track delivery status, timestamps, and performance of your sent campaigns.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 h-10 px-4 bg-white dark:bg-[#1a1a1a] border border-[#cfd7e7] dark:border-gray-700 rounded-lg text-[#0d121b] dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Oct 1 - Oct 31</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-10 px-4 bg-webmail-primary text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#121212] border border-[#cfd7e7] dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Total Sent</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md text-blue-600 dark:text-blue-400">
                    <Send className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-[#0d121b] dark:text-white text-2xl font-bold leading-none">1,240</p>
                <span className="text-[#07883b] bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs font-medium">+12%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#121212] border border-[#cfd7e7] dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Delivery Rate</p>
                <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded-md text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-[#0d121b] dark:text-white text-2xl font-bold leading-none">98.2%</p>
                <span className="text-[#07883b] bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs font-medium">+2.4%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#121212] border border-[#cfd7e7] dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Failed / Bounced</p>
                <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded-md text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-[#0d121b] dark:text-white text-2xl font-bold leading-none">24</p>
                <span className="text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded text-xs font-medium">-5%</span>
              </div>
            </div>
          </div>

          {/* Toolbar & Filters */}
          <div className="flex items-center gap-4 bg-white dark:bg-[#121212] p-2 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm">
            <div className="flex-1 flex items-center bg-[#f6f6f8] dark:bg-[#1a1a1a] rounded-lg px-3 h-10 border border-transparent focus-within:border-webmail-primary transition-colors">
              <Search className="text-[#4c669a] w-5 h-5" />
              <input
                className="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d121b] dark:text-white placeholder-[#4c669a] ml-2 outline-none"
                placeholder="Search by subject or recipient..."
                type="text"
              />
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#4c669a] hover:text-webmail-primary dark:text-gray-400 dark:hover:text-white transition-colors">
              <FilterIcon className="w-5 h-5" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#4c669a] hover:text-webmail-primary dark:text-gray-400 dark:hover:text-white transition-colors">
              <ArrowUpDown className="w-5 h-5" />
              Sort
            </button>
          </div>

          {/* Main Data Table */}
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm overflow-x-auto flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#cfd7e7] dark:border-gray-800 bg-[#f8f9fc] dark:bg-[#1a1a1a] min-w-[800px]">
              <div className="col-span-4 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400">Subject</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400">Date Sent</div>
              <div className="col-span-4 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400">Delivery Status</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400 text-right">Actions</div>
            </div>

            {/* Row 1 */}
            <div className="group border-b border-[#cfd7e7] dark:border-gray-800 hover:bg-[#f8f9fc] dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center min-w-[800px]">
                <div className="col-span-4 flex flex-col">
                  <p className="text-sm font-bold text-[#0d121b] dark:text-white">Q3 Financial Results Update</p>
                  <p className="text-xs text-[#4c669a] dark:text-gray-400">To: Investors Group (240 recipients)</p>
                </div>
                <div className="col-span-2 text-sm text-[#0d121b] dark:text-white">
                  Oct 24, 2023 <span className="text-[#4c669a] dark:text-gray-500 text-xs ml-1">10:42 AM</span>
                </div>
                <div className="col-span-4 flex flex-col gap-1.5 pr-8">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#07883b]">Delivered</span>
                    <span className="text-[#4c669a] dark:text-gray-400">240/240</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#e7ebf3] dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#07883b] w-full rounded-full"></div>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-[#4c669a] hover:text-webmail-primary hover:bg-[#e7ebf3] dark:hover:bg-gray-700 rounded transition-colors" title="View Email">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 text-[#4c669a] hover:text-webmail-primary hover:bg-[#e7ebf3] dark:hover:bg-gray-700 rounded transition-colors" title="More Options">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

             {/* Row 2 */}
            <div className="group border-b border-[#cfd7e7] dark:border-gray-800 hover:bg-[#f8f9fc] dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center min-w-[800px]">
                <div className="col-span-4 flex flex-col">
                  <p className="text-sm font-bold text-[#0d121b] dark:text-white">Product Launch Announcement: Model X</p>
                  <p className="text-xs text-[#4c669a] dark:text-gray-400">To: Early Adopters (15 recipients)</p>
                </div>
                <div className="col-span-2 text-sm text-[#0d121b] dark:text-white">
                  Oct 23, 2023 <span className="text-[#4c669a] dark:text-gray-500 text-xs ml-1">09:15 AM</span>
                </div>
                <div className="col-span-4 flex flex-col gap-1.5 pr-8">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      Partial Delivery
                    </span>
                    <span className="text-[#4c669a] dark:text-gray-400">12/15</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#e7ebf3] dark:bg-gray-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-webmail-primary w-[80%]"></div>
                    <div className="h-full bg-red-500 w-[20%]"></div>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-[#4c669a] hover:text-webmail-primary hover:bg-[#e7ebf3] dark:hover:bg-gray-700 rounded transition-colors" title="View Email">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 text-[#4c669a] hover:text-webmail-primary hover:bg-[#e7ebf3] dark:hover:bg-gray-700 rounded transition-colors" title="More Options">
                     <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
             {/* Pagination */}
             <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20">
              <p className="text-sm text-[#4c669a] dark:text-gray-400">Showing <span className="font-medium text-[#0d121b] dark:text-white">1-2</span> of <span className="font-medium text-[#0d121b] dark:text-white">142</span> results</p>
              <div className="flex gap-2">
                <button className="flex items-center justify-center size-8 rounded border border-[#cfd7e7] dark:border-gray-700 text-[#4c669a] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                   <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center size-8 rounded border border-[#cfd7e7] dark:border-gray-700 text-[#4c669a] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
