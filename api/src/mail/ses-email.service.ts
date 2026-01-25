/**
 * SES Email Service
 *
 * Handles sending emails via AWS SES
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SendRawEmailCommand,
  MessageRejected,
} from '@aws-sdk/client-ses';
import { SesClientService } from '../domains/ses/ses.client.js';

export interface SendEmailParams {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  messageId: string;
  success: boolean;
}

@Injectable()
export class SesEmailService {
  private readonly logger = new Logger(SesEmailService.name);

  constructor(private readonly sesClientService: SesClientService) {}

  /**
   * Send an email via AWS SES
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { from, to, cc, bcc, subject, bodyText, bodyHtml, replyTo } = params;

    // Validate that we have at least one body content
    if (!bodyText && !bodyHtml) {
      throw new BadRequestException(
        'Email must have either text or HTML body content',
      );
    }

    // Build the email command
    const emailParams: SendEmailCommandInput = {
      Source: from,
      Destination: {
        ToAddresses: to,
        CcAddresses: cc,
        BccAddresses: bcc,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {},
      },
    };

    // Add text body if provided
    if (bodyText) {
      emailParams.Message!.Body!.Text = {
        Data: bodyText,
        Charset: 'UTF-8',
      };
    }

    // Add HTML body if provided
    if (bodyHtml) {
      emailParams.Message!.Body!.Html = {
        Data: bodyHtml,
        Charset: 'UTF-8',
      };
    }

    // Add reply-to if provided
    if (replyTo) {
      emailParams.ReplyToAddresses = [replyTo];
    }

    try {
      this.logger.log(`Sending email from ${from} to ${to.join(', ')}`);

      const command = new SendEmailCommand(emailParams);
      const response = await this.sesClientService.client.send(command);

      this.logger.log(
        `Email sent successfully. MessageId: ${response.MessageId}`,
      );

      return {
        messageId: response.MessageId || '',
        success: true,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      // Handle specific SES errors
      if (error instanceof MessageRejected) {
        throw new BadRequestException(
          `Email rejected by SES: ${error.message}. This may be due to sandbox restrictions or invalid addresses.`,
        );
      }

      // Check for common SES errors
      if (error.name === 'MessageRejected') {
        throw new BadRequestException(
          `Email rejected: ${error.message}. If using SES sandbox, ensure all recipient addresses are verified.`,
        );
      }

      if (error.name === 'MailFromDomainNotVerifiedException') {
        throw new BadRequestException(
          `The sender domain is not verified in AWS SES. Please verify the domain first.`,
        );
      }

      if (error.name === 'ConfigurationSetDoesNotExistException') {
        throw new BadRequestException(
          `SES configuration set not found. Check your AWS SES configuration.`,
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Validate that an email address belongs to a verified domain
   * Returns the domain name if valid
   */
  extractDomain(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid email address format');
    }
    return parts[1].toLowerCase();
  }
}
