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
   * Check account status with detailed link status
   * GET /api/v1/accounts/:customerId/check
   *
   * Returns:
   * - status: 'active' | 'pending' | 'refused' | 'canceled' | 'not_linked'
   * - customerId: string
   * - info?: customer info (only when active)
   * - message?: human readable message
   */
  @Get(':customerId/check')
  async checkAccount(@Param('customerId') customerId: string) {
    // First, get the link status from MCC
    const linkStatus = await this.googleAdsService.getClientLinkStatus(customerId);

    const statusMessages: Record<string, string> = {
      active: '账号已连接，可以访问',
      pending: '邀请已发送，等待客户接受',
      refused: '客户已拒绝邀请',
      canceled: '邀请已取消',
      not_linked: '该账号未关联到 Optima MCC',
    };

    // If active, also get customer info
    if (linkStatus.status === 'active') {
      try {
        const info = await this.googleAdsService.getCustomerInfo(customerId);
        return {
          status: 'active',
          customerId,
          info,
          message: statusMessages.active,
        };
      } catch (error) {
        // Link is active but can't access - might be permission issue
        return {
          status: 'active',
          customerId,
          info: null,
          message: '账号已连接，但无法获取详细信息',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return {
      status: linkStatus.status,
      customerId,
      message: statusMessages[linkStatus.status] || '未知状态',
    };
  }
}
