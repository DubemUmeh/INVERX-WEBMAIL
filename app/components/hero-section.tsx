import React from "react";
import {
  Mail,
  PenSquare,
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  Trash2,
  Plus,
  Settings,
  Search,
  HelpCircle,
  Bell,
  ChevronDown,
  Filter,
  CheckCircle,
  Paperclip,
  Download,
  Reply,
  ReplyAll,
  Forward,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Bold,
  Italic,
  Link as LucideLink,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";

export default function Hero() {
  return (
    <section className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#121212] font-sans">
      {/* <!-- Sidebar --> */}
      <Sidebar className="hidden lg:flex bg-[#0F172A] text-white border-r border-white/5">
        <div className="flex-1 flex flex-col justify-between p-4 h-full overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-6">
            {/* <!-- Branding --> */}
            <div className="flex items-center gap-3 px-2 pt-2">
              <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight leading-none">Inverx</h1>
                <p className="text-[10px] text-white/50 font-medium">Pro Workspace</p>
              </div>
            </div>
            {/* <!-- Primary Action --> */}
            <button className="flex items-center justify-center gap-3 w-full bg-white text-[#0F172A] hover:bg-gray-100 transition-all font-bold h-12 rounded-xl shadow-sm group">
              <PenSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Compose</span>
            </button>
            
            {/* <!-- Navigation Menu --> */}
            <nav className="flex flex-col gap-1 mt-2">
              {/* <!-- Active Item --> */}
              <a
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/10 text-white font-medium shadow-sm"
                href="#"
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-5 h-5" />
                  <span className="text-sm">Inbox</span>
                </div>
                <span className="text-xs bg-white text-[#0F172A] px-1.5 py-0.5 rounded font-bold min-w-[20px] text-center">
                  12
                </span>
              </a>
              <a
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                href="#"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5" />
                  <span className="text-sm font-medium">Starred</span>
                </div>
              </a>
              <a
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                href="#"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5" />
                  <span className="text-sm font-medium">Sent</span>
                </div>
              </a>
              <a
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                href="#"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium">Drafts</span>
                </div>
                <span className="text-xs text-white/40 font-medium">2</span>
              </a>
              <a
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                href="#"
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5" />
                  <span className="text-sm font-medium">Archive</span>
                </div>
              </a>
              <a
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                href="#"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Trash</span>
                </div>
              </a>
            </nav>
            {/* <!-- Custom Labels --> */}
            <div className="mt-2">
              <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Labels
                </h3>
                <Plus className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <nav className="flex flex-col gap-0.5">
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group"
                  href="#"
                >
                  <span className="w-2 h-2 rounded-full border-2 border-blue-400"></span>
                  <span className="text-sm font-medium">Personal</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group"
                  href="#"
                >
                  <span className="w-2 h-2 rounded-full border-2 border-purple-400"></span>
                  <span className="text-sm font-medium">Work</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group"
                  href="#"
                >
                  <span className="w-2 h-2 rounded-full border-2 border-green-400"></span>
                  <span className="text-sm font-medium">Finance</span>
                </a>
              </nav>
            </div>
          </div>
          {/* <!-- Sidebar Footer --> */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <Link href='/settings' className="flex items-center gap-3 px-3 py-2 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </Sidebar>

      {/* <!-- Main Application Area --> */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121212]">
        {/* <!-- Global Header --> */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] z-20 shrink-0">
          {/* <!-- Search Bar --> */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary pointer-events-none transition-colors" />
              <input
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/10 focus:bg-white dark:focus:bg-[#252525] transition-all outline-none"
                placeholder="Search emails, contacts, attachments..."
                type="text"
              />
            </div>
          </div>
          {/* <!-- Right Actions --> */}
          <div className="flex items-center gap-3 ml-6">
            <button
              aria-label="Help"
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#121212]"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div
                className="h-8 w-8 rounded-lg bg-cover bg-center ring-1 ring-gray-200 dark:ring-gray-700"
                data-alt="User profile picture of a smiling man"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACjPyEK0XGXDeJ0-9gB6urHv5r1cFCW6vnW2MRTed3HOfVAo17HQ0Md52UonV67gNcziF8vjjj51sPQxzXuoRp5ft--r4Ynk65EFBOhXDFTn8hkorTo6tdVgMjg_rR5EVMKGmxPW-fr4B6TbSxjNhHYi6LOGKdHqediG6fbYW5tc4d03A6hHDWSUol9DJbINd6TL--w3dh-nDMAn8-aZhUIuL4on2rz7dVv--WQa0WVQNLbguQ8ODy9UucVMXoL7lGh-lI20gJV4Y')",
                }}
              ></div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </header>

        {/* <!-- Content Columns --> */}
        <div className="flex flex-1 overflow-hidden">
          {/* <!-- Message List (Column 2) --> */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212]">
            {/* <!-- List Controls --> */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-900 bg-white dark:bg-[#121212] z-10 shrink-0">
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#1a1a1a] p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-bold bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded shadow-sm border border-gray-100 dark:border-gray-700">
                  All
                </button>
                <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Unread
                </button>
              </div>
              <button
                className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors"
                title="Filter list"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
            {/* <!-- Scrollable List --> */}
            <div className="flex-1 overflow-y-auto">
              {/* <!-- Item 1 (Selected) --> */}
              <div className="group relative p-4 cursor-pointer bg-gray-50 dark:bg-white/5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-6"
                      data-alt="Avatar of Alice Smith"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAu9riJorfSEVduwPLsWxXldieypVhUP7MrapbgI5yhe9DvFoGPk0U95cJeAd07jJeX-P-2wCL8l0pPR5OcqMvFe58mEamGDFWcbWhlPWX-bixWojdbeR0xYuvkMsV_90Kx96E_HE9PdEE10GEnt219x6PkB-wTttGfpPTo9xGruhZS-3xjBydsgUKQkJlXpGqEhxIBhUPVQaOKsTeNyUfhlOmejy4MrDRm7Z5sQ7rtHuj8qux_ZAQdQzcf8FhtNGK4kGI3eXUZEsw")',
                      }}
                    ></div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      Alice Smith
                    </span>
                  </div>
                  <span className="text-xs text-gray-900 dark:text-white font-medium">
                    10:42 AM
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                  Team Update: Q4 Goals
                </h4>
                <p className="text-xs text-gray-500 dark:text-white/70 line-clamp-2 leading-relaxed">
                  Here are the finalized goals for the upcoming quarter. Please
                  review the attached document...
                </p>
                {/* <!-- Actions on hover --> */}
                <div className="hidden group-hover:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-[#252525] shadow-lg rounded-lg p-1 items-center gap-1 border border-gray-100 dark:border-gray-700">
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-300">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* <!-- Item 2 (Unread) --> */}
              <div className="group relative p-4 cursor-pointer border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-[10px] font-bold">
                      BD
                    </div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      Billing Dept
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
                  Invoice #1023 Payment Confirmation
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  Your payment has been successfully processed. Find the receipt
                  attached...
                </p>
              </div>
              {/* <!-- Item 3 (Read) --> */}
              <div className="group relative p-4 cursor-pointer border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold">
                      AT
                    </div>
                    <span className="font-normal text-sm text-gray-600 dark:text-gray-300">
                      Inverx Team
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Oct 24</span>
                </div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 leading-tight">
                  Welcome to Inverx!
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                  Thanks for joining! Let's get you set up with your new
                  distraction-free inbox...
                </p>
              </div>
              {/* <!-- Item 4 (Read) --> */}
              <div className="group relative p-4 cursor-pointer border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-bold">
                      NF
                    </div>
                    <span className="font-normal text-sm text-gray-600 dark:text-gray-300">
                      Netflix
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Oct 22</span>
                </div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 leading-tight">
                  New login detected on your account
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                  We noticed a new login to your account from a device in New
                  York...
                </p>
              </div>
              {/* <!-- Item 5 (Read) --> */}
              <div className="group relative p-4 cursor-pointer border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                      LI
                    </div>
                    <span className="font-normal text-sm text-gray-600 dark:text-gray-300">
                      LinkedIn
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Oct 20</span>
                </div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 leading-tight">
                  You appeared in 5 searches this week
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                  See who's looking at your profile and discover new
                  opportunities...
                </p>
              </div>
            </div>
          </div>
          {/* <!-- Reading Pane (Column 3) --> */}
          <div className="hidden lg:flex flex-1 flex-col bg-white dark:bg-[#121212] relative min-w-0">
            {/* <!-- Action Toolbar --> */}
            <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] z-10 sticky top-0 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors group"
                  title="Reply"
                >
                  <Reply className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  title="Reply All"
                >
                  <ReplyAll className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  title="Forward"
                >
                  <Forward className="w-5 h-5" />
                </button>
                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-600 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  title="Archive"
                >
                  <Archive className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  title="Mark as unread"
                >
                  <Mail className="w-5 h-5" />
                </button>
                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  title="Move to"
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xs mr-2">1 of 12</span>
                <button className="p-1.5 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-1.5 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* <!-- Email Content Scroll Area --> */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-12 py-10 max-w-5xl mx-auto w-full">
                {/* <!-- Header Section --> */}
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 pr-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                        Team Update: Q4 Goals
                      </h1>
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                          Work
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                          Important
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-300 hover:text-yellow-400 transition-colors">
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-sm"
                        data-alt="Alice Smith profile picture"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCZZZeXz2fzNt1XsJnwCboruktAg6K5TbIPvteu0GTYXcRO46Hr1X3XJqsRlJXUxFC5RUMX6Hi33c61IZiLyShRWzvHRUG60XoEwgiGJx2vd8SjZFSw8qjYz82n0IRvl78ZKLAEb54FvL-JiSz0vJ9Bc-A2hCFkFvGosw1NYmublkjQUQFrJBizyMwd_MH2RNXt_9xweUFbY0cB-I8-mLKHuiEGg0eTaTcO3tzXoR0l9nmbeXjBdIob6eC2wDaKD2Sa1Z9_PHV8J3M")',
                        }}
                      ></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-base">
                            Alice Smith
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            &lt;alice@inverx.pro&gt;
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <span>to</span>
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            me
                          </span>
                          ,
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            Team
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-gray-500 font-medium">
                        10:42 AM (2 hours ago)
                      </span>
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <Reply className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- Body Content --> */}
                <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-display">
                  <p className="mb-5">Hi Team,</p>
                  <p className="mb-5">
                    I hope everyone is having a great start to the week.
                  </p>
                  <p className="mb-5">
                    Following our strategy meeting last Tuesday, I've compiled the
                    finalized goals for Q4. We have ambitious targets this
                    quarter, focusing primarily on user retention and the new
                    mobile app launch.
                  </p>
                  <ul className="list-none pl-0 mb-6 space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-gray-900 dark:text-white">
                          Increase DAU by 15%:
                        </strong>{" "}
                        Focus on onboarding flow improvements and reducing
                        drop-off rates in the first 7 days.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-gray-900 dark:text-white">
                          Launch Mobile App v2.0:
                        </strong>{" "}
                        Target date is Nov 15th. All hands on deck for QA testing
                        starting next week.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-gray-900 dark:text-white">
                          CSAT Score &gt; 90:
                        </strong>{" "}
                        Implementation of new AI-driven support ticketing system
                        to reduce response times.
                      </span>
                    </li>
                  </ul>
                  <p className="mb-5">
                    Please review the attached PDF for a detailed breakdown of
                    KPIs per department. I'd like to get everyone's sign-off by
                    Friday EOD so we can hit the ground running next week.
                  </p>
                  <p className="mb-8">
                    Let me know if you have any questions or need clarification on
                    any points.
                  </p>
                  <div className="mt-8 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 w-full max-w-xs">
                    <p className="font-bold text-gray-900 dark:text-white">
                      Alice Smith
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                      VP of Product
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Inverx Inc.
                    </p>
                  </div>
                </div>
                {/* <!-- Attachments --> */}
                <div className="mt-10">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    1 Attachment
                  </h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all bg-white dark:bg-[#1a1a1a] shadow-sm group w-72">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          Q4_Goals_Final.pdf
                        </p>
                        <p className="text-xs text-gray-500">2.4 MB</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-500">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- Quick Reply Area --> */}
                <div className="mt-12 flex gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10 shrink-0"
                    data-alt="Current user profile picture"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRyR38gv-E7O0cyZyceVZzaQEIEeVBlr6Xwv4dbcb3s9ZAUvC0nX5y7vQLJYfwBd3RkqhbZSpeTBOzDFru9RiyrEqwEfuWswrJCqmEej2hmp5I2cAlkFaIypwIUSLZx2h8xBsqBpY_kxNquEPSiunUQr4WrvfH0sw4RoCcx8Deebf7lf5_IaYVODtz8EkRBU3aBsxsF1EEgIUHPSPdO0HQ2Y88T9sQCloo9j4tRexn9HQldttI4Jp8are1NeQltOM1KDLNTpbyGy8")',
                    }}
                  ></div>
                  <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-gray-400 transition-all">
                    <div className="p-4 cursor-text">
                      <p className="text-gray-400 text-sm">
                        Reply to Alice Smith...
                      </p>
                      {/* <div className="h-12"></div> <!-- Spacer for mock input area --> */}
                    </div>
                    <div className="flex justify-between items-center px-2 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 rounded-b-lg">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-white/10">
                          <Bold className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-white/10">
                          <Italic className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-white/10">
                          <LucideLink className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-white/10">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-white/10">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="bg-primary text-white dark:bg-white dark:text-primary px-4 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}