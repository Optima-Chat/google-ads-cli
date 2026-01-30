import { Injectable } from '@nestjs/common';
import { GoogleAdsService } from '../google-ads.service';

@Injectable()
export class QueryService {
  constructor(private googleAdsService: GoogleAdsService) {}

  async execute(customerId: string, query: string): Promise<unknown[]> {
    return this.googleAdsService.query(customerId, query);
  }
}
