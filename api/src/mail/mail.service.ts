import { Injectable, NotFoundException } from '@nestjs/common';
import { MailRepository } from './mail.repository.js';
import {
  SendMailDto,
  CreateDraftDto,
  UpdateMessageDto,
  MailQueryDto,
} from './dto/index.js';

@Injectable()
export class MailService {
  constructor(private mailRepository: MailRepository) {}

  async getInbox(userId: string, query: MailQueryDto) {
    const results = await this.mailRepository.findInbox(userId, query);
    return results.map((r) => this.formatMessage(r));
  }

  async getSent(userId: string, query: MailQueryDto) {
    const results = await this.mailRepository.findSent(userId, query);
    return results.map((r) => this.formatMessage(r));
  }

  async getDrafts(userId: string, query: MailQueryDto) {
    const results = await this.mailRepository.findDrafts(userId, query);
    return results.map((r) => this.formatMessage(r));
  }

  async getSpam(userId: string, query: MailQueryDto) {
    // For now, return empty - spam detection would be implemented separately
    return [];
  }

  async getArchive(userId: string, query: MailQueryDto) {
    const results = await this.mailRepository.findArchive(userId, query);
    return results.map((r) => this.formatMessage(r));
  }

  async getMessage(userId: string, messageId: string) {
    const result = await this.mailRepository.findById(userId, messageId);
    if (!result) {
      throw new NotFoundException('Message not found');
    }

    // Mark as read
    if (!result.userMessage.isRead) {
      await this.mailRepository.updateUserMessage(userId, messageId, {
        isRead: true,
      });
    }

    // Get attachments
    const attachments = await this.mailRepository.findAttachments(messageId);

    return {
      ...this.formatMessage(result),
      attachments,
    };
  }

  async sendMail(
    userId: string,
    accountId: string,
    fromEmail: string,
    dto: SendMailDto,
  ) {
    // Create the message
    const message = await this.mailRepository.createMessage({
      accountId,
      subject: dto.subject,
      bodyText: dto.bodyText,
      bodyHtml: dto.bodyHtml,
      fromEmail,
      toRecipients: dto.to,
      ccRecipients: dto.cc,
      bccRecipients: dto.bcc,
      replyTo: dto.replyTo,
    });

    // Create user message record
    await this.mailRepository.createUserMessage({
      userId,
      messageId: message.id,
      isDraft: false,
    });

    // TODO: Actually send the email via SMTP/email provider

    return {
      id: message.id,
      message: 'Email sent successfully',
    };
  }

  async createDraft(userId: string, accountId: string, dto: CreateDraftDto) {
    const message = await this.mailRepository.createMessage({
      accountId,
      subject: dto.subject,
      bodyText: dto.bodyText,
      bodyHtml: dto.bodyHtml,
      fromEmail: '', // Will be set when sending
      toRecipients: dto.to,
      ccRecipients: dto.cc,
    });

    await this.mailRepository.createUserMessage({
      userId,
      messageId: message.id,
      isDraft: true,
    });

    return {
      id: message.id,
      message: 'Draft saved',
    };
  }

  async updateMessage(
    userId: string,
    messageId: string,
    dto: UpdateMessageDto,
  ) {
    const updated = await this.mailRepository.updateUserMessage(
      userId,
      messageId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException('Message not found');
    }

    return updated;
  }

  async deleteMessage(userId: string, messageId: string) {
    const deleted = await this.mailRepository.deleteMessage(userId, messageId);

    if (!deleted) {
      throw new NotFoundException('Message not found');
    }

    return { message: 'Message deleted' };
  }

  private formatMessage(result: { userMessage: any; message: any }) {
    return {
      id: result.message.id,
      subject: result.message.subject,
      snippet: result.message.snippet,
      from: {
        email: result.message.fromEmail,
        name: result.message.fromName,
      },
      to: result.message.toRecipients,
      cc: result.message.ccRecipients,
      sentAt: result.message.sentAt,
      isRead: result.userMessage.isRead,
      isStarred: result.userMessage.isStarred,
      isArchived: result.userMessage.isArchived,
      isDraft: result.userMessage.isDraft,
      hasAttachments: result.message.hasAttachments,
    };
  }
}
