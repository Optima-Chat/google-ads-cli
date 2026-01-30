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
    userId: string,
    customerId: string,
    query: ListCampaignsQueryDto,
  ): Promise<unknown[]> {
    return this.googleAdsService.listCampaigns(userId, customerId, {
      status: query.status,
      limit: query.limit,
    });
  }

  async get(
    userId: string,
    customerId: string,
    campaignId: string,
  ): Promise<unknown> {
    return this.googleAdsService.getCampaign(userId, customerId, campaignId);
  }

  async create(
    userId: string,
    customerId: string,
    dto: CreateCampaignDto,
  ): Promise<unknown> {
    return this.googleAdsService.createCampaign(userId, customerId, {
      name: dto.name,
      budgetAmountMicros: dto.budgetAmountMicros,
      advertisingChannelType: dto.advertisingChannelType,
      status: dto.status,
    });
  }

  async update(
    userId: string,
    customerId: string,
    campaignId: string,
    dto: UpdateCampaignDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateCampaign(userId, customerId, campaignId, {
      status: dto.status,
      name: dto.name,
      budgetAmountMicros: dto.budgetAmountMicros,
    });
  }

  async delete(
    userId: string,
    customerId: string,
    campaignId: string,
  ): Promise<unknown> {
    return this.googleAdsService.deleteCampaign(userId, customerId, campaignId);
  }
}
