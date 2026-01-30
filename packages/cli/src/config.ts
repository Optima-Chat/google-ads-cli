/**
 * 全局配置类型定义
 */

/**
 * Google Ads CLI 配置
 */
export interface GoogleAdsConfig {
  // Google Ads API 凭据
  developerToken: string;
  clientId: string;
  clientSecret: string;

  // 账号 ID
  loginCustomerId?: string; // MCC 账号（可选）
  defaultCustomerId?: string; // 默认客户账号

  // CLI 设置
  outputFormat: 'table' | 'json' | 'csv' | 'jsonl';
  colorOutput: boolean;
}

/**
 * OAuth2 Token
 */
export interface OAuth2Token {
  access_token: string;
  refresh_token: string;
  expires_at: number; // 时间戳（毫秒）
  scope: string;
  token_type: string;
}

/**
 * 配置文件路径
 */
export const CONFIG_DIR = '.config/google-ads-cli';
export const CONFIG_FILE = 'config.json';
export const CREDENTIALS_FILE = 'credentials.json';
