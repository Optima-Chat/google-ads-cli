import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ListCampaignsQueryDto,
} from './campaigns.dto';

@Injectable()
export class CampaignsService {
  constructor(private googleAdsService: GoogleAdsService) {}

  async list(
    customerId: string,
    query: ListCampaignsQueryDto,
  ): Promise<unknown[]> {
    return this.googleAdsService.listCampaigns(customerId, {
      status: query.status,
      limit: query.limit,
    });
  }

  async get(customerId: string, campaignId: string): Promise<unknown> {
    return this.googleAdsService.getCampaign(customerId, campaignId);
  }

  async create(customerId: string, dto: CreateCampaignDto): Promise<unknown> {
    return this.googleAdsService.createCampaign(customerId, {
      name: dto.name,
      budgetAmountMicros: dto.budgetAmountMicros,
      advertisingChannelType: dto.advertisingChannelType,
      status: dto.status,
    });
  }

  async update(
    customerId: string,
    campaignId: string,
    dto: UpdateCampaignDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateCampaign(customerId, campaignId, {
      status: dto.status,
      name: dto.name,
      budgetAmountMicros: dto.budgetAmountMicros,
    });
  }

  async delete(customerId: string, campaignId: string): Promise<unknown> {
    return this.googleAdsService.deleteCampaign(customerId, campaignId);
  }
}
