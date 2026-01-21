import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { ApiKeysRepository } from './api-keys.repository.js';
import { CreateApiKeyDto } from './dto/index.js';

@Injectable()
export class ApiKeysService {
  constructor(private apiKeysRepository: ApiKeysRepository) {}

  async getApiKeys(accountId: string) {
    return this.apiKeysRepository.findAll(accountId);
  }

  async createApiKey(accountId: string, userId: string, dto: CreateApiKeyDto) {
    // Generate a random API key
    const keyBytes = randomBytes(32);
    const key = `inv_${keyBytes.toString('base64url')}`;
    const keyPrefix = key.substring(0, 10);
    const keyHash = createHash('sha256').update(key).digest('hex');

    const apiKey = await this.apiKeysRepository.create({
      accountId,
      createdBy: userId,
      name: dto.name,
      keyPrefix,
      keyHash,
      scopes: dto.scopes,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    // Return the full key only on creation
    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      key, // Full key - only shown once
      scopes: apiKey.scopes,
      status: apiKey.status,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async deleteApiKey(accountId: string, keyId: string) {
    const apiKey = await this.apiKeysRepository.findById(accountId, keyId);
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.apiKeysRepository.delete(keyId);
    return { message: 'API key deleted successfully' };
  }
}
