import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MailRepository } from './mail.repository.js';
import { SesEmailService } from './ses-email.service.js';
import { DomainsService } from '../domains/domains.service.js';
import {
  SendMailDto,
  CreateDraftDto,
  UpdateMessageDto,
  MailQueryDto,
} from './dto/index.js';

@Injectable()
export class MailService {
  constructor(
    private mailRepository: MailRepository,
    private sesEmailService: SesEmailService,
    private domainsService: DomainsService,
  ) {}

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
    // 1. Validate sender email domain is verified
    const senderDomain = this.sesEmailService.extractDomain(fromEmail);

    try {
      const domain = await this.domainsService.getDomain(
        accountId,
        senderDomain,
      );

      if (domain.verificationStatus !== 'verified') {
        throw new BadRequestException(
          `Cannot send from ${fromEmail}. The domain ${senderDomain} is not verified. Please verify your domain first.`,
        );
      }
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `Cannot send from ${fromEmail}. The domain ${senderDomain} is not registered in your account. Please add and verify the domain first.`,
        );
      }
      throw error;
    }

    // 2. Create the message record in database
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

    // 3. Send the email via AWS SES
    try {
      const result = await this.sesEmailService.sendEmail({
        from: fromEmail,
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
        subject: dto.subject,
        bodyText: dto.bodyText,
        bodyHtml: dto.bodyHtml,
        replyTo: dto.replyTo,
      });

      // Update message with SES message ID
      await this.mailRepository.updateMessage(message.id, {
        messageId: result.messageId,
      });

      // 4. Create user message record
      await this.mailRepository.createUserMessage({
        userId,
        messageId: message.id,
        isDraft: false,
      });

      return {
        id: message.id,
        sesMessageId: result.messageId,
        message: 'Email sent successfully',
      };
    } catch (error: any) {
      // If SES fails, we should still have the message in the database
      // Mark it as a draft so the user can try again
      await this.mailRepository.createUserMessage({
        userId,
        messageId: message.id,
        isDraft: true,
      });

      throw error;
    }
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
