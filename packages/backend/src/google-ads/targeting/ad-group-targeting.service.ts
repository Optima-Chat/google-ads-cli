import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';
import { AddTargetingDto } from './dto/add-targeting.dto';

@Injectable()
export class AdGroupTargetingService {
  constructor(private googleAdsService: GoogleAdsService) {}

  /**
   * 列出广告组定向条件
   */
  async list(customerId: string, adGroupId: string): Promise<unknown[]> {
    return this.googleAdsService.listAdGroupCriteria(customerId, adGroupId);
  }

  /**
   * 添加广告组定向条件
   */
  async add(
    customerId: string,
    adGroupId: string,
    dto: AddTargetingDto,
  ): Promise<unknown> {
    return this.googleAdsService.addAdGroupCriterion(
      customerId,
      adGroupId,
      dto,
    );
  }

  /**
   * 删除广告组定向条件
   */
  async remove(
    customerId: string,
    adGroupId: string,
    criterionId: string,
  ): Promise<unknown> {
    return this.googleAdsService.removeAdGroupCriterion(
      customerId,
      adGroupId,
      criterionId,
    );
  }
}
