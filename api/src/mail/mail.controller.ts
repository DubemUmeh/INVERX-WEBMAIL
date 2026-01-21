import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MailService } from './mail.service.js';
import {
  SendMailDto,
  CreateDraftDto,
  UpdateMessageDto,
  MailQueryDto,
} from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('inbox')
  getInbox(@CurrentUser('sub') userId: string, @Query() query: MailQueryDto) {
    return this.mailService.getInbox(userId, query);
  }

  @Get('sent')
  getSent(@CurrentUser('sub') userId: string, @Query() query: MailQueryDto) {
    return this.mailService.getSent(userId, query);
  }

  @Get('drafts')
  getDrafts(@CurrentUser('sub') userId: string, @Query() query: MailQueryDto) {
    return this.mailService.getDrafts(userId, query);
  }

  @Get('spam')
  getSpam(@CurrentUser('sub') userId: string, @Query() query: MailQueryDto) {
    return this.mailService.getSpam(userId, query);
  }

  @Get('archive')
  getArchive(@CurrentUser('sub') userId: string, @Query() query: MailQueryDto) {
    return this.mailService.getArchive(userId, query);
  }

  @Get('messages/:id')
  getMessage(
    @CurrentUser('sub') userId: string,
    @Param('id') messageId: string,
  ) {
    return this.mailService.getMessage(userId, messageId);
  }

  @Post('send')
  sendMail(
    @CurrentUser('sub') userId: string,
    @CurrentUser('accountId') accountId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SendMailDto,
  ) {
    return this.mailService.sendMail(userId, accountId, email, dto);
  }

  @Post('draft')
  createDraft(
    @CurrentUser('sub') userId: string,
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateDraftDto,
  ) {
    return this.mailService.createDraft(userId, accountId, dto);
  }

  @Patch('messages/:id')
  updateMessage(
    @CurrentUser('sub') userId: string,
    @Param('id') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.mailService.updateMessage(userId, messageId, dto);
  }

  @Delete('messages/:id')
  deleteMessage(
    @CurrentUser('sub') userId: string,
    @Param('id') messageId: string,
  ) {
    return this.mailService.deleteMessage(userId, messageId);
  }
}
