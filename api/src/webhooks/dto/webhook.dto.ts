import { IsString, IsArray, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];
}

export class WebhookResponseDto {
  id: string;
  url: string;
  events: string[];
  status: string;
  failureCount: number;
  lastDeliveryAt?: Date;
  createdAt: Date;
}
