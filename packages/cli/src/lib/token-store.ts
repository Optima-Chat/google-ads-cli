/**
 * Token Store - Optima JWT Token 存储和管理
 *
 * Token 存储位置：~/.optima/token.json
 * 与 optima-agent 兼容
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type {
  TokenData,
  TokenResponse,
  UserInfo,
  AuthStatus,
  Environment,
} from './auth-types.js';
import { ENV_CONFIG } from './auth-types.js';

const OPTIMA_DIR = join(homedir(), '.optima');
const TOKEN_FILE = join(OPTIMA_DIR, 'token.json');

/**
 * 确保 ~/.optima 目录存在
 */
export function ensureOptimaDir(): void {
  if (!existsSync(OPTIMA_DIR)) {
    mkdirSync(OPTIMA_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * 保存 Token
 */
export function saveToken(
  response: TokenResponse,
  env: Environment,
  user?: UserInfo,
): void {
  ensureOptimaDir();

  const tokenData: TokenData = {
    env,
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    token_type: response.token_type,
    expires_at: Date.now() + response.expires_in * 1000,
    user,
  };

  writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2), { mode: 0o600 });
}

/**
 * 读取 Token（按优先级）
 */
export function getToken(): string | null {
  // 1. 环境变量
  if (process.env.OPTIMA_TOKEN) {
    return process.env.OPTIMA_TOKEN;
  }

  // 2. token.json 文件
  const data = getTokenData();
  if (data) {
    return data.access_token;
  }

  return null;
}

/**
 * 读取完整 Token 数据
 */
export function getTokenData(): TokenData | null {
  if (!existsSync(TOKEN_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(TOKEN_FILE, 'utf-8');
    const data = JSON.parse(content);

    // 兼容两种格式
    return {
      env: data.env || 'prod',
      access_token: data.access_token || data.accessToken,
      refresh_token: data.refresh_token || data.refreshToken,
      token_type: data.token_type || 'Bearer',
      expires_at: data.expires_at || data.expiresAt || 0,
      user: data.user,
    };
  } catch {
    return null;
  }
}

/**
 * 清除 Token
 */
export function clearToken(): void {
  if (existsSync(TOKEN_FILE)) {
    unlinkSync(TOKEN_FILE);
  }
}

/**
 * 检查 Token 是否过期
 */
export function isTokenExpired(data?: TokenData | null): boolean {
  const tokenData = data ?? getTokenData();
  if (!tokenData) return true;

  // 提前 5 分钟视为过期
  return Date.now() > tokenData.expires_at - 5 * 60 * 1000;
}

/**
 * 获取用户信息
 */
export async function fetchUserInfo(
  accessToken: string,
  env: Environment,
): Promise<UserInfo> {
  const { authUrl } = ENV_CONFIG[env];

  const res = await fetch(`${authUrl}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user info');
  }

  return (await res.json()) as UserInfo;
}

/**
 * 获取认证状态
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  const data = getTokenData();

  if (!data) {
    return { loggedIn: false };
  }

  if (isTokenExpired(data)) {
    return { loggedIn: false };
  }

  // 如果有缓存的用户信息，直接使用
  if (data.user) {
    return {
      loggedIn: true,
      env: data.env,
      user: data.user,
      expiresAt: data.expires_at,
    };
  }

  // 否则从服务端获取
  try {
    const user = await fetchUserInfo(data.access_token, data.env);
    // 更新缓存
    const updatedData = { ...data, user };
    writeFileSync(TOKEN_FILE, JSON.stringify(updatedData, null, 2), {
      mode: 0o600,
    });

    return {
      loggedIn: true,
      env: data.env,
      user,
      expiresAt: data.expires_at,
    };
  } catch {
    return { loggedIn: false };
  }
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<boolean> {
  const data = getTokenData();
  if (!data?.refresh_token) {
    return false;
  }

  const { authUrl, clientId } = ENV_CONFIG[data.env];

  try {
    const res = await fetch(`${authUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: data.refresh_token,
        client_id: clientId,
      }),
    });

    if (!res.ok) {
      return false;
    }

    const tokenResponse = (await res.json()) as TokenResponse;
    saveToken(tokenResponse, data.env, data.user);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取当前环境的 Ads API URL
 */
export function getAdsApiUrl(): string {
  const data = getTokenData();
  const env = data?.env || 'prod';
  return process.env.ADS_BACKEND_URL || ENV_CONFIG[env].adsApiUrl;
}

// ============ TokenStore class for backward compatibility ============

export class TokenStore {
  async getToken(): Promise<string | null> {
    return getToken();
  }

  async hasToken(): Promise<boolean> {
    return !!getToken();
  }

  async saveToken(accessToken: string, refreshToken?: string): Promise<void> {
    const data = getTokenData();
    const env = data?.env || 'prod';
    saveToken(
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 24 * 60 * 60, // 24 hours
      },
      env,
    );
  }

  async clearToken(): Promise<void> {
    clearToken();
  }
}
