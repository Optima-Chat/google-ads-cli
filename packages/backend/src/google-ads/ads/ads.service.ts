import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';
import { CreateAdDto, UpdateAdDto, ListAdsQueryDto } from './ads.dto';

@Injectable()
export class AdsService {
  constructor(private googleAdsService: GoogleAdsService) {}

  async list(customerId: string, query: ListAdsQueryDto): Promise<unknown[]> {
    return this.googleAdsService.listAds(customerId, {
      campaignId: query.campaignId,
      adGroupId: query.adGroupId,
      status: query.status,
      limit: query.limit,
    });
  }

  async get(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    return this.googleAdsService.getAd(customerId, adGroupId, adId);
  }

  async create(customerId: string, dto: CreateAdDto): Promise<unknown> {
    return this.googleAdsService.createAd(customerId, {
      adGroupId: dto.adGroupId,
      headlines: dto.headlines,
      descriptions: dto.descriptions,
      finalUrl: dto.finalUrl,
      path1: dto.path1,
      path2: dto.path2,
      status: dto.status,
    });
  }

  async update(
    customerId: string,
    adGroupId: string,
    adId: string,
    dto: UpdateAdDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateAd(customerId, adGroupId, adId, {
      status: dto.status,
    });
  }

  async delete(
    customerId: string,
    adGroupId: string,
    adId: string,
  ): Promise<unknown> {
    return this.googleAdsService.deleteAd(customerId, adGroupId, adId);
  }
}
