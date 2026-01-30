import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAdsService } from '../google-ads/google-ads.service';

/**
 * Auth Controller - MCC Mode
 *
 * MCC 模式下不需要用户单独连接 Google Ads
 * 所有客户账号通过 MCC 统一管理
 */
@Controller('auth')
export class AuthController {
  constructor(private googleAdsService: GoogleAdsService) {}

  /**
   * Get Google Ads connection status
   * GET /api/v1/auth/google-ads/status
   *
   * 返回 MCC 下可访问的客户账号列表
   */
  @Get('google-ads/status')
  @UseGuards(JwtAuthGuard)
  async getGoogleAdsStatus() {
    try {
      const customerIds =
        await this.googleAdsService.listAccessibleCustomers();

      return {
        connected: true,
        mode: 'mcc',
        accessibleCustomerIds: customerIds,
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'mcc',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
