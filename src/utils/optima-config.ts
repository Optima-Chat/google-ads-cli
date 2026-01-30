/**
 * Optima Config - 从 commerce-backend 获取商户配置
 */

import Conf from 'conf';

const config = new Conf({ projectName: 'google-ads-cli' });

// 环境配置
const OPTIMA_API_URLS: Record<string, string> = {
  ci: 'https://api.optima.chat',
  stage: 'https://api.stage.optima.onl',
  prod: 'https://api.optima.onl',
};

/**
 * 从 commerce-backend 获取商户的 Google Ads Customer ID
 * 如果成功获取，会自动保存到本地配置
 */
export async function fetchOptimaConfig(): Promise<void> {
  const token = process.env.OPTIMA_TOKEN;
  if (!token) {
    // 没有 OPTIMA_TOKEN，跳过远程获取
    return;
  }

  const env = process.env.OPTIMA_ENV || 'prod';
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
