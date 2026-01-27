"use client";

import React from "react";
import { 
  Filter, 
  Archive, 
  Trash2, 
  Mail, 
  Reply, 
  ReplyAll, 
  Forward, 
  FolderOpen, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  MoreVertical, 
  CheckCircle, 
  FileText, 
  Download, 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Paperclip, 
  Image as ImageIcon, 
  ChevronDown
} from "lucide-react";

import { useEffect, useState } from 'react';
import { mailApi } from '@/lib/api';
import { Message } from '@/types';
import { toast } from 'sonner';
// import { formatDistanceToNow } from 'date-fns'; // Assuming date-fns is available or use native

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await mailApi.getMessages();
        // Handle response structure depending on API client (sometimes data is nested, sometimes direct)
        const data = Array.isArray(response) ? response : (response?.data || []);
        
        setMessages(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedMessage(data[0]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load messages');
        setMessages([]); // Ensure messages is array on error
      } finally {
        setIsLoading(false);
      }
    }
    loadMessages();
  }, []);

  const handleSelectMessage = async (msg: Message) => {
      setSelectedMessage(msg);
      // Mark as read if needed
      if (!msg.isRead) {
          try {
              await mailApi.markAsRead(msg.id);
              setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
          } catch (e) {
              console.error('Failed to mark as read');
          }
      }
  };

  if (isLoading) {
      return <div className="flex h-full items-center justify-center">Loading...</div>;
  }
  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Message List (Column 2) */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212]">
        {/* List Controls */}
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
        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <div 
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`group relative p-4 cursor-pointer border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors ${selectedMessage?.id === msg.id ? 'bg-gray-50 dark:bg-white/5' : ''}`}
            >
                {selectedMessage?.id === msg.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-webmail-primary"></div>
                )}
                <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {msg.from.name ? msg.from.name.substring(0,2) : msg.from.email.substring(0,2)}
                    </div>
                    <span className={`text-sm text-gray-900 dark:text-white ${!msg.isRead ? 'font-bold' : 'font-semibold'}`}>
                    {msg.from.name || msg.from.email}
                    </span>
                </div>
                <span className="text-xs text-gray-900 dark:text-white font-medium">
                    {new Date(msg.sentAt).toLocaleDateString()}
                </span>
                </div>
                <h4 className={`text-sm text-gray-900 dark:text-white mb-1 leading-tight ${!msg.isRead ? 'font-bold' : 'font-medium'}`}>
                {msg.subject}
                </h4>
                <p className="text-xs text-gray-500 dark:text-white/70 line-clamp-2 leading-relaxed">
                {msg.snippet}
                </p>
                {/* Actions on hover */}
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
          ))}
          {messages.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                  No messages found.
              </div>
          )}
        </div>
      </div>
      {/* Reading Pane (Column 3) */}
      <div className="hidden lg:flex flex-1 flex-col bg-white dark:bg-[#121212] relative min-w-0">
          {selectedMessage ? (
              <>
                {/* Action Toolbar */}
                <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] z-10 sticky top-0 shrink-0">
                <div className="flex items-center gap-1">
                    <button
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors group"
                    title="Reply"
                    >
                    <Reply className="w-5 h-5" />
                    </button>
                    {/* ... other toolbars buttons ... */}
                    <button
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete"
                    onClick={() => {
                        // Implement delete
                        toast.error("Delete not implemented yet")
                    }}
                    >
                    <Trash2 className="w-5 h-5" />
                    </button>
                </div>
                </div>

                {/* Email Content Scroll Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-12 py-10 max-w-5xl mx-auto w-full">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1 pr-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                    {selectedMessage.subject}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                    Work
                                    </span>
                                </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white uppercase">
                                    {selectedMessage.from.name ? selectedMessage.from.name.substring(0,2) : selectedMessage.from.email.substring(0,2)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white text-base">
                                        {selectedMessage.from.name}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        &lt;{selectedMessage.from.email}&gt;
                                    </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                    <span>to</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">
                                        {selectedMessage.to.join(', ')}
                                    </span>
                                    </div>
                                </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                <span className="text-sm text-gray-500 font-medium">
                                    {new Date(selectedMessage.sentAt).toLocaleString()}
                                </span>
                                </div>
                            </div>
                        </div>

                        {/* Body Content */}
                        <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-display">
                            {/* Render HTML or Text */}
                            {selectedMessage.body?.html ? (
                                <div dangerouslySetInnerHTML={{ __html: selectedMessage.body.html }} />
                            ) : (
                                <div className="whitespace-pre-wrap">{selectedMessage.body?.text || selectedMessage.snippet}</div>
                            )}
                        </div>
                    </div>
                </div>
              </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                Select a message to view
            </div>
          )}
      </div>
    </div>
  );
}
