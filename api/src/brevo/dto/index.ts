import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
} from 'class-validator';

/**
 * Connect Brevo Account DTO
 */
export class ConnectBrevoDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

/**
 * Create Brevo Domain DTO
 */
export class CreateBrevoDomainDto {
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @IsString()
  @IsOptional()
  existingDomainId?: string; // Reference to a domain from /domains that has a Cloudflare zone

  @IsEnum(['cloudflare-managed', 'manual'])
  @IsOptional()
  dnsMode?: 'cloudflare-managed' | 'manual';
}

/**
 * Create Brevo Sender DTO
 */
export class CreateBrevoSenderDto {
  @IsString()
  @IsNotEmpty()
  domainId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}

/**
 * Send Email via Brevo DTO
 */
export class SendBrevoEmailDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsOptional()
  toName?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @IsString()
  @IsOptional()
  textContent?: string;
}

/**
 * Trigger Domain Verification DTO
 */
export class VerifyBrevoDomainDto {
  @IsString()
  @IsNotEmpty()
  domainId: string;
}
