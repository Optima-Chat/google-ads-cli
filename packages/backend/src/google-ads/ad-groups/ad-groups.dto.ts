import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class ListAdGroupsQueryDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateAdGroupDto {
  @IsString()
  name: string;

  @IsString()
  campaignId: string;

  @IsOptional()
  @IsNumber()
  cpcBidMicros?: number;

  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED'])
  status?: string;
}

export class UpdateAdGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED', 'REMOVED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  cpcBidMicros?: number;
}
