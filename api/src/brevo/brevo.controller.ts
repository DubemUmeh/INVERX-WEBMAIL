/**
 * Brevo Controller
 *
 * REST API endpoints for Brevo integration.
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import { BrevoService } from './brevo.service.js';
import {
  ConnectBrevoDto,
  CreateBrevoDomainDto,
  CreateBrevoSenderDto,
  SendBrevoEmailDto,
} from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';

@Controller('brevo')
export class BrevoController {
  constructor(private brevoService: BrevoService) {}

  // =====================
  // CONNECTION ENDPOINTS
  // =====================

  /**
   * Get Brevo connection status
   */
  @Get('status')
  async getStatus(@CurrentUser('accountId') accountId: string) {
    return this.brevoService.getConnectionStatus(accountId);
  }

  /**
   * Connect Brevo account
   */
  @Post('connect')
  async connect(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: ConnectBrevoDto,
  ) {
    return this.brevoService.connect(accountId, dto);
  }

  /**
   * Disconnect Brevo account
   */
  @Delete('connect')
  async disconnect(
    @CurrentUser('accountId') accountId: string,
    @Query('deleteAll') deleteAll?: string,
  ) {
    return this.brevoService.disconnect(accountId, deleteAll === 'true');
  }

  // ==============================
  // BREVO ACCOUNT DATA ENDPOINTS
  // ==============================

  /**
   * Get domains directly from Brevo account
   */
  @Get('account/domains')
  async getBrevoAccountDomains(@CurrentUser('accountId') accountId: string) {
    return this.brevoService.getBrevoAccountDomains(accountId);
  }

  /**
   * Get senders directly from Brevo account
   */
  @Get('account/senders')
  async getBrevoAccountSenders(@CurrentUser('accountId') accountId: string) {
    return this.brevoService.getBrevoAccountSenders(accountId);
  }

  // =================
  // DOMAIN ENDPOINTS
  // =================

  /**
   * Get available domains for Brevo (Cloudflare-managed domains from Domain Management)
   */
  @Get('available-domains')
  async getAvailableDomains(@CurrentUser('accountId') accountId: string) {
    return this.brevoService.getAvailableDomainsForBrevo(accountId);
  }

  /**
   * List all domains
   */
  @Get('domains')
  async listDomains(@CurrentUser('accountId') accountId: string) {
    return this.brevoService.listDomains(accountId);
  }

  /**
   * Add a domain
   */
  @Post('domains')
  async addDomain(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateBrevoDomainDto,
  ) {
    return this.brevoService.addDomain(accountId, dto);
  }

  /**
   * Get domain details
   */
  @Get('domains/:domainId')
  async getDomain(
    @CurrentUser('accountId') accountId: string,
    @Param('domainId') domainId: string,
  ) {
    return this.brevoService.getDomain(accountId, domainId);
  }

  /**
   * Delete a domain
   */
  @Delete('domains/:domainId')
  async deleteDomain(
    @CurrentUser('accountId') accountId: string,
    @Param('domainId') domainId: string,
  ) {
    return this.brevoService.deleteDomain(accountId, domainId);
  }

  /**
   * Trigger domain verification
   */
  @Post('domains/:domainId/verify')
  async verifyDomain(
    @CurrentUser('accountId') accountId: string,
    @Param('domainId') domainId: string,
  ) {
    return this.brevoService.verifyDomain(accountId, domainId);
  }

  // =================
  // SENDER ENDPOINTS
  // =================

  /**
   * List senders for a domain
   */
  @Get('domains/:domainId/senders')
  async listSenders(
    @CurrentUser('accountId') accountId: string,
    @Param('domainId') domainId: string,
  ) {
    return this.brevoService.listSenders(accountId, domainId);
  }

  /**
   * Create a sender
   */
  @Post('senders')
  async createSender(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateBrevoSenderDto,
  ) {
    return this.brevoService.createSender(accountId, dto);
  }

  /**
   * Delete a sender
   */
  @Delete('senders/:senderId')
  async deleteSender(
    @CurrentUser('accountId') accountId: string,
    @Param('senderId') senderId: string,
  ) {
    return this.brevoService.deleteSender(accountId, senderId);
  }

  // =================
  // EMAIL SENDING
  // =================

  /**
   * Send email via Brevo
   */
  @Post('send')
  async sendEmail(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: SendBrevoEmailDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.brevoService.sendEmail(accountId, dto, ipAddress);
  }

  /**
   * Send email via Brevo using a specific sender email (account-level)
   */
  @Post('send-with-sender')
  async sendEmailWithSender(
    @CurrentUser('accountId') accountId: string,
    @Body()
    dto: {
      senderEmail: string;
      senderName?: string;
      to: string;
      toName?: string;
      subject: string;
      htmlContent: string;
      textContent?: string;
    },
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.brevoService.sendEmailWithBrevoSender(
      accountId,
      dto,
      ipAddress,
    );
  }
}
