import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service.js';
import { InitiateUploadDto, FinalizeUploadDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { AccountGuard } from '../common/guards/index.js';

@Controller('attachments')
@UseGuards(AccountGuard)
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  /**
   * Step 1: Initiate upload
   * Client provides metadata, gets back signed URL for direct upload to Supabase
   *
   * POST /attachments/initiate
   * Body: { messageId, filename, contentType, sizeBytes, contentId? }
   * Returns: { attachmentId, uploadUrl, expiresAt }
   */
  @Post('initiate')
  initiateUpload(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: InitiateUploadDto,
  ) {
    return this.attachmentsService.initiateUpload(accountId, dto);
  }

  /**
   * Step 2: Finalize upload
   * Client calls after uploading file to Supabase
   * Backend verifies file exists and marks attachment as ready
   *
   * POST /attachments/:id/finalize
   * Body: { checksum? }
   * Returns: attachment record
   */
  @Post(':id/finalize')
  finalizeUpload(
    @CurrentUser('accountId') accountId: string,
    @Param('id') attachmentId: string,
    @Body() dto: FinalizeUploadDto,
  ) {
    return this.attachmentsService.finalizeUpload(accountId, attachmentId, dto);
  }

  /**
   * Get attachment details
   *
   * GET /attachments/:id
   * Returns: attachment record
   */
  @Get(':id')
  getAttachment(
    @CurrentUser('accountId') accountId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentsService.getAttachment(accountId, attachmentId);
  }

  /**
   * Get signed download URL for an attachment
   *
   * GET /attachments/:id/download
   * Returns: { downloadUrl, expiresAt, filename, contentType, sizeBytes }
   */
  @Get(':id/download')
  getDownloadUrl(
    @CurrentUser('accountId') accountId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentsService.getDownloadUrl(accountId, attachmentId);
  }

  /**
   * Soft delete an attachment
   *
   * DELETE /attachments/:id
   * Returns: { success: true }
   */
  @Delete(':id')
  deleteAttachment(
    @CurrentUser('accountId') accountId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentsService.deleteAttachment(accountId, attachmentId);
  }
}
