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
    userId: string,
    customerId: string,
    query: ListKeywordsQueryDto,
  ): Promise<unknown[]> {
    return this.googleAdsService.listKeywords(userId, customerId, {
      campaignId: query.campaignId,
      status: query.status,
      limit: query.limit,
    });
  }

  async add(
    userId: string,
    customerId: string,
    dto: AddKeywordsDto,
  ): Promise<unknown> {
    return this.googleAdsService.addKeywords(
      userId,
      customerId,
      dto.adGroupId,
      dto.keywords,
    );
  }

  async update(
    userId: string,
    customerId: string,
    adGroupId: string,
    criterionId: string,
    dto: UpdateKeywordDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateKeyword(
      userId,
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
    userId: string,
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    return this.googleAdsService.deleteKeyword(
      userId,
      customerId,
      adGroupId,
      criterionId,
    );
  }
}
