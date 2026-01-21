import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  themePreference?: string;
}

export class UserResponseDto {
  id: string;
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  themePreference: string;
  lastLoginAt?: Date;
  createdAt: Date;
}
