import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class ListAdsQueryDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  adGroupId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateAdDto {
  @IsString()
  adGroupId: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(15)
  @IsString({ each: true })
  headlines: string[];

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  descriptions: string[];

  @IsString()
  finalUrl: string;

  @IsOptional()
  @IsString()
  path1?: string;

  @IsOptional()
  @IsString()
  path2?: string;

  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED'])
  status?: string;
}

export class UpdateAdDto {
  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED', 'REMOVED'])
  status?: string;
}
