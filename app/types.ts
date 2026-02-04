// Shared interfaces matching backend DTOs

// --- Common ---

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// --- Auth ---

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  accountId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- Accounts ---

export interface Account {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  ownerId: string;
  createdAt: string;
}

export interface AccountMember {
  id: string;
  userId: string;
  accountId: string;
  role: "owner" | "admin" | "member";
  user: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

// --- Domains ---

export interface Domain {
  id: string;
  name: string;
  status: "active" | "pending" | "failed" | "expired";
  verificationStatus: "verified" | "unverified" | "pending";
  autoRenew: boolean;
  expiresAt?: string;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  lastCheckedAt?: string;
  createdAt: string;
  // Provider integrations (from new tables)
  cloudflare?: {
    zoneId: string;
    nameservers: string[];
    mode: "managed" | "external";
    status: string;
    lastSyncedAt?: string;
  };
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
  status?: "pending" | "active" | "error";
}

export interface DomainAddress {
  id: string;
  domainId: string;
  localPart: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

// --- Mail ---

export interface Mailbox {
  id: string;
  name: string;
  slug: string;
  type: "system" | "custom";
  color?: string;
  parentId?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  messageId: string; // Message-ID header
  subject: string;
  snippet: string;
  from: {
    name?: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  body?: {
    text?: string;
    html?: string;
  };
  hasAttachments: boolean;
  sentAt: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  mailboxId?: string;
  threadId?: string;
}

// --- Attachments ---

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl?: string; // Only present if signed URL generated
  status: "pending" | "ready" | "failed" | "deleted";
}

// --- Webhooks ---

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  lastDeliveryAt?: string;
  failureCount: number;
  secret?: string; // Only on create/reveal
}

// --- API Keys ---

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  lastUsedAt?: string;
  createdAt: string;
}
