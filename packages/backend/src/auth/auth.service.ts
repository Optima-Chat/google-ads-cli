import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Auth Service - MCC Mode
 *
 * MCC 模式下，所有 Google Ads 认证通过环境变量配置
 * 不需要存储用户凭证
 */
@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  /**
   * 验证配置是否完整
   */
  isConfigured(): boolean {
    const requiredEnvVars = [
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_MANAGER_ACCOUNT_ID',
    ];

    return requiredEnvVars.every(
      (key) => !!this.configService.get<string>(key),
    );
  }
}
