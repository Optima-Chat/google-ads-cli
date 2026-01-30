import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListKeywordsQueryDto {
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

export class KeywordItem {
  @IsString()
  text: string;

  @IsOptional()
  @IsEnum(['EXACT', 'PHRASE', 'BROAD'])
  matchType?: string;
}

export class AddKeywordsDto {
  @IsString()
  adGroupId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeywordItem)
  keywords: KeywordItem[];
}

export class UpdateKeywordDto {
  @IsOptional()
  @IsEnum(['ENABLED', 'PAUSED', 'REMOVED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  cpcBidMicros?: number;
}
