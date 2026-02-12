/**
 * Brevo API Client
 *
 * Frontend API client for Brevo email infrastructure integration.
 */

import { api } from "./client";

// Types
// Types
export type BrevoDnsMode = "cloudflare-managed" | "manual";
export type BrevoDomainStatus =
  | "pending_dns"
  | "verifying"
  | "verified"
  | "failed";
export type BrevoSendingTier = "restricted" | "standard" | string;

export interface BrevoDnsRecord {
  type: "TXT" | "CNAME";
  host: string;
  value: string;
  ttl?: number;
  purpose: "dkim" | "spf" | "dmarc" | "brevo-code";
}

export interface BrevoConnectionStatus {
  connected: boolean;
  status?: "active" | "invalid" | "disconnected";
  sendingTier?: BrevoSendingTier;
  email?: string;
  dailySendCount?: number;
  lastValidatedAt?: string;
  createdAt?: string;
  isCloudflareAvailable?: boolean;
}

export interface BrevoDomain {
  id: string;
  domainName: string;
  status: BrevoDomainStatus;
  dnsMode: BrevoDnsMode;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  dnsRecords?: BrevoDnsRecord[];
  nameservers?: string[];
  lastCheckedAt?: string;
  createdAt: string;
}

export interface BrevoSender {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  complaintCount: number;
  createdAt: string;
}

export interface ConnectBrevoDto {
  apiKey: string;
}

export interface CreateBrevoDomainDto {
  domainName: string;
  dnsMode?: BrevoDnsMode;
  existingDomainId?: string; // Reference to existing domain from Domain Management
}

// Available domain from Domain Management (can be used with Brevo)
export interface AvailableDomain {
  id: string;
  name: string;
  status: string;
  verificationStatus: string;
}

export interface CreateBrevoSenderDto {
  domainId: string;
  email: string;
  name?: string;
}

export interface SendBrevoEmailDto {
  senderId: string;
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface BrevoSendResult {
  messageId: string;
  success: boolean;
}

// Brevo Account Data types (direct from Brevo API)
export interface BrevoAccountDomainDnsRecord {
  type: "TXT" | "CNAME";
  host: string;
  value: string;
  verified: boolean;
}

export interface BrevoAccountDomain {
  id: string | number;
  domainName: string;
  authenticated: boolean;
  dnsRecords: {
    dkimRecord?: BrevoAccountDomainDnsRecord | null;
    dkim1Record?: BrevoAccountDomainDnsRecord | null;
    dkim2Record?: BrevoAccountDomainDnsRecord | null;
    brevoCode?: BrevoAccountDomainDnsRecord | null;
    dmarc_record?: BrevoAccountDomainDnsRecord | null; // Note: underscore from backend
  } | null;
}

export interface BrevoAccountSender {
  id: number;
  email: string;
  name: string;
  active: boolean;
}

export interface SendBrevoEmailWithSenderDto {
  senderEmail: string;
  senderName?: string;
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export const brevoApi = {
  // Connection
  getStatus: async (): Promise<BrevoConnectionStatus> => {
    return await api.get<BrevoConnectionStatus>("/brevo/status");
  },

  connect: async (
    dto: ConnectBrevoDto,
  ): Promise<{ id: string; status: string; email?: string }> => {
    return await api.post("/brevo/connect", dto);
  },

  disconnect: async (
    deleteAll: boolean = false,
  ): Promise<{ message: string }> => {
    return await api.delete(`/brevo/connect?deleteAll=${deleteAll}`);
  },

  // Domains
  listDomains: async (): Promise<BrevoDomain[]> => {
    return await api.get<BrevoDomain[]>("/brevo/domains");
  },

  getAvailableDomains: async (): Promise<AvailableDomain[]> => {
    return await api.get<AvailableDomain[]>("/brevo/available-domains");
  },

  addDomain: async (dto: CreateBrevoDomainDto): Promise<BrevoDomain> => {
    return await api.post<BrevoDomain>("/brevo/domains", dto);
  },

  getDomain: async (domainId: string): Promise<BrevoDomain> => {
    return await api.get<BrevoDomain>(`/brevo/domains/${domainId}`);
  },

  deleteDomain: async (domainId: string): Promise<{ message: string }> => {
    return await api.delete<{ message: string }>(`/brevo/domains/${domainId}`);
  },

  verifyDomain: async (
    domainId: string,
  ): Promise<{ verified: boolean; dkimVerified: boolean }> => {
    return await api.post(`/brevo/domains/${domainId}/verify`);
  },

  // Senders
  listSenders: async (domainId: string): Promise<BrevoSender[]> => {
    return await api.get<BrevoSender[]>(`/brevo/domains/${domainId}/senders`);
  },

  createSender: async (dto: CreateBrevoSenderDto): Promise<BrevoSender> => {
    return await api.post<BrevoSender>("/brevo/senders", dto);
  },

  deleteSender: async (senderId: string): Promise<{ message: string }> => {
    return await api.delete<{ message: string }>(`/brevo/senders/${senderId}`);
  },

  // Email Sending
  sendEmail: async (dto: SendBrevoEmailDto): Promise<BrevoSendResult> => {
    return await api.post<BrevoSendResult>("/brevo/send", dto);
  },

  sendEmailWithSender: async (
    dto: SendBrevoEmailWithSenderDto,
  ): Promise<BrevoSendResult> => {
    return await api.post<BrevoSendResult>("/brevo/send-with-sender", dto);
  },

  // Brevo Account Data (fetched directly from Brevo API)
  getAccountDomains: async (): Promise<BrevoAccountDomain[]> => {
    return await api.get<BrevoAccountDomain[]>("/brevo/account/domains");
  },

  getAccountSenders: async (): Promise<BrevoAccountSender[]> => {
    return await api.get<BrevoAccountSender[]>("/brevo/account/senders");
  },
};
