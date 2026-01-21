import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  billingEmail?: string;
}

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  role?: 'owner' | 'admin' | 'member';
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  role?: 'owner' | 'admin' | 'member';
}

export class AccountResponseDto {
  id: string;
  name: string;
  slug: string;
  plan: string;
  billingEmail?: string;
  createdAt: Date;
}

export class MemberResponseDto {
  id: string;
  userId: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: Date;
}
