/**
 * SMTP Crypto Service
 *
 * AES-256-GCM envelope encryption for SMTP passwords.
 * Uses Node.js crypto module - no external dependencies.
 *
 * Security properties:
 * - AES-256-GCM provides authenticated encryption (confidentiality + integrity)
 * - Per-record random 16-byte IV prevents identical plaintexts from producing identical ciphertexts
 * - GCM auth tag detects tampering
 * - Master key from environment variable (SMTP_SECRET_KEY)
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Constants for AES-256-GCM
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

export interface EncryptedData {
  encrypted: string; // Hex-encoded ciphertext
  iv: string; // Hex-encoded IV
  tag: string; // Hex-encoded auth tag
}

@Injectable()
export class SmtpCryptoService implements OnModuleInit {
  private readonly logger = new Logger(SmtpCryptoService.name);
  private masterKey: Buffer | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Validate master key on module initialization.
   * Fail fast if key is missing or invalid.
   */
  onModuleInit() {
    const keyEnv = this.configService.get<string>('SMTP_SECRET_KEY');

    if (!keyEnv) {
      this.logger.warn(
        'SMTP_SECRET_KEY not configured. SMTP password encryption will be unavailable.',
      );
      return;
    }

    try {
      // Accept hex (64 chars) or base64 (44 chars) encoded key
      if (keyEnv.length === 64 && /^[0-9a-fA-F]+$/.test(keyEnv)) {
        this.masterKey = Buffer.from(keyEnv, 'hex');
      } else {
        this.masterKey = Buffer.from(keyEnv, 'base64');
      }

      if (this.masterKey.length !== KEY_LENGTH) {
        throw new Error(
          `SMTP_SECRET_KEY must be exactly ${KEY_LENGTH} bytes (256 bits). Got ${this.masterKey.length} bytes.`,
        );
      }

      this.logger.log('SMTP crypto service initialized successfully');
    } catch (error: any) {
      this.masterKey = null;
      this.logger.error(`Failed to initialize SMTP crypto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if encryption is available (master key is configured).
   */
  isAvailable(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Encrypt a plaintext password using AES-256-GCM.
   *
   * @param plaintext - The password to encrypt
   * @returns Encrypted data with hex-encoded ciphertext, IV, and auth tag
   * @throws Error if master key not configured
   */
  encrypt(plaintext: string): EncryptedData {
    if (!this.masterKey) {
      throw new Error(
        'SMTP encryption unavailable: SMTP_SECRET_KEY not configured',
      );
    }

    // Generate cryptographically secure random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher with AES-256-GCM
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    // Encrypt the plaintext
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // Get the authentication tag
    const tag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt an encrypted password using AES-256-GCM.
   *
   * SECURITY: The decrypted value is only held in memory.
   * Never log, serialize, or persist the return value.
   *
   * @param data - Encrypted data with ciphertext, IV, and auth tag
   * @returns Decrypted plaintext password
   * @throws Error if decryption fails (wrong key, tampered data, etc.)
   */
  decrypt(data: EncryptedData): string {
    if (!this.masterKey) {
      throw new Error(
        'SMTP decryption unavailable: SMTP_SECRET_KEY not configured',
      );
    }

    try {
      const iv = Buffer.from(data.iv, 'hex');
      const encrypted = Buffer.from(data.encrypted, 'hex');
      const tag = Buffer.from(data.tag, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });

      // Set the auth tag for verification
      decipher.setAuthTag(tag);

      // Decrypt - will throw if auth tag doesn't match (tampered data)
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error: any) {
      // Don't expose detailed crypto errors
      this.logger.error('SMTP password decryption failed - possible tampering');
      throw new Error('Failed to decrypt SMTP password');
    }
  }

  /**
   * Check if we can decrypt a set of encrypted data (validation only).
   * Does not return the decrypted value.
   */
  canDecrypt(data: EncryptedData): boolean {
    try {
      this.decrypt(data);
      return true;
    } catch {
      return false;
    }
  }
}
