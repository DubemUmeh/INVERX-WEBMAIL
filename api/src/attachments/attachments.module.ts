import { Module } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller.js';
import { AttachmentsService } from './attachments.service.js';
import { AttachmentsRepository } from './attachments.repository.js';
import { StorageService } from './storage.service.js';

@Module({
  controllers: [AttachmentsController],
  providers: [AttachmentsService, AttachmentsRepository, StorageService],
  exports: [AttachmentsService, StorageService],
})
export class AttachmentsModule {}
