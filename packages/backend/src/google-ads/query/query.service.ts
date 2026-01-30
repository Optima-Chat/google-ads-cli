import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';

@Injectable()
export class QueryService {
  constructor(private googleAdsService: GoogleAdsService) {}

  async execute(
    userId: string,
    customerId: string,
    query: string,
  ): Promise<unknown[]> {
    return this.googleAdsService.query(userId, customerId, query);
  }
}
