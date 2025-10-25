/**
 * Token Store - OAuth2 Token 存储和管理（环境变量方式）
 */

import { OAuth2Token } from '../config.js';

/**
 * 加载 token（从环境变量）
 */
export function loadToken(): OAuth2Token | null {
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!refreshToken) {
    return null;
  }

  // 从环境变量构建 token 对象
  // access_token 会在使用时通过 refresh_token 获取
  return {
    access_token: '', // 将在 OAuth2Manager 中刷新获取
    refresh_token: refreshToken,
    expires_at: 0, // 需要刷新
    scope: 'https://www.googleapis.com/auth/adwords',
    token_type: 'Bearer',
  };
}

/**
 * 检查是否已有 token
 */
export function hasToken(): boolean {
  return !!process.env.GOOGLE_ADS_REFRESH_TOKEN;
}

/**
 * 检查 token 是否过期
 */
export function isTokenExpired(token: OAuth2Token): boolean {
  // 提前 5 分钟视为过期（留出刷新时间）
  const expiryBuffer = 5 * 60 * 1000;
  return Date.now() >= token.expires_at - expiryBuffer;
}
