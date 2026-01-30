import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';
import {
  CreateAdGroupDto,
  UpdateAdGroupDto,
  ListAdGroupsQueryDto,
} from './ad-groups.dto';

@Injectable()
export class AdGroupsService {
  constructor(private googleAdsService: GoogleAdsService) {}

  async list(
    userId: string,
    customerId: string,
    query: ListAdGroupsQueryDto,
  ): Promise<unknown[]> {
    return this.googleAdsService.listAdGroups(userId, customerId, {
      campaignId: query.campaignId,
      status: query.status,
      limit: query.limit,
    });
  }

  async get(
    userId: string,
    customerId: string,
    adGroupId: string,
  ): Promise<unknown> {
    return this.googleAdsService.getAdGroup(userId, customerId, adGroupId);
  }

  async create(
    userId: string,
    customerId: string,
    dto: CreateAdGroupDto,
  ): Promise<unknown> {
    return this.googleAdsService.createAdGroup(userId, customerId, {
      name: dto.name,
      campaignId: dto.campaignId,
      cpcBidMicros: dto.cpcBidMicros,
      status: dto.status,
    });
  }

  async update(
    userId: string,
    customerId: string,
    adGroupId: string,
    dto: UpdateAdGroupDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateAdGroup(userId, customerId, adGroupId, {
      status: dto.status,
      name: dto.name,
      cpcBidMicros: dto.cpcBidMicros,
    });
  }

  async delete(
    userId: string,
    customerId: string,
    adGroupId: string,
  ): Promise<unknown> {
    return this.googleAdsService.deleteAdGroup(userId, customerId, adGroupId);
  }
}
