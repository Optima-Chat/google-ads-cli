/**
 * Auth Logout Command - 退出登录
 *
 * 清除 ~/.optima/token.json，与 optima-agent 兼容
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getTokenData, clearToken } from '../../lib/token-store.js';

export const logoutCommand = new Command('logout')
  .description('退出登录')
  .action(() => {
    const tokenData = getTokenData();

    if (!tokenData) {
      console.log();
      console.log(chalk.yellow('⚠️  您还未登录'));
      console.log();
      return;
    }

    const user = tokenData.user;

    clearToken();

    console.log();
    console.log(chalk.green('✅ 已退出登录'));
    if (user?.email) {
      console.log(chalk.gray(`   账号: ${user.email}`));
    }
    console.log();
    console.log(chalk.gray('如需重新登录，请运行: ') + chalk.cyan('google-ads auth login'));
    console.log();
  });
