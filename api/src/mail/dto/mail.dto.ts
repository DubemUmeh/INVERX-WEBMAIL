import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class SendMailDto {
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cc?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  bcc?: string[];

  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  bodyText?: string;

  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @IsString()
  @IsOptional()
  replyTo?: string;
}

export class CreateDraftDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  to?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cc?: string[];

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  bodyText?: string;

  @IsString()
  @IsOptional()
  bodyHtml?: string;
}

export class UpdateMessageDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsString()
  @IsOptional()
  mailboxId?: string;
}

export class MailQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string;
}
