import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';
import {
  AddKeywordsDto,
  UpdateKeywordDto,
  ListKeywordsQueryDto,
} from './keywords.dto';

@Injectable()
export class KeywordsService {
  constructor(private googleAdsService: GoogleAdsService) {}

  async list(
    customerId: string,
    query: ListKeywordsQueryDto,
  ): Promise<unknown[]> {
    return this.googleAdsService.listKeywords(customerId, {
      campaignId: query.campaignId,
      status: query.status,
      limit: query.limit,
    });
  }

  async add(customerId: string, dto: AddKeywordsDto): Promise<unknown> {
    return this.googleAdsService.addKeywords(
      customerId,
      dto.adGroupId,
      dto.keywords,
    );
  }

  async update(
    customerId: string,
    adGroupId: string,
    criterionId: string,
    dto: UpdateKeywordDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateKeyword(
      customerId,
      adGroupId,
      criterionId,
      {
        status: dto.status,
        cpcBidMicros: dto.cpcBidMicros,
      },
    );
  }

  async delete(
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    return this.googleAdsService.deleteKeyword(
      customerId,
      adGroupId,
      criterionId,
    );
  }
}
