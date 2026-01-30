import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAdsService } from '../google-ads/google-ads.service';
import { CommerceClientService } from './commerce-client.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthenticatedUser } from './jwt.strategy';

/**
 * Auth Controller - MCC Mode
 *
 * MCC 模式下不需要用户单独连接 Google Ads
 * 所有客户账号通过 MCC 统一管理
 */
@Controller('auth')
export class AuthController {
  constructor(
    private googleAdsService: GoogleAdsService,
    private commerceClient: CommerceClientService,
  ) {}

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

  /**
   * Get current user's ads configuration
   * GET /api/v1/auth/me
   *
   * 返回当前用户的 Google Ads 配置，包括从 commerce-backend 获取的 customer_id
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    const merchant = await this.commerceClient.getMerchantByUserId(user.userId);

    return {
      user_id: user.userId,
      email: user.email,
      role: user.role,
      google_ads_customer_id: merchant?.google_ads_customer_id || null,
      merchant_name: merchant?.name || null,
    };
  }
}
