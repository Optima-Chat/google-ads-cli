import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';
import { AddTargetingDto } from './dto/add-targeting.dto';

@Injectable()
export class CampaignTargetingService {
  constructor(private googleAdsService: GoogleAdsService) {}

  /**
   * 列出广告系列定向条件
   */
  async list(customerId: string, campaignId: string): Promise<unknown[]> {
    return this.googleAdsService.listCampaignCriteria(customerId, campaignId);
  }

  /**
   * 添加广告系列定向条件
   */
  async add(
    customerId: string,
    campaignId: string,
    dto: AddTargetingDto,
  ): Promise<unknown> {
    return this.googleAdsService.addCampaignCriterion(
      customerId,
      campaignId,
      dto,
    );
  }

  /**
   * 删除广告系列定向条件
   */
  async remove(
    customerId: string,
    campaignId: string,
    criterionId: string,
  ): Promise<unknown> {
    return this.googleAdsService.removeCampaignCriterion(
      customerId,
      campaignId,
      criterionId,
    );
  }
}
