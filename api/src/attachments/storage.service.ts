import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

export interface FileMetadata {
  size: number;
  contentType: string;
}

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const supabaseKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_KEY',
    );
    this.bucket = this.configService.get<string>(
      'SUPABASE_BUCKET',
      'mail-attachments',
    );

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Generate a signed URL for uploading a file directly to Supabase
   * Client will use this URL to PUT the file bytes
   */
  async createSignedUploadUrl(
    storageKey: string,
    ttlSeconds: number = 120,
  ): Promise<SignedUrlResult> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUploadUrl(storageKey);

    if (error) {
      this.logger.error(`Failed to create upload URL: ${error.message}`);
      throw new Error(`Failed to create upload URL: ${error.message}`);
    }

    return {
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  /**
   * Generate a signed URL for downloading a file
   * Clients use this to GET the file bytes
   */
  async createSignedDownloadUrl(
    storageKey: string,
    ttlSeconds: number = 60,
  ): Promise<SignedUrlResult> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(storageKey, ttlSeconds);

    if (error) {
      this.logger.error(`Failed to create download URL: ${error.message}`);
      throw new Error(`Failed to create download URL: ${error.message}`);
    }

    return {
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  /**
   * Check if a file exists in storage
   * Used during finalization to verify upload completed
   */
  async fileExists(storageKey: string): Promise<boolean> {
    // List files in the directory to check existence
    const pathParts = storageKey.split('/');
    const filename = pathParts.pop()!;
    const directory = pathParts.join('/');

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list(directory, {
        search: filename,
        limit: 1,
      });

    if (error) {
      this.logger.error(`Failed to check file existence: ${error.message}`);
      return false;
    }

    return data.some((file) => file.name === filename);
  }

  /**
   * Get file metadata from Supabase
   * Used to verify size matches during finalization
   */
  async getFileMetadata(storageKey: string): Promise<FileMetadata | null> {
    const pathParts = storageKey.split('/');
    const filename = pathParts.pop()!;
    const directory = pathParts.join('/');

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list(directory, {
        search: filename,
        limit: 1,
      });

    if (error || !data.length) {
      return null;
    }

    const file = data.find((f) => f.name === filename);
    if (!file) return null;

    return {
      size: file.metadata?.size ?? 0,
      contentType: file.metadata?.mimetype ?? 'application/octet-stream',
    };
  }

  /**
   * Delete a file from storage
   * Used during cleanup jobs
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([storageKey]);

    if (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      return false;
    }

    return true;
  }

  /**
   * Delete multiple files from storage
   * Used for batch cleanup operations
   */
  async deleteFiles(storageKeys: string[]): Promise<boolean> {
    if (!storageKeys.length) return true;

    const { error } = await this.client.storage
      .from(this.bucket)
      .remove(storageKeys);

    if (error) {
      this.logger.error(`Failed to delete files: ${error.message}`);
      return false;
    }

    return true;
  }
}
