"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  X, 
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
  Check,
  Loader2,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mailApi } from "@/lib/api/mail";
import { domainsApi } from "@/lib/api/domains";
import { smtpApi } from "@/lib/api/smtp";

interface EmailAddress {
  email: string;
  domainId?: string; // Optional for SMTP
  smtpId?: string;   // New field for SMTP
  displayName?: string;
  type: 'domain' | 'smtp';
}

export default function ComposePage() {
  const router = useRouter();
  
  // Form state
  const [fromEmail, setFromEmail] = useState("");
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  
  // UI state
  const [toInput, setToInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  
  // Available email addresses from verified domains
  const [availableAddresses, setAvailableAddresses] = useState<EmailAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch available email addresses (Domains + SMTP)
  useEffect(() => {
    async function fetchAddresses() {
      try {
        setLoadingAddresses(true);
        const [domains, smtpConfigs] = await Promise.all([
          domainsApi.getAll(),
          smtpApi.getAll().catch(() => []) // SMTP is optional, don't fail if fetching fails
        ]);
        
        // Collect all addresses
        const addresses: EmailAddress[] = [];

        // 1. Add SMTP addresses
        if (Array.isArray(smtpConfigs)) {
          for (const config of smtpConfigs) {
            addresses.push({
              email: config.fromEmail,
              smtpId: config.id,
              displayName: config.fromName || config.name,
              type: 'smtp'
            });
          }
        }
        
        // 2. Add Domain addresses
        if (Array.isArray(domains)) {
          for (const domain of domains) {
            if (domain.verificationStatus === "verified") {
              const domainAddresses = await domainsApi.getAddresses(domain.id);
              if (Array.isArray(domainAddresses)) {
                for (const addr of domainAddresses) {
                  // Avoid duplicates if SMTP matches domain address (SMTP takes precedence for sending preference usually, 
                  // but here we just want unique options. If they are the same email, we might want to show both or merge.
                  // For simplicity, let's dedup by email)
                  if (!addresses.some(a => a.email === addr.email)) {
                    addresses.push({
                      email: addr.email,
                      domainId: domain.id,
                      displayName: addr.displayName,
                      type: 'domain'
                    });
                  }
                }
              }
            }
          }
        }
        
        setAvailableAddresses(addresses);
        
        // Set default from email if available and not set
        if (!fromEmail && addresses.length > 0) {
          setFromEmail(addresses[0].email);
        }
      } catch (err) {
        console.error("Failed to fetch email addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    
    fetchAddresses();
  }, []);

  // Handle adding recipient
  const addRecipient = (type: "to" | "cc" | "bcc", email: string) => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    
    if (type === "to" && !toRecipients.includes(trimmed)) {
      setToRecipients([...toRecipients, trimmed]);
      setToInput("");
    } else if (type === "cc" && !ccRecipients.includes(trimmed)) {
      setCcRecipients([...ccRecipients, trimmed]);
      setCcInput("");
    } else if (type === "bcc" && !bccRecipients.includes(trimmed)) {
      setBccRecipients([...bccRecipients, trimmed]);
      setBccInput("");
    }
  };

  // Handle removing recipient
  const removeRecipient = (type: "to" | "cc" | "bcc", email: string) => {
    if (type === "to") {
      setToRecipients(toRecipients.filter((e) => e !== email));
    } else if (type === "cc") {
      setCcRecipients(ccRecipients.filter((e) => e !== email));
    } else if (type === "bcc") {
      setBccRecipients(bccRecipients.filter((e) => e !== email));
    }
  };

  // Handle key press in recipient input
  const handleRecipientKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "to" | "cc" | "bcc",
    value: string
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(type, value);
    }
  };

  // Get email body from contentEditable div
  const getEmailBody = () => {
    const editor = document.querySelector(".editor-textarea") as HTMLElement;
    if (editor) {
      return {
        bodyText: editor.innerText,
        bodyHtml: editor.innerHTML,
      };
    }
    return { bodyText, bodyHtml };
  };

  // Send email
  const handleSend = async () => {
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!fromEmail) {
      setError("Please select a sender email address");
      return;
    }
    
    if (toRecipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }
    
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }
    
    const { bodyText: text, bodyHtml: html } = getEmailBody();
    
    if (!text.trim()) {
      setError("Please enter a message body");
      return;
    }
    
    setIsSending(true);
    
    try {
      const result = await mailApi.sendMessage({
        from: fromEmail,
        to: toRecipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject: subject,
        bodyText: text,
        bodyHtml: html,
      });
      
      setSuccess("Email sent successfully!");
      
      // Redirect to sent folder after a short delay
      setTimeout(() => {
        router.push("/mail/sent");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    setError(null);
    setIsSavingDraft(true);
    
    const { bodyText: text, bodyHtml: html } = getEmailBody();
    
    try {
      await mailApi.createDraft({
        to: toRecipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        subject: subject,
        bodyText: text,
        bodyHtml: html,
      });
      
      setSuccess("Draft saved!");
      
      // Clear success after a few seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Discard and go back
  const handleDiscard = () => {
    if (
      toRecipients.length > 0 ||
      subject.trim() ||
      getEmailBody().bodyText.trim()
    ) {
      if (!confirm("Discard this message?")) return;
    }
    router.back();
  };

  // Get initials for avatar
  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-full flex flex-col font-display selection:bg-black selection:text-white overflow-y-auto">
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Main Composer */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Page Heading */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-webmail-primary dark:text-white tracking-tight">
              New Message
            </h1>
            {success && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {success}
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Composer Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col flex-1 min-h-[600px]">
            {/* Fields Section */}
            <div className="px-6 py-4 space-y-4 border-b border-neutral-100 dark:border-neutral-800">
              {/* From Field */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  From
                </label>
                <div className="relative group">
                  <div className="flex items-center gap-2 w-full">
                    {loadingAddresses ? (
                      <span className="text-sm text-neutral-500">Loading addresses...</span>
                    ) : availableAddresses.length === 0 ? (
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        No verified email addresses. Please add an address to a verified domain.
                      </span>
                    ) : (
                      <>
                        <Select value={fromEmail} onValueChange={setFromEmail}>
                          <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto bg-transparent focus:ring-0 text-webmail-primary dark:text-white font-medium text-sm gap-2">
                            <SelectValue placeholder="Select email" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAddresses.map((addr) => (
                              <SelectItem key={addr.email} value={addr.email}>
                                <div className="flex items-center justify-between w-full min-w-[200px]">
                                  <span>
                                    {addr.displayName
                                      ? `${addr.displayName} <${addr.email}>`
                                      : addr.email}
                                  </span>
                                  {addr.type === 'smtp' && (
                                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wider">
                                      SMTP
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Status Indicator */}
                        {availableAddresses.find(a => a.email === fromEmail)?.type === 'smtp' ? (
                          <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-100 dark:border-indigo-900">
                            <Server className="w-3.5 h-3.5" />
                            <span>SMTP</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100 dark:border-green-900">
                            <Check className="w-3.5 h-3.5 fill-current" />
                            <span>Verified</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* To Field */}
              <div className="grid grid-cols-[80px_1fr] items-start gap-4">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">
                  To
                </label>
                <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                  {toRecipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 group cursor-default"
                    >
                      <div className="size-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {getInitials(email)}
                      </div>
                      <span className="text-sm text-webmail-primary dark:text-white">
                        {email}
                      </span>
                      <button
                        onClick={() => removeRecipient("to", email)}
                        className="hover:text-red-500 text-neutral-400 transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <input
                    className="flex-1 min-w-[120px] bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-neutral-400 text-webmail-primary dark:text-white h-8 outline-none"
                    placeholder="Add recipients..."
                    type="email"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    onKeyDown={(e) => handleRecipientKeyDown(e, "to", toInput)}
                    onBlur={() => {
                      if (toInput.trim()) addRecipient("to", toInput);
                    }}
                  />
                  <div className="ml-auto flex gap-3 text-sm text-neutral-500 font-medium">
                    <button
                      onClick={() => setShowCc(!showCc)}
                      className={`hover:text-webmail-primary dark:hover:text-white transition-colors ${
                        showCc ? "text-webmail-primary dark:text-white" : ""
                      }`}
                    >
                      Cc
                    </button>
                    <button
                      onClick={() => setShowBcc(!showBcc)}
                      className={`hover:text-webmail-primary dark:hover:text-white transition-colors ${
                        showBcc ? "text-webmail-primary dark:text-white" : ""
                      }`}
                    >
                      Bcc
                    </button>
                  </div>
                </div>
              </div>

              {/* Cc Field */}
              {showCc && (
                <div className="grid grid-cols-[80px_1fr] items-start gap-4">
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">
                    Cc
                  </label>
                  <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                    {ccRecipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700"
                      >
                        <span className="text-sm text-webmail-primary dark:text-white">
                          {email}
                        </span>
                        <button
                          onClick={() => removeRecipient("cc", email)}
                          className="hover:text-red-500 text-neutral-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <input
                      className="flex-1 min-w-[120px] bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-neutral-400 text-webmail-primary dark:text-white h-8 outline-none"
                      placeholder="Add Cc..."
                      type="email"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => handleRecipientKeyDown(e, "cc", ccInput)}
                      onBlur={() => {
                        if (ccInput.trim()) addRecipient("cc", ccInput);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bcc Field */}
              {showBcc && (
                <div className="grid grid-cols-[80px_1fr] items-start gap-4">
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">
                    Bcc
                  </label>
                  <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                    {bccRecipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700"
                      >
                        <span className="text-sm text-webmail-primary dark:text-white">
                          {email}
                        </span>
                        <button
                          onClick={() => removeRecipient("bcc", email)}
                          className="hover:text-red-500 text-neutral-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <input
                      className="flex-1 min-w-[120px] bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-neutral-400 text-webmail-primary dark:text-white h-8 outline-none"
                      placeholder="Add Bcc..."
                      type="email"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      onKeyDown={(e) =>
                        handleRecipientKeyDown(e, "bcc", bccInput)
                      }
                      onBlur={() => {
                        if (bccInput.trim()) addRecipient("bcc", bccInput);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Subject Field */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-4 pt-2">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Subject
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 text-lg font-semibold focus:ring-0 placeholder:text-neutral-300 text-webmail-primary dark:text-white outline-none"
                  type="text"
                  placeholder="Enter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="px-6 py-2 bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Bold"
              >
                <Bold className="w-5 h-5" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Italic"
              >
                <Italic className="w-5 h-5" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Underline"
              >
                <Underline className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="List"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Attach File"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Insert Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <div className="ml-auto text-xs text-neutral-400">
                Markdown supported
              </div>
            </div>

            {/* Rich Text Editor Area */}
            <div className="flex-1 p-6 overflow-y-auto cursor-text">
              <div
                className="editor-textarea outline-none h-full w-full text-base leading-relaxed text-neutral-800 dark:text-neutral-200"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Write your message..."
              ></div>
            </div>

            {/* Bottom Action Bar */}
            <div className="px-6 py-4 bg-white dark:bg-surface-dark border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={isSending || availableAddresses.length === 0}
                  className="bg-black dark:bg-white dark:text-black hover:bg-black/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-black/10 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send
                      <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-lg font-medium border border-neutral-200 dark:border-neutral-700 transition-colors disabled:opacity-50"
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </button>
              </div>
              <button
                onClick={handleDiscard}
                className="text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2.5 rounded-lg transition-colors"
                title="Discard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
