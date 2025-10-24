/**
 * Auth Logout Command - 退出登录
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { deleteToken, hasToken } from '../../lib/token-store.js';
import { success, warn } from '../../utils/logger.js';

export const logoutCommand = new Command('logout')
  .description('退出登录（删除本地 token）')
  .option('-y, --yes', '跳过确认')
  .action(async (options) => {
    if (!hasToken()) {
      warn('您还未登录');
      return;
    }

    // 确认删除
    if (!options.yes) {
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: '确定要退出登录吗？',
          default: false,
        },
      ]);

      if (!confirmed) {
        console.log(chalk.gray('已取消'));
        return;
      }
    }

    // 删除 token
    deleteToken();
    success('已退出登录');
    console.log();
    console.log(chalk.gray('如需重新登录，请运行: ') + chalk.cyan('google-ads auth login'));
  });
