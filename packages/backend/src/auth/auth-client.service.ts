import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TokenVerifyResult {
  valid: boolean;
  user_id?: string;
  role?: string;
  email?: string;
  error?: string;
}

/**
 * Auth Client Service
 *
 * 使用 OAuth 2.0 Client Credentials 流程与 user-auth 服务通信
 * 参考 commerce-backend 的 auth_client.py 实现
 */
@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authUrl: string;
  private readonly timeout: number = 10000;

  // 服务 token 缓存
  private serviceToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(private configService: ConfigService) {
    this.clientId = configService.get<string>('OAUTH_CLIENT_ID', '');
    this.clientSecret = configService.get<string>('OAUTH_CLIENT_SECRET', '');
    this.authUrl = configService
      .get<string>('USER_AUTH_URL', 'https://auth.optima.onl')
      .replace(/\/$/, '');

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn(
        'OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET not configured',
      );
    }

    this.logger.log(`Auth client initialized: ${this.authUrl}`);
  }

  /**
   * 获取服务间认证 token (Client Credentials flow)
   */
  async getServiceToken(forceRefresh = false): Promise<string> {
    // 检查缓存的 token 是否有效（提前 5 分钟刷新）
    if (
      !forceRefresh &&
      this.serviceToken &&
      this.tokenExpiresAt &&
      Date.now() < this.tokenExpiresAt - 300000
    ) {
      return this.serviceToken as string;
    }

    this.logger.debug('Fetching new service token');

    try {
      const response = await axios.post(
        `${this.authUrl}/api/v1/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'api:internal',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: this.timeout,
        },
      );

      this.serviceToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiresAt = Date.now() + expiresIn * 1000;

      this.logger.debug(`Service token obtained, expires in ${expiresIn}s`);
      return this.serviceToken as string;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get service token: ${message}`);
      throw new Error(`Failed to get service token: ${message}`);
    }
  }

  /**
   * 验证用户 token
   */
  async verifyUserToken(userToken: string): Promise<TokenVerifyResult> {
    if (!userToken) {
      return { valid: false, error: 'Token is empty' };
    }

    try {
      const serviceToken = await this.getServiceToken();

      const response = await axios.post(
        `${this.authUrl}/api/v1/auth/verify`,
        { token: userToken },
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`,
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        },
      );

      if (response.data.valid) {
        this.logger.debug(`Token verified for user: ${response.data.user_id}`);
        return {
          valid: true,
          user_id: response.data.user_id,
          role: response.data.role,
          email: response.data.email,
        };
      } else {
        return {
          valid: false,
          error: response.data.error || 'Invalid token',
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Token verification failed: ${message}`);
      return { valid: false, error: message };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; error?: string }> {
    try {
      const serviceToken = await this.getServiceToken();
      if (serviceToken) {
        return { status: 'healthy' };
      }
      return { status: 'unhealthy', error: 'Failed to get service token' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      return { status: 'unhealthy', error: message };
    }
  }
}
