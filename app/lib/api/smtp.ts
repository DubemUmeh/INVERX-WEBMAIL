/**
 * SMTP API Client
 *
 * Frontend API client for SMTP configuration management.
 */

import { api } from "./client";

export type SmtpEncryption = "STARTTLS" | "SSL_TLS" | "NONE";

export interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username?: string;
  hasPassword: boolean;
  encryption: SmtpEncryption;
  requireTls: boolean;
  timeoutSeconds: number;
  fromEmail: string;
  fromName?: string;
  isDefault: boolean;
  lastTestedAt?: string;
  lastTestResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSmtpConfigDto {
  name: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  encryption: SmtpEncryption;
  requireTls?: boolean;
  timeoutSeconds?: number;
  fromEmail: string;
  fromName?: string;
  isDefault?: boolean;
}

export interface UpdateSmtpConfigDto {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  encryption?: SmtpEncryption;
  requireTls?: boolean;
  timeoutSeconds?: number;
  fromEmail?: string;
  fromName?: string;
  isDefault?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export const smtpApi = {
  /**
   * Get all SMTP configurations for the current user.
   */
  getAll: async (): Promise<SmtpConfig[]> => {
    return await api.get<SmtpConfig[]>("/smtp/configs");
  },

  /**
   * Get a single SMTP configuration by ID.
   */
  getById: async (id: string): Promise<SmtpConfig> => {
    return await api.get<SmtpConfig>(`/smtp/configs/${id}`);
  },

  /**
   * Create a new SMTP configuration.
   */
  create: async (config: CreateSmtpConfigDto): Promise<SmtpConfig> => {
    return await api.post<SmtpConfig>("/smtp/configs", config);
  },

  /**
   * Update an existing SMTP configuration.
   */
  update: async (
    id: string,
    config: UpdateSmtpConfigDto,
  ): Promise<SmtpConfig> => {
    return await api.patch<SmtpConfig>(`/smtp/configs/${id}`, config);
  },

  /**
   * Test SMTP connection.
   */
  testConnection: async (id: string): Promise<TestConnectionResult> => {
    return await api.post<TestConnectionResult>(`/smtp/configs/${id}/test`);
  },

  /**
   * Delete an SMTP configuration.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/smtp/configs/${id}`);
  },

  /**
   * Get recommended port for encryption mode.
   */
  getRecommendedPort: (encryption: SmtpEncryption): number => {
    switch (encryption) {
      case "STARTTLS":
        return 587;
      case "SSL_TLS":
        return 465;
      case "NONE":
        return 25;
      default:
        return 587;
    }
  },
};
