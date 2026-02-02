import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  uuid,
  integer,
  bigint,
  jsonb,
  pgEnum,
  unique,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Helper for generating UUIDv7
const generateUuidv7 = () => {
  // Simple UUIDv7-like generator (you may want to use a proper library)
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  const randomPart = Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-7${randomPart.slice(0, 3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomPart.slice(4, 7)}-${randomPart.slice(7, 19)}`;
};

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member']);

export const domainStatusEnum = pgEnum('domain_status', [
  'active',
  'pending',
  'failed',
  'expired',
]);

export const domainVerificationStatusEnum = pgEnum(
  'domain_verification_status',
  ['verified', 'unverified', 'pending'],
);

export const mailboxTypeEnum = pgEnum('mailbox_type', ['system', 'custom']);

export const apiKeyStatusEnum = pgEnum('api_key_status', [
  'active',
  'revoked',
  'expired',
]);

export const webhookStatusEnum = pgEnum('webhook_status', [
  'active',
  'inactive',
  'failing',
]);

export const attachmentStatusEnum = pgEnum('attachment_status', [
  'pending',
  'ready',
  'failed',
  'deleted',
]);

// SMTP Encryption Modes
export const smtpEncryptionEnum = pgEnum('smtp_encryption', [
  'STARTTLS', // Port 587: Start unencrypted, upgrade via STARTTLS command
  'SSL_TLS', // Port 465: Immediate TLS handshake on connection
  'NONE', // Plaintext only - UNSAFE, for testing only
]);

// Brevo Enums
export const brevoConnectionStatusEnum = pgEnum('brevo_connection_status', [
  'active',
  'invalid',
  'disconnected',
]);

export const brevoDomainStatusEnum = pgEnum('brevo_domain_status', [
  'pending_dns',
  'verifying',
  'verified',
  'failed',
]);

export const brevoDnsModeEnum = pgEnum('brevo_dns_mode', [
  'cloudflare-managed',
  'manual',
]);

export const brevoSendingTierEnum = pgEnum('brevo_sending_tier', [
  'restricted',
  'standard',
]);

// SMTP Configurations - Multiple per user with encrypted credentials
export const smtpConfigurations = pgTable(
  'smtp_configurations',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(), // User-friendly label
    host: varchar('host', { length: 255 }).notNull(),
    port: integer('port').notNull(),
    username: varchar('username', { length: 255 }),
    // Password encrypted with AES-256-GCM (envelope encryption)
    passwordEncrypted: text('password_encrypted'),
    passwordIv: varchar('password_iv', { length: 32 }), // 16-byte IV as hex
    passwordTag: varchar('password_tag', { length: 32 }), // GCM auth tag as hex
    encryption: smtpEncryptionEnum('encryption').notNull().default('STARTTLS'),
    requireTls: boolean('require_tls').default(true), // Fail if STARTTLS unavailable
    timeoutSeconds: integer('timeout_seconds').default(30), // 5-120 range enforced in code
    fromEmail: text('from_email').notNull(), // Sender address for this config
    fromName: varchar('from_name', { length: 255 }),
    isDefault: boolean('is_default').default(false),
    lastTestedAt: timestamp('last_tested_at', { withTimezone: true }),
    lastTestResult: varchar('last_test_result', { length: 50 }), // 'success' | 'failed'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.userId, t.fromEmail)], // Each from email unique per user
);

// DNS Record type for Brevo domains
export interface BrevoDnsRecord {
  type: 'TXT' | 'CNAME';
  host: string;
  value: string;
  ttl?: number;
  purpose: 'dkim' | 'spf' | 'dmarc' | 'brevo-code';
}

// Brevo Connections - Per account, encrypted API key
export const brevoConnections = pgTable(
  'brevo_connections',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    // API key encrypted with AES-256-GCM (same as SMTP passwords)
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    apiKeyIv: varchar('api_key_iv', { length: 32 }).notNull(), // 16-byte IV as hex
    apiKeyTag: varchar('api_key_tag', { length: 32 }).notNull(), // GCM auth tag as hex
    status: brevoConnectionStatusEnum('status').default('active'),
    sendingTier: brevoSendingTierEnum('sending_tier').default('restricted'),
    email: text('email'), // Brevo account email for display
    dailySendCount: integer('daily_send_count').default(0),
    dailySendResetAt: timestamp('daily_send_reset_at', { withTimezone: true }),
    lastValidatedAt: timestamp('last_validated_at', { withTimezone: true }),
    isArchived: boolean('is_archived').default(false), // Soft delete
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.accountId)],
);

// Brevo Domains - Domains added via Brevo API
export const brevoDomains = pgTable(
  'brevo_domains',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    connectionId: uuid('connection_id')
      .notNull()
      .references(() => brevoConnections.id, { onDelete: 'cascade' }),
    domainName: varchar('domain_name', { length: 255 }).notNull(),
    brevoDomainId: varchar('brevo_domain_id', { length: 255 }),
    cloudflareZoneId: varchar('cloudflare_zone_id', { length: 255 }),
    dnsMode: brevoDnsModeEnum('dns_mode').default('manual'),
    status: brevoDomainStatusEnum('status').default('pending_dns'),
    dkimVerified: boolean('dkim_verified').default(false),
    spfVerified: boolean('spf_verified').default(false),
    dmarcVerified: boolean('dmarc_verified').default(false),
    dnsRecords: jsonb('dns_records').$type<BrevoDnsRecord[]>(), // Typed DNS records
    nameservers: text('nameservers').array(), // Cloudflare nameservers
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    isArchived: boolean('is_archived').default(false),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.connectionId, t.domainName)],
);

// Brevo Senders - Verified sender emails
export const brevoSenders = pgTable(
  'brevo_senders',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => brevoDomains.id, { onDelete: 'cascade' }),
    brevoSenderId: varchar('brevo_sender_id', { length: 255 }),
    email: text('email').notNull(),
    name: varchar('name', { length: 255 }),
    isVerified: boolean('is_verified').default(false),
    complaintCount: integer('complaint_count').default(0),
    isDisabled: boolean('is_disabled').default(false),
    disabledReason: varchar('disabled_reason', { length: 255 }),
    isArchived: boolean('is_archived').default(false),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.domainId, t.email)],
);

// Brevo Send Logs - Audit trail for all sends
export const brevoSendLogs = pgTable('brevo_send_logs', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => brevoConnections.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => brevoSenders.id, { onDelete: 'cascade' }),
  brevoMessageId: varchar('brevo_message_id', { length: 255 }),
  toEmail: text('to_email').notNull(),
  subject: text('subject'),
  status: varchar('status', { length: 20 }).notNull(), // 'success' | 'failed'
  errorMessage: text('error_message'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Users Table
export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  userId: uuid('user_id').defaultRandom().notNull().unique(), // Public facing UUIDv4
  email: text('email').notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  isVerified: boolean('is_verified').default(false),
  themePreference: varchar('theme_preference', { length: 20 }).default(
    'system',
  ),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Better-Auth Sessions
export const sessions = pgTable('sessions', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Better-Auth Accounts (OAuth connections)
export const authAccounts = pgTable('auth_accounts', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    withTimezone: true,
  }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Better-Auth Verifications
export const verifications = pgTable('verifications', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Accounts (Organizations)
export const accounts = pgTable('accounts', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  plan: varchar('plan', { length: 50 }).default('free'),
  billingEmail: text('billing_email'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Account Members
export const accountMembers = pgTable(
  'account_members',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').default('member'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.accountId, t.userId)],
);

// Domains
export const domains = pgTable(
  'domains',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    status: domainStatusEnum('status').default('pending'),
    verificationStatus: domainVerificationStatusEnum(
      'verification_status',
    ).default('unverified'),
    autoRenew: boolean('auto_renew').default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    dkimVerified: boolean('dkim_verified').default(false),
    spfVerified: boolean('spf_verified').default(false),
    dmarcVerified: boolean('dmarc_verified').default(false),
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.accountId, t.name)],
);

// DNS Records
export const dnsRecords = pgTable('dns_records', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  domainId: uuid('domain_id')
    .notNull()
    .references(() => domains.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  value: text('value').notNull(),
  ttl: integer('ttl').default(3600),
  priority: integer('priority'),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Domain Addresses (Aliases)
export const domainAddresses = pgTable(
  'domain_addresses',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
    localPart: varchar('local_part', { length: 255 }).notNull(),
    email: text('email').notNull(),
    displayName: varchar('display_name', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.domainId, t.localPart)],
);

// Contacts
export const contacts = pgTable('contacts', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Mailboxes
export const mailboxes = pgTable(
  'mailboxes',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    type: mailboxTypeEnum('type').default('custom'),
    color: varchar('color', { length: 7 }),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique().on(t.userId, t.slug),
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
    }),
  ],
);

// Messages
export const messages = pgTable('messages', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  accountId: uuid('account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  threadId: uuid('thread_id'),
  messageId: varchar('message_id', { length: 255 }).unique(),
  inReplyTo: varchar('in_reply_to', { length: 255 }),
  subject: text('subject'),
  snippet: text('snippet'),
  bodyText: text('body_text'),
  bodyHtml: text('body_html'),
  fromEmail: text('from_email').notNull(),
  fromName: varchar('from_name', { length: 255 }),
  toRecipients: text('to_recipients').array(),
  ccRecipients: text('cc_recipients').array(),
  bccRecipients: text('bcc_recipients').array(),
  replyTo: varchar('reply_to', { length: 255 }),
  hasAttachments: boolean('has_attachments').default(false),
  sizeBytes: integer('size_bytes').default(0),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Attachments
export const messageAttachments = pgTable('message_attachments', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 255 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  contentId: varchar('content_id', { length: 255 }),
  storageKey: text('storage_key').notNull(),
  checksum: varchar('checksum', { length: 64 }), // SHA-256 for integrity verification
  status: attachmentStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  finalizedAt: timestamp('finalized_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// User Messages (State)
export const userMessages = pgTable(
  'user_messages',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidv7()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    mailboxId: uuid('mailbox_id').references(() => mailboxes.id, {
      onDelete: 'set null',
    }),
    isRead: boolean('is_read').default(false),
    isStarred: boolean('is_starred').default(false),
    isArchived: boolean('is_archived').default(false),
    isDeleted: boolean('is_deleted').default(false),
    isDraft: boolean('is_draft').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.userId, t.messageId)],
);

// API Keys
export const apiKeys = pgTable('api_keys', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 255 }).notNull(),
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  scopes: text('scopes').array(),
  status: apiKeyStatusEnum('status').default('active'),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Webhooks
export const webhooks = pgTable('webhooks', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  secret: varchar('secret', { length: 255 }).notNull(),
  events: text('events').array().notNull(),
  status: webhookStatusEnum('status').default('active'),
  failureCount: integer('failure_count').default(0),
  lastDeliveryAt: timestamp('last_delivery_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Webhook Events
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  webhookId: uuid('webhook_id')
    .notNull()
    .references(() => webhooks.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 255 }).notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Waitlist Table
export const waitlist = pgTable('waitlist', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  name: varchar('name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidv7()),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 255 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }).notNull(),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 length
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accountMembers),
  contacts: many(contacts),
  messages: many(userMessages),
  apiKeys: many(apiKeys),
  smtpConfigurations: many(smtpConfigurations),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  owner: one(users, {
    fields: [accounts.ownerId],
    references: [users.id],
  }),
  members: many(accountMembers),
  domains: many(domains),
  apiKeys: many(apiKeys),
  webhooks: many(webhooks),
  auditLogs: many(auditLogs),
}));

export const accountMembersRelations = relations(accountMembers, ({ one }) => ({
  account: one(accounts, {
    fields: [accountMembers.accountId],
    references: [accounts.id],
  }),
  user: one(users, {
    fields: [accountMembers.userId],
    references: [users.id],
  }),
}));

export const domainsRelations = relations(domains, ({ one, many }) => ({
  account: one(accounts, {
    fields: [domains.accountId],
    references: [accounts.id],
  }),
  dnsRecords: many(dnsRecords),
  addresses: many(domainAddresses),
}));

export const dnsRecordsRelations = relations(dnsRecords, ({ one }) => ({
  domain: one(domains, {
    fields: [dnsRecords.domainId],
    references: [domains.id],
  }),
}));

export const domainAddressesRelations = relations(
  domainAddresses,
  ({ one }) => ({
    domain: one(domains, {
      fields: [domainAddresses.domainId],
      references: [domains.id],
    }),
  }),
);

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
}));

export const mailboxesRelations = relations(mailboxes, ({ one, many }) => ({
  user: one(users, {
    fields: [mailboxes.userId],
    references: [users.id],
  }),
  parent: one(mailboxes, {
    fields: [mailboxes.parentId],
    references: [mailboxes.id],
  }),
  messages: many(userMessages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  account: one(accounts, {
    fields: [messages.accountId],
    references: [accounts.id],
  }),
  attachments: many(messageAttachments),
  userMessages: many(userMessages),
}));

export const messageAttachmentsRelations = relations(
  messageAttachments,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageAttachments.messageId],
      references: [messages.id],
    }),
    account: one(accounts, {
      fields: [messageAttachments.accountId],
      references: [accounts.id],
    }),
  }),
);

export const userMessagesRelations = relations(userMessages, ({ one }) => ({
  user: one(users, {
    fields: [userMessages.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [userMessages.messageId],
    references: [messages.id],
  }),
  mailbox: one(mailboxes, {
    fields: [userMessages.mailboxId],
    references: [mailboxes.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  account: one(accounts, {
    fields: [apiKeys.accountId],
    references: [accounts.id],
  }),
  createdByUser: one(users, {
    fields: [apiKeys.createdBy],
    references: [users.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  account: one(accounts, {
    fields: [webhooks.accountId],
    references: [accounts.id],
  }),
  events: many(webhookEvents),
}));

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  account: one(accounts, {
    fields: [auditLogs.accountId],
    references: [accounts.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Brevo Relations
export const brevoConnectionsRelations = relations(
  brevoConnections,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [brevoConnections.accountId],
      references: [accounts.id],
    }),
    domains: many(brevoDomains),
    sendLogs: many(brevoSendLogs),
  }),
);

export const brevoDomainsRelations = relations(
  brevoDomains,
  ({ one, many }) => ({
    connection: one(brevoConnections, {
      fields: [brevoDomains.connectionId],
      references: [brevoConnections.id],
    }),
    senders: many(brevoSenders),
  }),
);

export const brevoSendersRelations = relations(brevoSenders, ({ one }) => ({
  domain: one(brevoDomains, {
    fields: [brevoSenders.domainId],
    references: [brevoDomains.id],
  }),
}));

export const brevoSendLogsRelations = relations(brevoSendLogs, ({ one }) => ({
  connection: one(brevoConnections, {
    fields: [brevoSendLogs.connectionId],
    references: [brevoConnections.id],
  }),
  sender: one(brevoSenders, {
    fields: [brevoSendLogs.senderId],
    references: [brevoSenders.id],
  }),
}));
