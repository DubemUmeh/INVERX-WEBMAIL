/**
 * SMTP Service
 *
 * Business logic for SMTP configuration management.
 * Handles encryption/decryption of credentials and sanitization of responses.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SmtpRepository } from './smtp.repository.js';
import { SmtpCryptoService } from './smtp-crypto.service.js';
import { SmtpEmailService } from './smtp-email.service.js';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto/index.js';

/**
 * Sanitized SMTP config for API responses (no password data).
 */
export interface SmtpConfigResponse {
  id: string;
  name: string;
  host: string;
  port: number;
  username?: string;
  hasPassword: boolean; // Indicates if password is set, without exposing it
  encryption: string;
  requireTls: boolean;
  timeoutSeconds: number;
  fromEmail: string;
  fromName?: string;
  isDefault: boolean;
  lastTestedAt?: Date;
  lastTestResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

import { DomainsService } from '../domains/domains.service.js';

@Injectable()
export class SmtpService {
  constructor(
    private repository: SmtpRepository,
    private cryptoService: SmtpCryptoService,
    private emailService: SmtpEmailService,
    private domainsService: DomainsService,
  ) {}

  /**
   * Sanitize SMTP config for API response (remove password data).
   */
  private sanitize(config: any): SmtpConfigResponse {
    return {
      id: config.id,
      name: config.name,
      host: config.host,
      port: config.port,
      username: config.username || undefined,
      hasPassword: !!(
        config.passwordEncrypted &&
        config.passwordIv &&
        config.passwordTag
      ),
      encryption: config.encryption,
      requireTls: config.requireTls ?? true,
      timeoutSeconds: config.timeoutSeconds ?? 30,
      fromEmail: config.fromEmail,
      fromName: config.fromName || undefined,
      isDefault: config.isDefault ?? false,
      lastTestedAt: config.lastTestedAt || undefined,
      lastTestResult: config.lastTestResult || undefined,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
  /**
   * Check if email already exists in SMTP configs or Domain Addresses
   */
  private async checkDuplicateEmail(
    userId: string,
    email: string,
  ): Promise<void> {
    // 1. Check SMTP Configurations
    const existingSmtp = await this.repository.findByFromEmail(email, userId);
    if (existingSmtp) {
      throw new ConflictException(
        `An SMTP configuration with email "${email}" already exists`,
      );
    }

    // 2. Check Domain Addresses
    const accountId = await this.repository.findAccountIdByUserId(userId);
    if (accountId) {
      const addresses = await this.domainsService.getAllAddresses(accountId);
      const existsInDomains = addresses.some(
        (addr) => addr.email.toLowerCase() === email.toLowerCase(),
      );
      if (existsInDomains) {
        throw new ConflictException(
          `The email "${email}" already exists as a verified Domain Address.`,
        );
      }
    }
  }

  /**
   * Get all SMTP configurations for a user.
   */
  async getAllConfigs(userId: string): Promise<SmtpConfigResponse[]> {
    const configs = await this.repository.findByUserId(userId);
    return configs.map((c) => this.sanitize(c));
  }

  /**
   * Get a single SMTP configuration by ID.
   */
  async getConfig(id: string, userId: string): Promise<SmtpConfigResponse> {
    const config = await this.repository.findById(id, userId);
    if (!config) {
      throw new NotFoundException('SMTP configuration not found');
    }
    return this.sanitize(config);
  }

  /**
   * Find SMTP config by fromEmail address.
   */
  async findByFromEmail(
    fromEmail: string,
    userId: string,
  ): Promise<SmtpConfigResponse | null> {
    const config = await this.repository.findByFromEmail(fromEmail, userId);
    return config ? this.sanitize(config) : null;
  }

  /**
   * Create a new SMTP configuration.
   */
  async createConfig(
    userId: string,
    dto: CreateSmtpConfigDto,
  ): Promise<SmtpConfigResponse> {
    // Check if crypto is available when password is provided
    if (dto.password && !this.cryptoService.isAvailable()) {
      throw new BadRequestException(
        'SMTP password encryption is not configured. Contact administrator.',
      );
    }

    // Check for duplicate fromEmail
    await this.checkDuplicateEmail(userId, dto.fromEmail);

    // Encrypt password if provided
    let passwordEncrypted: string | undefined;
    let passwordIv: string | undefined;
    let passwordTag: string | undefined;

    if (dto.password) {
      const encrypted = this.cryptoService.encrypt(dto.password);
      passwordEncrypted = encrypted.encrypted;
      passwordIv = encrypted.iv;
      passwordTag = encrypted.tag;
    }

    // If this is set as default, clear others first
    if (dto.isDefault) {
      await this.repository.clearDefault(userId);
    }

    const config = await this.repository.create({
      userId,
      name: dto.name,
      host: dto.host,
      port: dto.port,
      username: dto.username,
      passwordEncrypted,
      passwordIv,
      passwordTag,
      encryption: dto.encryption,
      requireTls: dto.requireTls ?? true,
      timeoutSeconds: dto.timeoutSeconds ?? 30,
      fromEmail: dto.fromEmail,
      fromName: dto.fromName,
      isDefault: dto.isDefault ?? false,
    });

    return this.sanitize(config);
  }

  /**
   * Update an existing SMTP configuration.
   */
  async updateConfig(
    id: string,
    userId: string,
    dto: UpdateSmtpConfigDto,
  ): Promise<SmtpConfigResponse> {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundException('SMTP configuration not found');
    }

    // Check for duplicate fromEmail if it's being changed
    if (dto.fromEmail && dto.fromEmail !== existing.fromEmail) {
      await this.checkDuplicateEmail(userId, dto.fromEmail);
    }

    // Prepare update data
    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.host !== undefined) updateData.host = dto.host;
    if (dto.port !== undefined) updateData.port = dto.port;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.encryption !== undefined) updateData.encryption = dto.encryption;
    if (dto.requireTls !== undefined) updateData.requireTls = dto.requireTls;
    if (dto.timeoutSeconds !== undefined)
      updateData.timeoutSeconds = dto.timeoutSeconds;
    if (dto.fromEmail !== undefined) updateData.fromEmail = dto.fromEmail;
    if (dto.fromName !== undefined) updateData.fromName = dto.fromName;

    // Handle password update
    if (dto.password !== undefined) {
      if (dto.password === '') {
        // Clear password
        updateData.passwordEncrypted = null;
        updateData.passwordIv = null;
        updateData.passwordTag = null;
      } else {
        // Encrypt new password
        if (!this.cryptoService.isAvailable()) {
          throw new BadRequestException(
            'SMTP password encryption is not configured. Contact administrator.',
          );
        }
        const encrypted = this.cryptoService.encrypt(dto.password);
        updateData.passwordEncrypted = encrypted.encrypted;
        updateData.passwordIv = encrypted.iv;
        updateData.passwordTag = encrypted.tag;
      }
    }

    // Handle default flag
    if (dto.isDefault === true) {
      await this.repository.clearDefault(userId);
      updateData.isDefault = true;
    } else if (dto.isDefault === false) {
      updateData.isDefault = false;
    }

    const updated = await this.repository.update(id, userId, updateData);
    if (!updated) {
      throw new NotFoundException('SMTP configuration not found');
    }

    return this.sanitize(updated);
  }

  /**
   * Delete an SMTP configuration.
   */
  async deleteConfig(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException('SMTP configuration not found');
    }
  }

  /**
   * Test SMTP connection.
   */
  async testConnection(
    id: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const config = await this.repository.findById(id, userId);
    if (!config) {
      throw new NotFoundException('SMTP configuration not found');
    }

    // Decrypt password if present
    let password: string | undefined;
    if (config.passwordEncrypted && config.passwordIv && config.passwordTag) {
      password = this.cryptoService.decrypt({
        encrypted: config.passwordEncrypted,
        iv: config.passwordIv,
        tag: config.passwordTag,
      });
    }

    try {
      await this.emailService.testConnection({
        host: config.host,
        port: config.port,
        username: config.username || undefined,
        password,
        encryption: config.encryption as any,
        requireTls: config.requireTls ?? true,
        timeoutSeconds: config.timeoutSeconds ?? 30,
      });

      // Update test result
      await this.repository.updateTestResult(id, userId, 'success');

      return {
        success: true,
        message: 'SMTP connection successful',
      };
    } catch (error: any) {
      // Update test result
      await this.repository.updateTestResult(id, userId, 'failed');

      return {
        success: false,
        message: error.message || 'SMTP connection failed',
      };
    }
  }

  /**
   * Get decrypted config for sending email (internal use only).
   */
  async getDecryptedConfig(
    id: string,
    userId: string,
  ): Promise<{
    host: string;
    port: number;
    username?: string;
    password?: string;
    encryption: string;
    requireTls: boolean;
    timeoutSeconds: number;
    fromEmail: string;
    fromName?: string;
  } | null> {
    const config = await this.repository.findById(id, userId);
    if (!config) return null;

    let password: string | undefined;
    if (config.passwordEncrypted && config.passwordIv && config.passwordTag) {
      password = this.cryptoService.decrypt({
        encrypted: config.passwordEncrypted,
        iv: config.passwordIv,
        tag: config.passwordTag,
      });
    }

    return {
      host: config.host,
      port: config.port,
      username: config.username || undefined,
      password,
      encryption: config.encryption,
      requireTls: config.requireTls ?? true,
      timeoutSeconds: config.timeoutSeconds ?? 30,
      fromEmail: config.fromEmail,
      fromName: config.fromName || undefined,
    };
  }

  /**
   * Get decrypted config by fromEmail for sending email.
   */
  async getDecryptedConfigByFromEmail(
    fromEmail: string,
    userId: string,
  ): Promise<{
    host: string;
    port: number;
    username?: string;
    password?: string;
    encryption: string;
    requireTls: boolean;
    timeoutSeconds: number;
    fromEmail: string;
    fromName?: string;
  } | null> {
    const config = await this.repository.findByFromEmail(fromEmail, userId);
    if (!config) return null;

    let password: string | undefined;
    if (config.passwordEncrypted && config.passwordIv && config.passwordTag) {
      password = this.cryptoService.decrypt({
        encrypted: config.passwordEncrypted,
        iv: config.passwordIv,
        tag: config.passwordTag,
      });
    }

    return {
      host: config.host,
      port: config.port,
      username: config.username || undefined,
      password,
      encryption: config.encryption,
      requireTls: config.requireTls ?? true,
      timeoutSeconds: config.timeoutSeconds ?? 30,
      fromEmail: config.fromEmail,
      fromName: config.fromName || undefined,
    };
  }
}
