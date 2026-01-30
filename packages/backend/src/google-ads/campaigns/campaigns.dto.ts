import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class ListCampaignsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsNumber()
  budgetAmountMicros: number;

  @IsOptional()
  @IsString()
  advertisingChannelType?: string;

  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED'])
  status?: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED', 'REMOVED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  budgetAmountMicros?: number;
}
