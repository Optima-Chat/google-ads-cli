import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoogleAdsService } from './google-ads.service';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private googleAdsService: GoogleAdsService) {}

  /**
   * List accessible Google Ads accounts
   * GET /api/v1/accounts
   */
  @Get()
  async listAccounts() {
    const customerIds = await this.googleAdsService.listAccessibleCustomers();

    return {
      accounts: customerIds.map((id) => ({ customerId: id })),
    };
  }

  /**
   * Get account info
   * GET /api/v1/accounts/:customerId
   */
  @Get(':customerId')
  async getAccount(@Param('customerId') customerId: string) {
    const info = await this.googleAdsService.getCustomerInfo(customerId);
    return info;
  }

  /**
   * Check account status
   * GET /api/v1/accounts/:customerId/check
   */
  @Get(':customerId/check')
  async checkAccount(@Param('customerId') customerId: string) {
    try {
      const info = await this.googleAdsService.getCustomerInfo(customerId);
      return {
        connected: true,
        customerId,
        info,
      };
    } catch (error) {
      return {
        connected: false,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
