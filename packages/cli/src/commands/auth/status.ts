/**
 * Auth Status Command - 查看认证状态
 */

import { Command } from 'commander';
import { getTokenData, isTokenExpired } from '../../lib/token-store.js';

export const statusCommand = new Command('status')
  .description('查看认证状态')
  .action(() => {
    const tokenData = getTokenData();

    if (!tokenData) {
      console.log(JSON.stringify({
        logged_in: false,
        message: '未登录，请运行 google-ads auth login'
      }, null, 2));
      return;
    }

    const expired = isTokenExpired(tokenData);
    const expiresAt = new Date(tokenData.expires_at);

    console.log(JSON.stringify({
      logged_in: true,
      expired,
      env: tokenData.env,
      user: tokenData.user || null,
      expires_at: expiresAt.toISOString(),
    }, null, 2));
  });
