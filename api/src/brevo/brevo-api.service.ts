/**
 * Brevo API Service
 *
 * Low-level HTTP client for Brevo API endpoints.
 * Handles all direct communication with Brevo's REST API.
 */

import { Injectable, Logger } from '@nestjs/common';

const BREVO_API_BASE = 'https://api.brevo.com/v3';

export interface BrevoAccountInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  plan?: {
    type: string;
    credits: number;
    creditsType: string;
  }[];
}

export interface BrevoSmtpStats {
  requests: number;
  delivered: number;
  hardBounces: number;
  softBounces: number;
  blocked: number;
  spamReports: number;
  invalid: number;
}

export interface BrevoDomainDnsRecord {
  type: 'TXT' | 'CNAME';
  host_name: string;
  value: string;
  status: boolean;
}

export interface BrevoDomainResponse {
  id: number;
  domain_name: string;
  authenticated: boolean;
  dns_records?: {
    dkim_record?: BrevoDomainDnsRecord; // Legacy format
    dkim1Record?: BrevoDomainDnsRecord; // New format - first DKIM
    dkim2Record?: BrevoDomainDnsRecord; // New format - second DKIM
    brevo_code?: BrevoDomainDnsRecord;
    dmarc_record?: BrevoDomainDnsRecord;
  };
}

export interface BrevoSenderResponse {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

export interface BrevoSendEmailRequest {
  sender: { email: string; name?: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface BrevoSendEmailResponse {
  messageId: string;
}

@Injectable()
export class BrevoApiService {
  private readonly logger = new Logger(BrevoApiService.name);

  /**
   * Make authenticated request to Brevo API
   */
  private async request<T>(
    apiKey: string,
    method: string,
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${BREVO_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // ignore JSON parse error
      }

      this.logger.error(`Brevo API error: ${response.status} - ${errorText}`);

      // Handle specific IP authorization error
      if (
        response.status === 401 &&
        errorJson?.code === 'unauthorized' &&
        (errorJson?.message || '').includes('unrecognised IP address')
      ) {
        throw new Error(
          `Brevo IP Restricted: Access from this IP address is blocked. Please authorize this IP in your Brevo settings: https://app.brevo.com/security/authorised_ips`,
        );
      }

      const errorMessage = errorJson?.message || errorText;
      throw new Error(`Brevo API error: ${response.status} - ${errorMessage}`);
    }

    // Some endpoints return no content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Validate API key by fetching account info
   */
  async getAccount(apiKey: string): Promise<BrevoAccountInfo> {
    return this.request<BrevoAccountInfo>(apiKey, 'GET', '/account');
  }

  /**
   * Get SMTP sending statistics for today
   */
  async getSmtpStatistics(apiKey: string): Promise<BrevoSmtpStats> {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    return this.request<BrevoSmtpStats>(
      apiKey,
      'GET',
      `/smtp/statistics/aggregatedReport?startDate=${today}&endDate=${today}`,
    );
  }

  /**
   * Create a domain in Brevo
   */
  async createDomain(
    apiKey: string,
    domainName: string,
  ): Promise<BrevoDomainResponse> {
    return this.request<BrevoDomainResponse>(
      apiKey,
      'POST',
      '/senders/domains',
      {
        name: domainName,
      },
    );
  }

  /**
   * Get domain details including DNS records
   */
  async getDomain(
    apiKey: string,
    domainName: string,
  ): Promise<BrevoDomainResponse> {
    return this.request<BrevoDomainResponse>(
      apiKey,
      'GET',
      `/senders/domains/${encodeURIComponent(domainName)}`,
    );
  }

  /**
   * Trigger domain authentication check
   */
  async authenticateDomain(
    apiKey: string,
    domainName: string,
  ): Promise<BrevoDomainResponse> {
    return this.request<BrevoDomainResponse>(
      apiKey,
      'PUT',
      `/senders/domains/${encodeURIComponent(domainName)}/authenticate`,
    );
  }

  /**
   * List all domains
   */
  async listDomains(
    apiKey: string,
  ): Promise<{ domains: BrevoDomainResponse[] }> {
    return this.request<{ domains: BrevoDomainResponse[] }>(
      apiKey,
      'GET',
      '/senders/domains',
    );
  }

  /**
   * Create a sender email
   */
  async createSender(
    apiKey: string,
    email: string,
    name?: string,
  ): Promise<BrevoSenderResponse> {
    return this.request<BrevoSenderResponse>(apiKey, 'POST', '/senders', {
      email,
      name: name || email.split('@')[0],
    });
  }

  /**
   * List all senders
   */
  async listSenders(
    apiKey: string,
  ): Promise<{ senders: BrevoSenderResponse[] }> {
    return this.request<{ senders: BrevoSenderResponse[] }>(
      apiKey,
      'GET',
      '/senders',
    );
  }

  /**
   * Delete a domain from Brevo
   */
  async deleteDomain(apiKey: string, domainName: string): Promise<void> {
    await this.request(
      apiKey,
      'DELETE',
      `/senders/domains/${encodeURIComponent(domainName)}`,
    );
  }

  /**
   * Delete a sender email from Brevo
   */
  async deleteSender(apiKey: string, senderId: number): Promise<void> {
    await this.request(apiKey, 'DELETE', `/senders/${senderId}`);
  }

  /**
   * Send email via Brevo
   */
  async sendEmail(
    apiKey: string,
    request: BrevoSendEmailRequest,
  ): Promise<BrevoSendEmailResponse> {
    return this.request<BrevoSendEmailResponse>(
      apiKey,
      'POST',
      '/smtp/email',
      request,
    );
  }
}
