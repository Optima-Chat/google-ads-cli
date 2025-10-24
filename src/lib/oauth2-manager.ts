/**
 * OAuth2 Manager - Google Ads OAuth2 认证管理
 */

import axios from 'axios';
import { OAuth2Token } from '../config.js';
import { loadConfig } from '../utils/config.js';
import { loadToken, saveToken, isTokenExpired } from './token-store.js';
import { AuthError } from '../utils/errors.js';

// Google OAuth2 端点
const OAUTH2_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Google Ads API 权限
const SCOPES = ['https://www.googleapis.com/auth/adwords'];

export class OAuth2Manager {
  /**
   * 生成授权 URL
   */
  getAuthorizationUrl(redirectUri: string): string {
    const config = loadConfig();

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline', // 获取 refresh_token
      prompt: 'consent', // 强制显示授权页面
    });

    return `${OAUTH2_AUTH_URL}?${params.toString()}`;
  }

  /**
   * 用授权码交换 token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuth2Token> {
    const config = loadConfig();

    try {
      const response = await axios.post(OAUTH2_TOKEN_URL, {
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const data = response.data;

      // 计算过期时间
      const expiresAt = Date.now() + data.expires_in * 1000;

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        scope: data.scope,
        token_type: data.token_type,
      };
    } catch (error: any) {
      if (error.response?.data?.error_description) {
        throw new AuthError(`OAuth2 错误: ${error.response.data.error_description}`);
      }
      throw new AuthError(`交换 token 失败: ${error.message}`);
    }
  }

  /**
   * 刷新 access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuth2Token> {
    const config = loadConfig();

    try {
      const response = await axios.post(OAUTH2_TOKEN_URL, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const data = response.data;

      // 计算过期时间
      const expiresAt = Date.now() + data.expires_in * 1000;

      return {
        access_token: data.access_token,
        refresh_token: refreshToken, // refresh_token 保持不变
        expires_at: expiresAt,
        scope: data.scope,
        token_type: data.token_type,
      };
    } catch (error: any) {
      if (error.response?.data?.error_description) {
        throw new AuthError(`刷新 token 失败: ${error.response.data.error_description}`);
      }
      throw new AuthError(`刷新 token 失败: ${error.message}`);
    }
  }

  /**
   * 获取有效的 access token（自动刷新）
   */
  async getAccessToken(): Promise<string> {
    const token = loadToken();

    if (!token) {
      throw new AuthError('未登录，请先运行: google-ads auth login');
    }

    // 如果 token 未过期，直接返回
    if (!isTokenExpired(token)) {
      return token.access_token;
    }

    // 如果过期，刷新 token
    try {
      const newToken = await this.refreshAccessToken(token.refresh_token);
      saveToken(newToken);
      return newToken.access_token;
    } catch (error) {
      throw new AuthError('Token 已过期且刷新失败，请重新登录: google-ads auth login');
    }
  }

  /**
   * 获取 refresh token
   */
  async getRefreshToken(): Promise<string> {
    const token = loadToken();

    if (!token) {
      throw new AuthError('未登录，请先运行: google-ads auth login');
    }

    return token.refresh_token;
  }
}
