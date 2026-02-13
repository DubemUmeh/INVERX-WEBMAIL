import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { BrevoApiService } from '../brevo/brevo-api.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly templatesDir = path.join(
    process.cwd(),
    'src/notifications/templates',
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly brevoApiService: BrevoApiService,
  ) {
    this.registerPartials();
  }

  private registerPartials() {
    // Register any partials if needed, or just ensure layout is available
    // For now, we'll manually wrap content in layout
  }

  async sendEmail(params: {
    to: string | { email: string; name?: string }[];
    subject: string;
    template: string;
    data: Record<string, any>;
  }) {
    try {
      // 1. Render Template
      const htmlContent = this.renderTemplate(params.template, params.data);

      // 2. Prepare Recipients
      const recipients = Array.isArray(params.to)
        ? params.to.map((r) => (typeof r === 'string' ? { email: r } : r))
        : [{ email: params.to }];

      // 3. Send via Brevo
      // using system-wide API key from env for transactional emails
      const apiKey = this.configService.get<string>('BREVO_API_KEY');
      const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');
      const senderName = this.configService.get<string>(
        'BREVO_SENDER_NAME',
        'INVERX MAIL',
      );

      if (!apiKey || !senderEmail) {
        this.logger.error('Missing BREVO_API_KEY or BREVO_SENDER_EMAIL');
        throw new Error('Email configuration missing');
      }

      await this.brevoApiService.sendEmail(apiKey, {
        sender: { email: senderEmail, name: senderName },
        to: recipients,
        subject: params.subject,
        htmlContent,
      });

      this.logger.log(
        `Email sent to ${recipients[0].email} (Template: ${params.template})`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send OTP email for password reset
   */
  async sendOtpEmail(to: string, otp: string, expiresIn: number) {
    return this.sendEmail({
      to,
      subject: 'Your Password Reset Code',
      template: 'forgot-password-otp',
      data: { otp, expiresIn },
    });
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(
    email: string,
    timestamp: string,
    ip: string,
    userAgent: string,
  ) {
    return this.sendEmail({
      to: email,
      subject: 'Your Password Was Changed',
      template: 'password-changed',
      data: { timestamp, ip, userAgent },
    });
  }

  /**
   * Send waitlist confirmation to user
   */
  async sendWaitlistConfirmation(email: string) {
    return this.sendEmail({
      to: email,
      subject: "You're on the waitlist!",
      template: 'waitlist-confirmation',
      data: { email },
    });
  }

  /**
   * Notify admins about new waitlist signup
   */
  async sendWaitlistAdminNotify(
    newEmail: string,
    name: string | null,
    recipients: string[],
    totalCount: number,
  ) {
    return this.sendEmail({
      to: recipients.map((email) => ({ email })),
      subject: 'New Waitlist Signup',
      template: 'waitlist-admin-notify',
      data: {
        newEmail,
        totalCount,
        name,
        createdAt: new Date().toLocaleString(),
      },
    });
  }

  /**
   * Send login notification email
   */
  async sendLoginNotification(
    email: string,
    timestamp: string,
    ip: string,
    userAgent: string,
  ) {
    return this.sendEmail({
      to: email,
      subject: 'New Sign-In to Your Account',
      template: 'login-notification',
      data: { email, timestamp, ip, userAgent },
    });
  }

  private renderTemplate(templateName: string, data: any): string {
    try {
      // Load specific template
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateSource);
      const body = template(data);

      // Load layout
      const layoutPath = path.join(this.templatesDir, 'layout.html');
      const layoutSource = fs.readFileSync(layoutPath, 'utf8');
      const layout = Handlebars.compile(layoutSource);

      // Merge into layout
      return layout({
        ...data,
        body,
        currentYear: new Date().getFullYear(),
      });
    } catch (error) {
      this.logger.error(`Template rendering failed: ${error.message}`);
      throw error;
    }
  }
}
