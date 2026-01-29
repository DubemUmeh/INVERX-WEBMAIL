import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Max,
  IsEmail,
  MaxLength,
} from 'class-validator';

/**
 * Encryption modes for SMTP connections.
 *
 * STARTTLS: Start unencrypted, upgrade via STARTTLS command (port 587)
 * SSL_TLS: Immediate TLS handshake on connection (port 465)
 * NONE: Plaintext only - UNSAFE, for testing only
 */
export enum SmtpEncryption {
  STARTTLS = 'STARTTLS',
  SSL_TLS = 'SSL_TLS',
  NONE = 'NONE',
}

/**
 * DTO for creating a new SMTP configuration.
 */
export class CreateSmtpConfigDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(255)
  host!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsEnum(SmtpEncryption)
  encryption!: SmtpEncryption;

  @IsOptional()
  @IsBoolean()
  requireTls?: boolean;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  timeoutSeconds?: number;

  @IsEmail()
  fromEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * DTO for updating an existing SMTP configuration.
 * All fields are optional.
 */
export class UpdateSmtpConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  host?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(SmtpEncryption)
  encryption?: SmtpEncryption;

  @IsOptional()
  @IsBoolean()
  requireTls?: boolean;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  timeoutSeconds?: number;

  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
