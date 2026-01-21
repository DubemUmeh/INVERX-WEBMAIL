import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  name: string;
}

export class CreateAddressDto {
  @IsString()
  localPart: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}

export class DomainQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
