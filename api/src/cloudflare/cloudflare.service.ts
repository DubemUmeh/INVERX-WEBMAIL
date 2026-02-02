/**
 * Cloudflare Service
 *
 * Manages Cloudflare DNS zones and records.
 * Handles zone creation, DNS record management, and status checks.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

export interface CloudflareZone {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
}

export interface CloudflareDnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

interface CloudflareApiResponse<T> {
  success: boolean;
  result: T;
  errors: { code: number; message: string }[];
}

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly apiToken: string | undefined;
  private readonly accountId: string | undefined;
  private readonly maxRetries = 3;

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');

    if (!this.apiToken || !this.accountId) {
      this.logger.warn(
        'Cloudflare credentials not configured. Cloudflare-managed DNS will be unavailable.',
      );
    }
  }

  /**
   * Check if Cloudflare is available
   */
  isAvailable(): boolean {
    return Boolean(this.apiToken && this.accountId);
  }

  /**
   * Make authenticated request to Cloudflare API with retry logic
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    retries = 0,
  ): Promise<T> {
    if (!this.apiToken) {
      throw new Error('Cloudflare API token not configured');
    }

    const url = `${CLOUDFLARE_API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = (await response.json()) as CloudflareApiResponse<T>;

      if (!data.success) {
        const errorMsg =
          data.errors?.map((e) => e.message).join(', ') || 'Unknown error';
        throw new Error(`Cloudflare API error: ${errorMsg}`);
      }

      return data.result;
    } catch (error: any) {
      // Retry on transient errors
      if (retries < this.maxRetries && this.isRetryable(error)) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        this.logger.warn(
          `Cloudflare request failed, retrying in ${delay}ms (attempt ${retries + 1}/${this.maxRetries})`,
        );
        await this.sleep(delay);
        return this.request<T>(method, endpoint, body, retries + 1);
      }

      throw error;
    }
  }

  private isRetryable(error: any): boolean {
    // Retry on network errors or 5xx status codes
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      return true;
    }
    if (
      error.message?.includes('500') ||
      error.message?.includes('502') ||
      error.message?.includes('503') ||
      error.message?.includes('504')
    ) {
      return true;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a DNS zone for a domain
   */
  async createZone(domainName: string): Promise<CloudflareZone> {
    this.logger.log(`Creating Cloudflare zone for ${domainName}`);

    return this.request<CloudflareZone>('POST', '/zones', {
      name: domainName,
      account: { id: this.accountId },
      jump_start: false,
    });
  }

  /**
   * Get zone details
   */
  async getZone(zoneId: string): Promise<CloudflareZone> {
    return this.request<CloudflareZone>('GET', `/zones/${zoneId}`);
  }

  /**
   * Get zone by name
   */
  async getZoneByName(name: string): Promise<CloudflareZone | null> {
    const zones = await this.request<CloudflareZone[]>(
      'GET',
      `/zones?name=${name}`,
    );
    return zones.length > 0 ? zones[0] : null;
  }

  /**
   * Check if zone is active (nameservers updated)
   */
  async isZoneActive(zoneId: string): Promise<boolean> {
    const zone = await this.getZone(zoneId);
    return zone.status === 'active';
  }

  /**
   * Create a DNS record
   */
  async createDnsRecord(
    zoneId: string,
    type: 'TXT' | 'CNAME',
    name: string,
    content: string,
    ttl: number = 3600,
  ): Promise<CloudflareDnsRecord> {
    this.logger.log(`Creating ${type} record: ${name}`);

    return this.request<CloudflareDnsRecord>(
      'POST',
      `/zones/${zoneId}/dns_records`,
      {
        type,
        name,
        content,
        ttl,
        proxied: false, // DNS-only for email records
      },
    );
  }

  /**
   * Get all DNS records for a zone
   */
  async listDnsRecords(zoneId: string): Promise<CloudflareDnsRecord[]> {
    return this.request<CloudflareDnsRecord[]>(
      'GET',
      `/zones/${zoneId}/dns_records`,
    );
  }

  /**
   * Delete a DNS record
   */
  async deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
    await this.request('DELETE', `/zones/${zoneId}/dns_records/${recordId}`);
  }

  /**
   * Create multiple DNS records for email authentication
   */
  async createEmailDnsRecords(
    zoneId: string,
    records: { type: 'TXT' | 'CNAME'; host: string; value: string }[],
  ): Promise<CloudflareDnsRecord[]> {
    const created: CloudflareDnsRecord[] = [];

    for (const record of records) {
      try {
        const result = await this.createDnsRecord(
          zoneId,
          record.type,
          record.host,
          record.value,
        );
        created.push(result);
      } catch (error: any) {
        // Continue on duplicate record error
        if (error.message?.includes('already exists')) {
          this.logger.warn(`Record ${record.host} already exists, skipping`);
          continue;
        }
        throw error;
      }
    }

    return created;
  }
}
