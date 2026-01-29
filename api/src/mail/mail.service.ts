import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MailRepository } from './mail.repository.js';
import { SesEmailService } from './ses-email.service.js';
import { DomainsService } from '../domains/domains.service.js';
import { SmtpService } from '../smtp/smtp.service.js';
import { SmtpEmailService } from '../smtp/smtp-email.service.js';
import {
  SendMailDto,
  CreateDraftDto,
  UpdateMessageDto,
  MailQueryDto,
} from './dto/index.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailRepository: MailRepository,
    private sesEmailService: SesEmailService,
    private domainsService: DomainsService,
    private smtpService: SmtpService,
    private smtpEmailService: SmtpEmailService,
  ) {}

  async getInbox(
    userId: string,
    accountId: string,
    userEmail: string,
    query: MailQueryDto,
  ) {
    const domainAddresses =
      await this.domainsService.getAllAddresses(accountId);
    const userEmails = [
      userEmail,
      ...(domainAddresses || []).map((addr) => addr.email),
    ];

    const results = await this.mailRepository.findInbox(
      userId,
      userEmails,
      query,
    );
    return results.map((r) => this.formatMessage(r));
  }

  async getSent(
    userId: string,
    accountId: string,
    userEmail: string,
    query: MailQueryDto,
  ) {
    const domainAddresses =
      await this.domainsService.getAllAddresses(accountId);
    const userEmails = [
      userEmail,
      ...(domainAddresses || []).map((addr) => addr.email),
    ];

    const results = await this.mailRepository.findSent(
      userId,
      userEmails,
      query,
    );
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
    // 1. Check if this fromEmail has an SMTP configuration
    const smtpConfig = await this.smtpService.getDecryptedConfigByFromEmail(
      fromEmail,
      userId,
    );

    // 2. Create the message record in database first
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

    try {
      let result: { messageId: string; success: boolean };

      if (smtpConfig) {
        // 3a. Send via SMTP
        this.logger.log(`Sending email via SMTP for ${fromEmail}`);
        result = await this.smtpEmailService.sendEmail(
          {
            host: smtpConfig.host,
            port: smtpConfig.port,
            username: smtpConfig.username,
            password: smtpConfig.password,
            encryption: smtpConfig.encryption as any,
            requireTls: smtpConfig.requireTls,
            timeoutSeconds: smtpConfig.timeoutSeconds,
          },
          {
            from: fromEmail,
            fromName: smtpConfig.fromName,
            to: dto.to,
            cc: dto.cc,
            bcc: dto.bcc,
            subject: dto.subject,
            bodyText: dto.bodyText,
            bodyHtml: dto.bodyHtml,
            replyTo: dto.replyTo,
          },
        );
      } else {
        // 3b. Validate sender email domain is verified for SES
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
              `Cannot send from ${fromEmail}. The domain ${senderDomain} is not registered in your account. Please add and verify the domain first, or configure SMTP for this address.`,
            );
          }
          throw error;
        }

        // Send via AWS SES
        this.logger.log(`Sending email via AWS SES for ${fromEmail}`);
        result = await this.sesEmailService.sendEmail({
          from: fromEmail,
          to: dto.to,
          cc: dto.cc,
          bcc: dto.bcc,
          subject: dto.subject,
          bodyText: dto.bodyText,
          bodyHtml: dto.bodyHtml,
          replyTo: dto.replyTo,
        });
      }

      // Update message with message ID
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
        messageId: result.messageId,
        method: smtpConfig ? 'smtp' : 'ses',
        message: 'Email sent successfully',
      };
    } catch (error: any) {
      // If sending fails, mark as draft so user can retry
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
      sesMessageId: result.message.messageId,
    };
  }
}
