"use client";

import React, { useEffect, useState } from "react";
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
  ChevronRight,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mailApi } from "@/lib/api/mail";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SentPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<any | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  useEffect(() => {
    async function fetchSentMessages() {
      try {
        setIsLoading(true);
        const response = await mailApi.getSent();
        // Handle response structure depending on API client
        const data = Array.isArray(response) ? response : (response?.data || []);
        
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch sent messages:", err);
        setError("Failed to load sent messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSentMessages();
  }, []);

  const handleViewMessage = async (messageId: string) => {
    setSelectedMessageId(messageId);
    setIsMessageModalOpen(true);
    setIsLoadingMessage(true);
    setViewingMessage(null);
    
    try {
      const response = await mailApi.getMessage(messageId);
      setViewingMessage(response);
    } catch (err) {
      console.error("Failed to fetch message details:", err);
      toast.error("Failed to load message content");
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Calculate stats
  const totalSent = messages.length;
  const deliveredCount = messages.filter(m => m.sesMessageId).length;
  const failedCount = totalSent - deliveredCount;
  const deliveryRate = totalSent > 0 ? ((deliveredCount / totalSent) * 100).toFixed(1) + "%" : "0%";

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Header Section */}
      <div className="shrink-0 px-8 pt-8 pb-4">
        {/* ... (existing header content) ... */}
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
                <p className="text-[#0d121b] dark:text-white text-2xl font-bold leading-none">{totalSent}</p>
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
                <p className="text-[#0d121b] dark:text-white text-2xl font-bold leading-none">{deliveryRate}</p>
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
                <p className="text-[#0d121b] dark:text-white text-2xl font-bold leading-none">{failedCount}</p>
                <span className="text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded text-xs font-medium">{failedCount > 0 ? `-${(failedCount/totalSent * 100).toFixed(1)}%` : "0%"}</span>
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
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm overflow-x-auto flex flex-col min-h-[400px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#cfd7e7] dark:border-gray-800 bg-[#f8f9fc] dark:bg-[#1a1a1a] min-w-[800px]">
              <div className="col-span-4 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400">Subject</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400">Date Sent</div>
              <div className="col-span-4 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400">Delivery Status</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-[#4c669a] dark:text-gray-400 text-right">Actions</div>
            </div>

            {isLoading ? (
              <div className="divide-y divide-[#cfd7e7] dark:divide-gray-800">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center min-w-[800px]">
                    <div className="col-span-4 flex flex-col gap-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="col-span-4 flex flex-col gap-1.5 pr-8">
                      <div className="flex justify-between items-center text-xs">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-red-500">
                <AlertCircle className="w-8 h-8 mb-4 " />
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#4c669a] dark:text-gray-400">
                <Send className="w-12 h-12 mb-4 opacity-20" />
                <p>No sent messages found.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#cfd7e7] dark:divide-gray-800">
                {messages.map((message) => (
                  <div key={message.id} className="group hover:bg-[#f8f9fc] dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => handleViewMessage(message.id)}>
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center min-w-[800px]">
                      <div className="col-span-4 flex flex-col">
                        <p className="text-sm font-bold text-[#0d121b] dark:text-white truncate pr-4">{message.subject || "(No Subject)"}</p>
                        <p className="text-xs text-[#4c669a] dark:text-gray-400 truncate pr-4">To: {message.to.join(", ")}</p>
                      </div>
                      <div className="col-span-2 text-sm text-[#0d121b] dark:text-white">
                        {format(new Date(message.sentAt), "MMM d, yyyy")} <span className="text-[#4c669a] dark:text-gray-500 text-xs ml-1">{format(new Date(message.sentAt), "h:mm a")}</span>
                      </div>
                      <div className="col-span-4 flex flex-col gap-1.5 pr-8">
                        <div className="flex justify-between items-center text-xs">
                          {message.sesMessageId ? (
                            <span className="font-medium text-[#07883b]">Delivered</span>
                          ) : (
                            <span className="font-medium text-red-600 dark:text-red-400">Failed / Pending</span>
                          )}
                          <span className="text-[#4c669a] dark:text-gray-400">1/1</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#e7ebf3] dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${message.sesMessageId ? 'bg-[#07883b]' : 'bg-red-500'} w-full rounded-full`}></div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-[#4c669a] hover:text-webmail-primary hover:bg-[#e7ebf3] dark:hover:bg-gray-700 rounded transition-colors" title="View Email" onClick={(e) => { e.stopPropagation(); handleViewMessage(message.id); }}>
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-[#4c669a] hover:text-webmail-primary hover:bg-[#e7ebf3] dark:hover:bg-gray-700 rounded transition-colors" title="More Options" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

             {/* Pagination */}
             {messages.length > 0 && (
               <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-[#cfd7e7] dark:border-gray-800 mt-auto">
                <p className="text-sm text-[#4c669a] dark:text-gray-400">Showing <span className="font-medium text-[#0d121b] dark:text-white">1-{messages.length}</span> of <span className="font-medium text-[#0d121b] dark:text-white">{messages.length}</span> results</p>
                <div className="flex gap-2">
                  <button className="flex items-center justify-center size-8 rounded border border-[#cfd7e7] dark:border-gray-700 text-[#4c669a] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center size-8 rounded border border-[#cfd7e7] dark:border-gray-700 text-[#4c669a] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
             )}
          </div>
        </div>
      </div>

      {/* Message View Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200" onClick={() => setIsMessageModalOpen(false)}>
          <div className="bg-white dark:bg-[#121212] w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-[#fbfbfc] dark:bg-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Message Details</h3>
              </div>
              <button 
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMessageModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingMessage ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ) : viewingMessage ? (
                <div className="space-y-6">
                  {/* Subject Line */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                      {viewingMessage.subject || "(No Subject)"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Sent on</span>
                      <span className="text-gray-900 dark:text-gray-300 font-bold">
                        {format(new Date(viewingMessage.sentAt), "MMMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#f8f9fc] dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800/50">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">From</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {viewingMessage.from.name || viewingMessage.from.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{viewingMessage.from.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">To</p>
                      <div className="flex flex-wrap gap-1">
                        {viewingMessage.to.map((email: string) => (
                          <span key={email} className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0d0d0d] min-h-[150px] shadow-sm">
                      {viewingMessage.body?.html ? (
                        <div dangerouslySetInnerHTML={{ __html: viewingMessage.body.html }} />
                      ) : (
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                          {viewingMessage.body?.text || viewingMessage.snippet || "No content."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className={`size-2 rounded-full ${viewingMessage.sesMessageId ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold text-gray-500">
                      {viewingMessage.sesMessageId ? `Successfully delivered (AWS ID: ${viewingMessage.sesMessageId})` : "Delivery failed or ID missing"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p>Failed to load message.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-[#fbfbfc] dark:bg-[#1a1a1a] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>Close</Button>
              <Button>Download Copy</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
