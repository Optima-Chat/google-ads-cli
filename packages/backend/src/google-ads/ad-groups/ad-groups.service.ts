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
    customerId: string,
    query: ListAdGroupsQueryDto,
  ): Promise<unknown[]> {
    return this.googleAdsService.listAdGroups(customerId, {
      campaignId: query.campaignId,
      status: query.status,
      limit: query.limit,
    });
  }

  async get(customerId: string, adGroupId: string): Promise<unknown> {
    return this.googleAdsService.getAdGroup(customerId, adGroupId);
  }

  async create(customerId: string, dto: CreateAdGroupDto): Promise<unknown> {
    return this.googleAdsService.createAdGroup(customerId, {
      name: dto.name,
      campaignId: dto.campaignId,
      cpcBidMicros: dto.cpcBidMicros,
      status: dto.status,
    });
  }

  async update(
    customerId: string,
    adGroupId: string,
    dto: UpdateAdGroupDto,
  ): Promise<unknown> {
    return this.googleAdsService.updateAdGroup(customerId, adGroupId, {
      status: dto.status,
      name: dto.name,
      cpcBidMicros: dto.cpcBidMicros,
    });
  }

  async delete(customerId: string, adGroupId: string): Promise<unknown> {
    return this.googleAdsService.deleteAdGroup(customerId, adGroupId);
  }
}
