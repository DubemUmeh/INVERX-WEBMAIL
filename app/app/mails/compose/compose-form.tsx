"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  X,
  Check, 
  Loader2, 
  Server,
  PenBox 
} from "lucide-react";
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
import { brevoApi } from "@/lib/api/brevo";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-md" />
});

interface EmailAddress {
  id: string;
  email: string;
  domainId?: string; // Optional for SMTP
  smtpId?: string;   // New field for SMTP
  displayName?: string;
  type: 'domain' | 'smtp' | 'brevo';
  disabled?: boolean;
  disabledReason?: string;
}

export function ComposeForm() {
  const router = useRouter();
  
  // Grouped Form state
  const [formState, setFormState] = useState({
    fromEmail: "",
    toRecipients: [] as string[],
    ccRecipients: [] as string[],
    bccRecipients: [] as string[],
    subject: "",
    bodyText: "",
    bodyHtml: "",
  });
  
  // UI state
  const [toInput, setToInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  
  // Available email addresses from verified domains and connected accounts
  const [availableAddresses, setAvailableAddresses] = useState<EmailAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // Status state
  const [status, setStatus] = useState({
    isSending: false,
    isSavingDraft: false,
    error: null as string | null,
    success: null as string | null,
    editorKey: 0,
  });

  // Fetch available email addresses (Domains + SMTP + Brevo)
  useEffect(() => {
    async function fetchAddresses() {
      try {
        setLoadingAddresses(true);
        const [domains, smtpConfigs, brevoStatus] = await Promise.all([
          domainsApi.getAll(),
          smtpApi.getAll().catch(() => []), // SMTP is optional
          brevoApi.getStatus().catch(() => ({ connected: false })) // Brevo is optional
        ]);
        
        // Collect all addresses
        const addresses: EmailAddress[] = [];

        // 1. Add SMTP addresses
        if (Array.isArray(smtpConfigs)) {
          for (const config of smtpConfigs) {
            addresses.push({
              id: `smtp-${config.id}`,
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
                  if (!addresses.some(a => a.email === addr.email && a.type === 'domain')) {
                    addresses.push({
                      id: `domain-${domain.id}-${addr.email}`,
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

        // 3. Add Brevo addresses
        if (brevoStatus.connected) {
          try {
            const [brevoSenders, brevoDomains] = await Promise.all([
              brevoApi.getAccountSenders(),
              brevoApi.getAccountDomains()
            ]);
            console.log('available senders: ', brevoSenders);
            console.log('available domains: ', brevoDomains);

            for (const sender of brevoSenders) {
              // Only include active senders
              if (!sender.active) continue;

              // Check if domain is authenticated
              const senderDomain = sender.email.split('@')[1];
              const domainInfo = brevoDomains.find(d => d.domainName === senderDomain);
              
              const isAuthenticated = domainInfo?.authenticated || false;
              
              // Allow duplicates if different type (e.g. SMTP vs Brevo)
              // We use unique ID to distinguish
              const id = `brevo-${sender.email}`;
              
              if (!addresses.some(a => a.id === id)) {
                addresses.push({
                  id,
                  email: sender.email,
                  displayName: sender.name,
                  type: 'brevo',
                  disabled: !isAuthenticated,
                  disabledReason: !isAuthenticated ? 'Domain verification pending' : undefined
                });
              }
            }
          } catch (e) {
            console.error("Failed to fetch Brevo senders:", e);
          }
        }
        
        setAvailableAddresses(addresses);
        
        // Set default from email if available and not set
        if (!formState.fromEmail && addresses.length > 0) {
          // Default to first active non-disabled address if possible
          const defaultAddr = addresses.find(a => !a.disabled) || addresses[0];
          setFormState(prev => ({ ...prev, fromEmail: defaultAddr.id }));
        }
      } catch (err) {
        console.error("Failed to fetch email addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    
    fetchAddresses();
  }, [formState.fromEmail]);

  // Handle adding recipient
  const addRecipient = React.useCallback((type: "to" | "cc" | "bcc", email: string) => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    
    const fieldMap = {
      to: "toRecipients",
      cc: "ccRecipients",
      bcc: "bccRecipients"
    } as const;

    const field = fieldMap[type];

    if (!formState[field].includes(trimmed)) {
      setFormState(prev => ({
        ...prev,
        [field]: [...prev[field], trimmed]
      }));
      if (type === "to") setToInput("");
      else if (type === "cc") setCcInput("");
      else if (type === "bcc") setBccInput("");
    }
  }, [formState]);

  // Handle removing recipient
  const removeRecipient = React.useCallback((type: "to" | "cc" | "bcc", email: string) => {
    const fieldMap = {
      to: "toRecipients",
      cc: "ccRecipients",
      bcc: "bccRecipients"
    } as const;

    const field = fieldMap[type];
    
    setFormState(prev => ({
      ...prev,
      [field]: prev[field].filter((e) => e !== email)
    }));
  }, []);

  // Handle key press in recipient input
  const handleRecipientKeyDown = React.useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "to" | "cc" | "bcc",
    value: string
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(type, value);
    }
  }, [addRecipient]);

  // Handle editor change
  const handleEditorChange = React.useCallback((html: string, text: string) => {
    setFormState(prev => {
      // Only update if content actually changed to avoid unnecessary renders
      if (prev.bodyHtml === html && prev.bodyText === text) return prev;
      return { ...prev, bodyHtml: html, bodyText: text };
    });
  }, []);




  // Send email
  const handleSend = async () => {
    setStatus(prev => ({ ...prev, error: null, success: null }));
    
    // Validation
    if (!formState.fromEmail) {
      setStatus(prev => ({ ...prev, error: "Please select a sender email address" }));
      return;
    }
    
    if (formState.toRecipients.length === 0) {
      setStatus(prev => ({ ...prev, error: "Please add at least one recipient" }));
      return;
    }
    
    if (!formState.subject.trim()) {
      setStatus(prev => ({ ...prev, error: "Please enter a subject" }));
      return;
    }
    
    if (!formState.bodyText.trim()) {
      setStatus(prev => ({ ...prev, error: "Please enter a message body" }));
      return;
    }
    
    setStatus(prev => ({ ...prev, isSending: true }));
    
    try {
      // Find selected sender by ID
      // formState.fromEmail now holds the ID (e.g. "brevo-email@example.com")
      const selectedSender = availableAddresses.find(a => a.id === formState.fromEmail);
      
      if (!selectedSender) {
        // Fallback for safety or if ID scheme changed
        console.error("Selected sender not found by ID:", formState.fromEmail);
        setStatus(prev => ({ ...prev, error: "Invalid sender selection" }));
        return;
      }

      const senderEmail = selectedSender.email;
      const senderDisplayName = selectedSender.displayName;
      const senderType = selectedSender.type || 'domain';

      if (senderType === 'brevo') {
        await brevoApi.sendEmailWithSender({
          senderEmail: senderEmail,
          senderName: senderDisplayName,
          to: formState.toRecipients[0], // Brevo sends individually or handles batch differently, but here we assume simple send. For multiple recipients we might need loop or check API. Standard mailApi handles list.
          // Note: Our backend sendEmailWithSender takes 'to' as string. 
          // If we have multiple recipients, we should probably loop or join. 
          // Let's assume singular 'to' for initial brevo impl or just take first one as per interface mismatch risk.
          // Actually, our API takes 'to' string. If we want multiple, we need to iterate.
          // Let's iterate for safety if multiple recipients.
          subject: formState.subject,
          htmlContent: formState.bodyHtml,
          textContent: formState.bodyText,
        });

        // If multiple recipients for Brevo, we'd need loop.
        // But let's check mailApi.sendMessage implementation. It likely handles array.
        // For Brevo, if we want to support multiple, we should likely update backend to accept array or loop here.
        // For now, let's keep it simple and assume single TO for MVP or just send to all via loop if needed.
        // Actually, mailApi.sendMessage takes 'to: string[]'.
        // Let's update backend DTO to match or handle here.
        // Wait, backend 'sendEmailWithSender' takes 'to: string'.
        // So I must loop here for Brevo if multiple recipients.
        
        if (formState.toRecipients.length > 1) {
          // Send to others
          const otherRecipients = formState.toRecipients.slice(1);
          await Promise.all(otherRecipients.map(to => 
            brevoApi.sendEmailWithSender({
              senderEmail: senderEmail,
              senderName: senderDisplayName,
              to: to,
              subject: formState.subject,
              htmlContent: formState.bodyHtml,
              textContent: formState.bodyText,
            })
          ));
        }

      } else {
        // Domain or SMTP sending
        // Pass the extra params if SMTP
        await mailApi.sendMessage({
          from: senderEmail, // Use the actual email
          to: formState.toRecipients,
          cc: formState.ccRecipients,
          bcc: formState.bccRecipients,
          subject: formState.subject,
          text: formState.bodyText,
          html: formState.bodyHtml,
          domainId: selectedSender.domainId, // Pass domainId if available
          smtpConfigId: selectedSender.smtpId, // Pass smtpId if available
        });
      }
      
      setStatus(prev => ({ 
        ...prev, 
        success: "Email sent successfully!",
        editorKey: prev.editorKey + 1
      }));

      // Reset form
      setFormState({
        fromEmail: availableAddresses[0]?.id || "", // Reset to ID
        toRecipients: [],
        ccRecipients: [],
        bccRecipients: [],
        subject: "",
        bodyText: "",
        bodyHtml: "",
      });

      // Redirect to sent folder after a short delay
      setTimeout(() => {
        router.push("/mails/sent");
      }, 1500);
    } catch (err: any) {
      setStatus(prev => ({ ...prev, error: err.message || "Failed to send email. Please try again." }));
    } finally {
      setStatus(prev => ({ ...prev, isSending: false }));
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    setStatus(prev => ({ ...prev, error: null }));
    setStatus(prev => ({ ...prev, isSavingDraft: true }));
    
    try {
      await mailApi.createDraft({
        to: formState.toRecipients,
        cc: formState.ccRecipients.length > 0 ? formState.ccRecipients : undefined,
        subject: formState.subject,
        bodyText: formState.bodyText,
        bodyHtml: formState.bodyHtml,
      });
      
      setStatus(prev => ({ ...prev, success: "Draft saved!" }));
      
      // Clear success after a few seconds
      setTimeout(() => setStatus(prev => ({ ...prev, success: null })), 3000);
    } catch (err: any) {
      setStatus(prev => ({ ...prev, error: err.message || "Failed to save draft. Please try again." }));
    } finally {
      setStatus(prev => ({ ...prev, isSavingDraft: false }));
    }
  };

  // Discard and go back
  const handleDiscard = () => {
    if (
      formState.toRecipients.length > 0 ||
      formState.subject.trim() ||
      formState.bodyText.trim()
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
    <div className="bg-background text-slate-100 dark:text-white h-full flex flex-col font-display selection:bg-gray-100 selection:text-black overflow-y-auto overflow-x-hidden">
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-2 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Main Composer */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Page Heading */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-webmail-primary dark:text-white tracking-tight">
              New Message
            </h1>
            {status.success && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {status.success}
              </span>
            )}
          </div>

          {/* Error Message */}
          {status.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {status.error}
            </div>
          )}

          {/* Composer Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col flex-1 min-h-[600px]">
            {/* Fields Section */}
            <div className="px-2 md:px-6 py-4 space-y-4 border-b border-neutral-100 dark:border-neutral-800 overflow-x-clip">
              {/* From Field */}
              <div className="grid grid-cols-[50px_1fr] md:grid-cols-[80px_1fr] items-center gap-2 md:gap-4">
                <label className="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  From
                </label>
                <div className="relative group flex items-start justify-start">
                  <div className="flex items-center gap-2 w-full">
                    {loadingAddresses ? (
                      <span className="text-sm text-neutral-500">Loading addresses...</span>
                    ) : availableAddresses.length === 0 ? (
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        No verified email addresses. Please add an address to a verified domain.
                      </span>
                    ) : (
                      <>
                        <Select 
                          value={formState.fromEmail} 
                          onValueChange={(val) => setFormState(prev => ({ ...prev, fromEmail: val }))}
                        >
                          <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto bg-transparent focus:ring-0 text-webmail-primary dark:text-white font-medium text-xs md:text-sm gap-2">
                            <SelectValue placeholder="Select email" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAddresses.map((addr) => (
                              <SelectItem key={addr.id} value={addr.id} disabled={addr.disabled}>
                                <div className="flex items-center justify-between w-full min-w-[200px] opacity-100">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs md:text-sm ${addr.disabled ? "text-neutral-400 dark:text-neutral-500" : ""}`}>
                                      {addr.displayName
                                        ? `${addr.displayName} <${addr.email}>`
                                        : addr.email}
                                    </span>
                                    {addr.disabled && (
                                      <span className="text-[10px] text-orange-500 border border-orange-200 bg-orange-50 px-1 rounded">
                                        {addr.disabledReason}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    {addr.type === 'smtp' && (
                                      <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded ml-0.5 md:ml-2 uppercase tracking-tighter md:tracking-wider">
                                        SMTP
                                      </span>
                                    )}
                                    {addr.type === 'brevo' && (
                                      <span className={`text-[10px] px-0.5 md:px-1.5 py-0.5 rounded ml-2 uppercase tracking-wider ${addr.disabled ? 'bg-neutral-100 text-neutral-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-500'}`}>
                                        Brevo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Status Indicator */}
                        {(() => {
                           // Look up by ID instead of email
                          const selected = availableAddresses.find(a => a.id === formState.fromEmail);
                          const type = selected?.type;
                          
                          if (type === 'smtp') {
                            return (
                              <div className="hidden md:flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-100 dark:border-indigo-900">
                                <Server className="w-3.5 h-3.5" />
                                <span>SMTP</span>
                              </div>
                            );
                          } else if (type === 'brevo') {
                            return (
                              <div className="hidden md:flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-900">
                                <Send className="w-3.5 h-3.5" />
                                <span>Brevo</span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100 dark:border-green-900">
                                <Check className="w-3.5 h-3.5 fill-current" />
                                <span>Verified</span>
                              </div>
                            );
                          }
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* To Field */}
              <div className="grid grid-cols-[50px_1fr] md:grid-cols-[80px_1fr] items-start gap-2 md:gap-4">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">
                  To
                </label>
                <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                  {formState.toRecipients.map((email) => (
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
                <div className="grid grid-cols-[50px_1fr] md:grid-cols-[80px_1fr] items-start gap-2 md:gap-4">
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">
                    Cc
                  </label>
                  <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                    {formState.ccRecipients.map((email) => (
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
                <div className="grid grid-cols-[50px_1fr] md:grid-cols-[80px_1fr] items-start gap-2 md:gap-4">
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 pt-1.5">
                    Bcc
                  </label>
                  <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                    {formState.bccRecipients.map((email) => (
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
              <div className="grid grid-cols-[50px_1fr] md:grid-cols-[80px_1fr] items-center gap-4 pt-2">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Subject
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 text-lg font-semibold focus:ring-0 placeholder:text-neutral-300 text-webmail-primary dark:text-white outline-none"
                  type="text"
                  placeholder="Enter subject..."
                  value={formState.subject}
                  onChange={(e) => setFormState(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
            </div>

            {/* Rich Text Editor Area */}
            <div className="w-full flex flex-col items-center justify-start overflow-hidden">
              <RichTextEditor 
                key={status.editorKey}
                content={formState.bodyHtml}
                onChange={handleEditorChange}
              />
            </div>

            {/* Bottom Action Bar */}
            <div className="px-6 py-4 bg-primary-foreground border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={status.isSending || availableAddresses.length === 0}
                  className="bg-black dark:bg-white dark:text-black hover:bg-black/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-black/10 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.isSending ? (
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
                  disabled={status.isSavingDraft}
                  className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-lg font-medium border border-neutral-200 dark:border-neutral-700 transition-colors disabled:opacity-50"
                >
                  {status.isSavingDraft ? (
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
