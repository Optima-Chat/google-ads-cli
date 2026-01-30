/**
 * Auth Logout Command - 退出登录
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { hasToken } from '../../lib/token-store.js';
import { warn, info } from '../../utils/logger.js';
import { updateEnvFile } from '../../utils/env-updater.js';

export const logoutCommand = new Command('logout')
  .description('退出登录（清除 refresh token）')
  .action(async () => {
    if (!hasToken()) {
      warn('您还未登录');
      return;
    }

    // 从 .env 文件删除 GOOGLE_ADS_REFRESH_TOKEN
    try {
      updateEnvFile('GOOGLE_ADS_REFRESH_TOKEN', '');
      console.log(chalk.green('✓ 已退出登录（refresh token 已从 .env 清除）\n'));
      info('如需重新登录，请运行: google-ads auth login');
    } catch (error) {
      console.log(chalk.yellow('⚠ 无法自动清除 refresh token'));
      console.log(chalk.gray('请手动从 .env 文件删除或注释以下行:'));
      console.log(chalk.cyan('  GOOGLE_ADS_REFRESH_TOKEN=...\n'));
    }
  });
