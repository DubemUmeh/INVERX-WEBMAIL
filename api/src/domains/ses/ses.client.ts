import { Injectable, Logger } from '@nestjs/common';
import { SESClient } from '@aws-sdk/client-ses';

@Injectable()
export class SesClientService {
  private readonly logger = new Logger(SesClientService.name);
  public readonly client: SESClient;

  constructor() {
    const region = process.env.AWS_SES_REGION || 'us-east-1';

    // Check if credentials exist in env
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      this.logger.warn(
        'AWS SES credentials not found in environment variables. Email features will fail.',
      );
    }

    this.client = new SESClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    this.logger.log(`Initialized SES Client for region: ${region}`);
  }
}
