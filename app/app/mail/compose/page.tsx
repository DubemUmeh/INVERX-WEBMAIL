"use client";

import React from "react";
import { 
  Search, 
  Bell, 
  Send, 
  X, 
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  Paperclip,
  Image as ImageIcon,
  Clock,
  Lock,
  BarChart,
  Lightbulb,
  Dock,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ComposePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-full flex flex-col font-display selection:bg-black selection:text-white overflow-y-auto">
      {/* Top Navigation - Standalone for Compose */}
      {/* <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-webmail-primary dark:text-white">
          <div className="size-8 flex items-center justify-center bg-black text-white rounded-lg">
            <Send className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Inverx</h2>
        </div>
        <div className="flex items-center gap-6">
          <button className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
          </button>
          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700"></div>
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-neutral-200 dark:border-neutral-700 cursor-pointer shadow-sm bg-linear-to-tr from-gray-200 to-gray-400"
          ></div>
        </div>
      </header> */}

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Main Composer */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Page Heading */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-webmail-primary dark:text-white tracking-tight">New Message</h1>
            <span className="text-sm text-neutral-500 flex items-center gap-2">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              Auto-saved 2m ago
            </span>
          </div>
          {/* Composer Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col flex-1 min-h-[600px]">
            {/* Fields Section */}
            <div className="px-6 py-4 space-y-4 border-b border-neutral-100 dark:border-neutral-800">
              {/* From Field */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">From</label>
                <div className="relative group">
                  <div className="flex items-center gap-2 w-full">
                    <Select defaultValue="support@inverx.com">
                      <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto bg-transparent focus:ring-0 text-webmail-primary dark:text-white font-medium text-sm gap-2">
                        <SelectValue placeholder="Select email" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support@inverx.com">support@inverx.com</SelectItem>
                        <SelectItem value="alex.m@inverx.com">alex.m@inverx.com</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100 dark:border-green-900">
                      <Check className="w-3.5 h-3.5 fill-current" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* To Field */}
              <div className="grid grid-cols-[80px_1fr] items-start gap-4">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">To</label>
                <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                  {/* Chip 1 */}
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 group cursor-default">
                    <div className="size-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">AL</div>
                    <span className="text-sm text-webmail-primary dark:text-white">alice@client.com</span>
                    <button className="hover:text-red-500 text-neutral-400 transition-colors flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Chip 2 */}
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 group cursor-default">
                    <div className="size-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">DT</div>
                    <span className="text-sm text-webmail-primary dark:text-white">design-team@agency.com</span>
                    <button className="hover:text-red-500 text-neutral-400 transition-colors flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Input */}
                  <input
                    className="flex-1 min-w-[120px] bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-neutral-400 text-webmail-primary dark:text-white h-8 outline-none"
                    placeholder="Add recipients..."
                    type="text"
                  />
                  <div className="ml-auto flex gap-3 text-sm text-neutral-500 font-medium">
                    <button className="hover:text-webmail-primary dark:hover:text-white transition-colors">Cc</button>
                    <button className="hover:text-webmail-primary dark:hover:text-white transition-colors">Bcc</button>
                  </div>
                </div>
              </div>
              {/* Subject Field */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4 pt-2">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Subject</label>
                <input
                  className="w-full bg-transparent border-none p-0 text-lg font-semibold focus:ring-0 placeholder:text-neutral-300 text-webmail-primary dark:text-white outline-none"
                  type="text"
                  defaultValue="Project Update: Q4 Design System Review"
                />
              </div>
            </div>
            {/* Formatting Toolbar */}
            <div className="px-6 py-2 bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="Bold">
                <Bold className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="Italic">
                <Italic className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="Underline">
                <Underline className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="List">
                <List className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="Link">
                <LinkIcon className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="Attach File">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors" title="Insert Image">
                <ImageIcon className="w-5 h-5" />
              </button>
              <div className="ml-auto text-xs text-neutral-400">Markdown supported</div>
            </div>
            {/* Rich Text Editor Area */}
            <div className="flex-1 p-6 overflow-y-auto cursor-text">
              <div className="editor-textarea outline-none h-full w-full text-base leading-relaxed text-neutral-800 dark:text-neutral-200" contentEditable suppressContentEditableWarning>
                <p>Hi Alice,</p>
                <br />
                <p>I hope you're having a great week. I wanted to share the latest updates on the Q4 Design System Review.</p>
                <br />
                <p>We've completed the initial audit of the component library and identified several areas for optimization. The team has been working hard to ensure consistency across all platforms.</p>
                <br />
                <p>Please find the attached report for more details. Let me know if you have any questions or if you'd like to schedule a call to discuss.</p>
                <br />
                <p>Best regards,</p>
                <p><strong>Alex Mitchell</strong></p>
                <p className="text-neutral-500 text-sm">Product Designer | Inverx</p>
              </div>
            </div>
            {/* Bottom Action Bar */}
            <div className="px-6 py-4 bg-white dark:bg-surface-dark border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="bg-black dark:bg-white dark:text-black hover:bg-black/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-black/10 flex items-center gap-2 transition-all">
                  Send
                  <Send className="w-4 h-4 ml-1" />
                </button>
                <button className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-lg font-medium border border-neutral-200 dark:border-neutral-700 transition-colors">
                  Save Draft
                </button>
              </div>
              <button className="text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2.5 rounded-lg transition-colors" title="Discard">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Advanced Options */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-[44px]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Advanced Options</h3>
            <button className="text-neutral-400 hover:text-webmail-primary dark:hover:text-white transition-colors">
              <Dock className="w-5 h-5" />
            </button>
          </div>
          {/* Panel Content */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col gap-px bg-neutral-100 dark:bg-neutral-800">
            {/* Section: Delivery & Behavior */}
            <div className="bg-white dark:bg-surface-dark p-5">
              <div className="flex items-center gap-2 mb-4 text-webmail-primary dark:text-white">
                <Clock className="text-neutral-400 w-5 h-5" />
                <h4 className="font-semibold text-sm">Delivery & Behavior</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Schedule Send</label>
                  <div className="relative">
                    <input
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm px-3 py-2 text-webmail-primary dark:text-white focus:ring-1 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white"
                      type="datetime-local"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Priority Level</label>
                  <div className="flex bg-neutral-50 dark:bg-neutral-800 rounded-lg p-1 border border-neutral-200 dark:border-neutral-700">
                    <button className="flex-1 text-xs font-medium py-1.5 rounded text-neutral-500 hover:text-webmail-primary transition-colors">Low</button>
                    <button className="flex-1 text-xs font-medium py-1.5 rounded bg-white dark:bg-neutral-700 shadow-sm text-webmail-primary dark:text-white">Normal</button>
                    <button className="flex-1 text-xs font-medium py-1.5 rounded text-neutral-500 hover:text-red-500 transition-colors">High</button>
                  </div>
                </div>
              </div>
            </div>
            {/* Section: Security */}
            <div className="bg-white dark:bg-surface-dark p-5">
              <div className="flex items-center gap-2 mb-4 text-webmail-primary dark:text-white">
                <Lock className="text-neutral-400 w-5 h-5" />
                <h4 className="font-semibold text-sm">Security</h4>
              </div>
              <div className="space-y-4">
                {/* Toggle Items would go here, omitting for brevity */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-webmail-primary dark:text-white">Force TLS</span>
                    <span className="text-xs text-neutral-500">Require secure connection</span>
                  </div>
                  {/* Mock Switch */}
                  <div className="w-9 h-5 bg-black dark:bg-white rounded-full relative cursor-pointer">
                     <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white dark:bg-black rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Section: Tracking */}
            <div className="bg-white dark:bg-surface-dark p-5">
              <div className="flex items-center gap-2 mb-4 text-webmail-primary dark:text-white">
                <BarChart className="text-neutral-400 w-5 h-5" />
                <h4 className="font-semibold text-sm">Tracking</h4>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-webmail-primary dark:text-white" />
                    <span className="text-sm">Track Opens</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-webmail-primary dark:text-white" />
                    <span className="text-sm">Track Link Clicks</span>
                 </div>
              </div>
            </div>
          </div>
          {/* Helper Card */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex gap-3">
            <Lightbulb className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Pro Tip</h5>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Use <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">Cmd + Enter</span> to send your message instantly.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
