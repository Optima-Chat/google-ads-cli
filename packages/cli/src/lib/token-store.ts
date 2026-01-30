/**
 * Token Store - Optima JWT Token 存储和管理
 *
 * 支持从以下位置读取 token：
 * 1. 环境变量 OPTIMA_TOKEN
 * 2. ~/.optima/token.json 文件
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface OptimaToken {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresAt?: number;
  expires_at?: number;
}

export class TokenStore {
  private tokenFilePath: string;

  constructor() {
    this.tokenFilePath = path.join(os.homedir(), '.optima', 'token.json');
  }

  /**
   * 获取 JWT access token
   */
  async getToken(): Promise<string | null> {
    // 1. 尝试从环境变量读取
    if (process.env.OPTIMA_TOKEN) {
      return process.env.OPTIMA_TOKEN;
    }

    // 2. 尝试从文件读取
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const content = fs.readFileSync(this.tokenFilePath, 'utf-8');
        const token: OptimaToken = JSON.parse(content);

        // 支持两种格式：camelCase 和 snake_case
        const accessToken = token.accessToken || token.access_token;
        if (accessToken) {
          return accessToken;
        }
      }
    } catch {
      // 忽略文件读取错误
    }

    return null;
  }

  /**
   * 检查是否已有 token
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * 保存 token 到文件
   */
  async saveToken(accessToken: string, refreshToken?: string): Promise<void> {
    const dir = path.dirname(this.tokenFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const token: OptimaToken = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    fs.writeFileSync(this.tokenFilePath, JSON.stringify(token, null, 2));
  }

  /**
   * 清除 token
   */
  async clearToken(): Promise<void> {
    if (fs.existsSync(this.tokenFilePath)) {
      fs.unlinkSync(this.tokenFilePath);
    }
  }
}

// ============ Legacy exports for backward compatibility ============

import { OAuth2Token } from '../config.js';

/**
 * 加载 Google Ads refresh token（从环境变量）
 * @deprecated 使用 TokenStore 类替代
 */
export function loadToken(): OAuth2Token | null {
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!refreshToken) {
    return null;
  }

  return {
    access_token: '',
    refresh_token: refreshToken,
    expires_at: 0,
    scope: 'https://www.googleapis.com/auth/adwords',
    token_type: 'Bearer',
  };
}

/**
 * 检查是否已有 Google Ads token
 * @deprecated 使用 TokenStore 类替代
 */
export function hasToken(): boolean {
  return !!process.env.GOOGLE_ADS_REFRESH_TOKEN;
}

/**
 * 检查 token 是否过期
 */
export function isTokenExpired(token: OAuth2Token): boolean {
  const expiryBuffer = 5 * 60 * 1000;
  return Date.now() >= token.expires_at - expiryBuffer;
}
