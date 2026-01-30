import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthClientService } from './auth-client.service';

export interface MerchantInfo {
  id: string;
  name?: string;
  google_ads_customer_id?: string;
}

/**
 * Commerce Client Service
 *
 * 从 commerce-backend 获取商户信息
 * 使用服务间认证 (Client Credentials)
 */
@Injectable()
export class CommerceClientService {
  private readonly logger = new Logger(CommerceClientService.name);
  private readonly commerceUrl: string;
  private readonly timeout: number = 10000;

  constructor(
    private configService: ConfigService,
    private authClient: AuthClientService,
  ) {
    this.commerceUrl = configService
      .get<string>('COMMERCE_BACKEND_URL', 'https://api.optima.onl')
      .replace(/\/$/, '');

    this.logger.log(`Commerce client initialized: ${this.commerceUrl}`);
  }

  /**
   * 获取商户信息（通过用户 ID）
   */
  async getMerchantByUserId(userId: string): Promise<MerchantInfo | null> {
    try {
      const serviceToken = await this.authClient.getServiceToken();

      const response = await axios.get(
        `${this.commerceUrl}/api/internal/merchants/by-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`,
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        },
      );

      this.logger.debug(`Merchant info fetched for user: ${userId}`);
      return response.data as MerchantInfo;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.debug(`No merchant found for user: ${userId}`);
        return null;
      }

      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch merchant info: ${message}`);
      return null;
    }
  }

  /**
   * 获取商户的 Google Ads Customer ID
   */
  async getCustomerId(userId: string): Promise<string | null> {
    const merchant = await this.getMerchantByUserId(userId);
    return merchant?.google_ads_customer_id || null;
  }
}
