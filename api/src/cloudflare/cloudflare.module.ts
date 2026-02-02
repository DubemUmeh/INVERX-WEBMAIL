/**
 * Cloudflare Module
 *
 * NestJS module for Cloudflare DNS management.
 */

import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service.js';

@Module({
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
