/**
 * Optima Config - 从 commerce-backend 获取商户配置
 */

import Conf from 'conf';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const config = new Conf({ projectName: 'google-ads-cli' });

// 环境配置
const OPTIMA_API_URLS: Record<string, string> = {
  ci: 'https://api.optima.chat',
  stage: 'https://api.stage.optima.onl',
  prod: 'https://api.optima.onl',
};

// optima-agent token 文件路径
const OPTIMA_TOKEN_FILE = join(homedir(), '.optima', 'token.json');

interface TokenFileData {
  env: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

/**
 * 获取 Optima Token 和环境
 * 优先级：1. 环境变量 2. ~/.optima/token.json
 */
function getOptimaToken(): { token: string; env: string } | null {
  // 1. 环境变量优先
  if (process.env.OPTIMA_TOKEN) {
    return {
      token: process.env.OPTIMA_TOKEN,
      env: process.env.OPTIMA_ENV || 'prod',
    };
  }

  // 2. 从 ~/.optima/token.json 读取（兼容 optima-agent）
  if (existsSync(OPTIMA_TOKEN_FILE)) {
    try {
      const data = JSON.parse(readFileSync(OPTIMA_TOKEN_FILE, 'utf-8')) as TokenFileData;
      if (data.access_token) {
        return {
          token: data.access_token,
          env: data.env || 'prod',
        };
      }
    } catch {
      // 解析失败，静默忽略
    }
  }

  return null;
}

/**
 * 从 commerce-backend 获取商户的 Google Ads Customer ID
 * 如果成功获取，会自动保存到本地配置
 */
export async function fetchOptimaConfig(): Promise<void> {
  const tokenInfo = getOptimaToken();
  if (!tokenInfo) {
    // 没有 token，跳过远程获取
    return;
  }

  const { token, env } = tokenInfo;
  const apiUrl = OPTIMA_API_URLS[env] || OPTIMA_API_URLS.prod;

  try {
    const response = await fetch(`${apiUrl}/api/merchants/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 静默失败，回退到本地配置
      return;
    }

    const merchant = await response.json() as {
      google_ads_customer_id?: string;
      name?: string;
    };

    if (merchant.google_ads_customer_id) {
      // 保存到本地配置
      config.set('customerId', merchant.google_ads_customer_id);

      // 同时设置账号名称（如果有）
      if (merchant.name) {
        config.set('accountName', merchant.name);
      }
    }
  } catch {
    // 网络错误等，静默失败
  }
}
