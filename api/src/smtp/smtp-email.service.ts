/**
 * SMTP Email Service
 *
 * Production-grade SMTP client using Nodemailer.
 *
 * Security features:
 * - Proper encryption mode handling (STARTTLS, SSL/TLS, NONE)
 * - Comprehensive timeout handling across all SMTP phases
 * - Certificate validation enabled by default
 * - Never logs credentials
 * - Fail-fast on configuration errors
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SmtpCryptoService, EncryptedData } from './smtp-crypto.service.js';

// Encryption mode type matching the database enum
export type SmtpEncryptionMode = 'STARTTLS' | 'SSL_TLS' | 'NONE';

/**
 * SMTP connection configuration.
 */
export interface SmtpConnectionConfig {
  host: string;
  port: number;
  username?: string;
  password?: string; // Decrypted password (in-memory only)
  encryption: SmtpEncryptionMode;
  requireTls?: boolean;
  timeoutSeconds?: number;
}

/**
 * Email sending parameters.
 */
export interface SmtpSendParams {
  from: string;
  fromName?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  replyTo?: string;
}

/**
 * Result of sending an email.
 */
export interface SmtpSendResult {
  messageId: string;
  success: boolean;
}

/**
 * Timeout constraints.
 */
const TIMEOUT_MIN_SECONDS = 5;
const TIMEOUT_MAX_SECONDS = 120;
const TIMEOUT_DEFAULT_SECONDS = 30;

@Injectable()
export class SmtpEmailService {
  private readonly logger = new Logger(SmtpEmailService.name);

  constructor(private cryptoService: SmtpCryptoService) {}

  /**
   * Validate timeout value and return milliseconds.
   */
  private validateAndConvertTimeout(seconds?: number): number {
    const value = seconds ?? TIMEOUT_DEFAULT_SECONDS;

    if (value < TIMEOUT_MIN_SECONDS || value > TIMEOUT_MAX_SECONDS) {
      throw new BadRequestException(
        `Timeout must be between ${TIMEOUT_MIN_SECONDS} and ${TIMEOUT_MAX_SECONDS} seconds. Got: ${value}`,
      );
    }

    return value * 1000; // Convert to milliseconds
  }

  /**
   * Create Nodemailer transport options based on encryption mode.
   *
   * SECURITY: This is where encryption modes are properly mapped to
   * prevent downgrade attacks and ensure correct TLS behavior.
   */
  private createTransportOptions(
    config: SmtpConnectionConfig,
  ): nodemailer.TransportOptions {
    const timeoutMs = this.validateAndConvertTimeout(config.timeoutSeconds);

    // Base options with comprehensive timeout coverage
    const baseOptions: any = {
      host: config.host,
      port: config.port,
      // Apply timeout to ALL SMTP phases to prevent hanging workers
      connectionTimeout: timeoutMs, // TCP connection establishment
      greetingTimeout: timeoutMs, // Server greeting (banner) wait
      socketTimeout: timeoutMs, // Socket inactivity timeout
    };

    // Add authentication if credentials provided
    if (config.username && config.password) {
      baseOptions.auth = {
        user: config.username,
        pass: config.password, // Already decrypted, held in memory only
      };
    }

    // Configure TLS based on encryption mode
    switch (config.encryption) {
      case 'SSL_TLS':
        // Immediate TLS handshake on connection (implicit TLS)
        // Typical port: 465
        return {
          ...baseOptions,
          secure: true, // TLS handshake immediately on connect
          tls: {
            // Enable certificate validation (default, but explicit)
            rejectUnauthorized: true,
          },
        };

      case 'STARTTLS':
        // Start unencrypted, upgrade via STARTTLS command
        // Typical port: 587
        return {
          ...baseOptions,
          secure: false, // Don't use TLS immediately
          requireTLS: config.requireTls !== false, // Require STARTTLS upgrade
          tls: {
            rejectUnauthorized: true,
          },
        };

      case 'NONE':
        // UNSAFE: Plaintext only, no TLS
        // Should only be used for internal/testing environments
        this.logger.warn(
          `SMTP connection to ${config.host}:${config.port} using NO ENCRYPTION - UNSAFE`,
        );
        return {
          ...baseOptions,
          secure: false,
          requireTLS: false, // Don't require TLS
          ignoreTLS: true, // Don't attempt STARTTLS even if offered
          tls: {
            rejectUnauthorized: false,
          },
        };

      default:
        throw new BadRequestException(
          `Invalid SMTP encryption mode: ${config.encryption}`,
        );
    }
  }

  /**
   * Test SMTP connection without sending an email.
   *
   * @returns true if connection successful
   * @throws Error with details if connection fails
   */
  async testConnection(config: SmtpConnectionConfig): Promise<boolean> {
    const transportOptions = this.createTransportOptions(config);
    const transporter = nodemailer.createTransport(transportOptions);

    try {
      // verify() attempts a connection and EHLO/HELO
      await transporter.verify();
      this.logger.log(
        `SMTP connection test successful: ${config.host}:${config.port}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `SMTP connection test failed: ${config.host}:${config.port} - ${error.message}`,
      );
      throw new BadRequestException(`SMTP connection failed: ${error.message}`);
    } finally {
      transporter.close();
    }
  }

  /**
   * Send an email via SMTP.
   *
   * @param config SMTP connection configuration
   * @param params Email parameters
   * @returns Message ID if successful
   */
  async sendEmail(
    config: SmtpConnectionConfig,
    params: SmtpSendParams,
  ): Promise<SmtpSendResult> {
    // Validate required fields
    if (!params.to || params.to.length === 0) {
      throw new BadRequestException('At least one recipient is required');
    }

    if (!params.bodyText && !params.bodyHtml) {
      throw new BadRequestException(
        'Email must have either text or HTML body content',
      );
    }

    const transportOptions = this.createTransportOptions(config);
    const transporter = nodemailer.createTransport(transportOptions);

    try {
      // Build the "from" field
      const fromField = params.fromName
        ? `"${params.fromName}" <${params.from}>`
        : params.from;

      // Send the email
      const info = await transporter.sendMail({
        from: fromField,
        to: params.to.join(', '),
        cc: params.cc?.join(', '),
        bcc: params.bcc?.join(', '),
        subject: params.subject,
        text: params.bodyText,
        html: params.bodyHtml,
        replyTo: params.replyTo,
      });

      this.logger.log(
        `Email sent via SMTP: ${config.host}:${config.port} - MessageId: ${info.messageId}`,
      );

      return {
        messageId: info.messageId || '',
        success: true,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to send email via SMTP: ${config.host}:${config.port} - ${error.message}`,
      );
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    } finally {
      transporter.close();
    }
  }

  /**
   * Decrypt SMTP password from stored encrypted data.
   *
   * SECURITY: The decrypted password is only held in memory.
   * Never log or persist the return value.
   */
  decryptPassword(encryptedData: EncryptedData): string {
    return this.cryptoService.decrypt(encryptedData);
  }

  /**
   * Get recommended port for an encryption mode.
   */
  getRecommendedPort(encryption: SmtpEncryptionMode): number {
    switch (encryption) {
      case 'STARTTLS':
        return 587;
      case 'SSL_TLS':
        return 465;
      case 'NONE':
        return 25;
      default:
        return 587;
    }
  }
}
