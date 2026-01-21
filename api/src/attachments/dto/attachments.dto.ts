import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for initiating an attachment upload
 * Client provides metadata, backend creates record and returns signed upload URL
 */
export class InitiateUploadDto {
  @IsUUID()
  messageId: string;

  @IsString()
  @MaxLength(255)
  filename: string;

  @IsString()
  @MaxLength(255)
  contentType: string;

  @IsNumber()
  @Min(1)
  @Max(26214400) // 25MB default max
  sizeBytes: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contentId?: string; // For inline images (CID)
}

/**
 * DTO for finalizing an attachment upload
 * Optional checksum for integrity verification
 */
export class FinalizeUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  checksum?: string; // SHA-256 hash
}
