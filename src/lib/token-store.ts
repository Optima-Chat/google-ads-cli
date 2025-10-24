/**
 * Token Store - OAuth2 Token 存储和管理
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { OAuth2Token, CREDENTIALS_FILE } from '../config.js';
import { getConfigDir } from '../utils/config.js';

/**
 * 获取凭据文件路径
 */
export function getCredentialsPath(): string {
  return join(getConfigDir(), CREDENTIALS_FILE);
}

/**
 * 检查是否已有 token
 */
export function hasToken(): boolean {
  return existsSync(getCredentialsPath());
}

/**
 * 加载 token
 */
export function loadToken(): OAuth2Token | null {
  if (!hasToken()) {
    return null;
  }

  try {
    const data = readFileSync(getCredentialsPath(), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * 保存 token
 */
export function saveToken(token: OAuth2Token): void {
  const configDir = getConfigDir();

  // 确保目录存在
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // 写入 token
  writeFileSync(getCredentialsPath(), JSON.stringify(token, null, 2), 'utf-8');
}

/**
 * 删除 token
 */
export function deleteToken(): void {
  if (hasToken()) {
    unlinkSync(getCredentialsPath());
  }
}

/**
 * 检查 token 是否过期
 */
export function isTokenExpired(token: OAuth2Token): boolean {
  // 提前 5 分钟视为过期（留出刷新时间）
  const expiryBuffer = 5 * 60 * 1000;
  return Date.now() >= token.expires_at - expiryBuffer;
}
