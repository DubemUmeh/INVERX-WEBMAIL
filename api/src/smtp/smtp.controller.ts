/**
 * SMTP Controller
 *
 * REST API endpoints for SMTP configuration management.
 * Passwords are never returned in responses.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SmtpService } from './smtp.service.js';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { AccountGuard } from '../common/guards/index.js';

@Controller('smtp')
@UseGuards(AccountGuard)
export class SmtpController {
  constructor(private smtpService: SmtpService) {}

  /**
   * Get all SMTP configurations for the current user.
   */
  @Get('configs')
  getAllConfigs(@CurrentUser('sub') userId: string) {
    return this.smtpService.getAllConfigs(userId);
  }

  /**
   * Get a single SMTP configuration by ID.
   */
  @Get('configs/:id')
  getConfig(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.smtpService.getConfig(id, userId);
  }

  /**
   * Create a new SMTP configuration.
   */
  @Post('configs')
  createConfig(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSmtpConfigDto,
  ) {
    return this.smtpService.createConfig(userId, dto);
  }

  /**
   * Update an existing SMTP configuration.
   */
  @Patch('configs/:id')
  updateConfig(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSmtpConfigDto,
  ) {
    return this.smtpService.updateConfig(id, userId, dto);
  }

  /**
   * Delete an SMTP configuration.
   */
  @Delete('configs/:id')
  deleteConfig(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.smtpService.deleteConfig(id, userId);
  }

  /**
   * Test SMTP connection.
   */
  @Post('configs/:id/test')
  testConnection(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.smtpService.testConnection(id, userId);
  }
}
