/**
 * Optima Config - 从 ads-backend 获取商户配置
 *
 * 通过 ads-backend 间接获取 commerce-backend 的商户配置
 * 不再直接调用 commerce-backend
 */

import Conf from 'conf';
import { getToken } from '../lib/token-store.js';
import { getApiClient } from '../lib/api-client.js';

const config = new Conf({ projectName: 'google-ads-cli' });

/**
 * 从 ads-backend 获取商户的 Google Ads Customer ID
 * 如果成功获取，会自动保存到本地配置
 */
export async function fetchOptimaConfig(): Promise<void> {
  const token = getToken();
  if (!token) {
    // 没有 token，跳过远程获取
    return;
  }

  try {
    const client = getApiClient();
    const me = await client.getMe();

    if (me.google_ads_customer_id) {
      // 保存到本地配置
      config.set('customerId', me.google_ads_customer_id);

      // 同时设置账号名称（如果有）
      if (me.merchant_name) {
        config.set('accountName', me.merchant_name);
      }
    }
  } catch {
    // 网络错误等，静默失败，回退到本地配置
  }
}
