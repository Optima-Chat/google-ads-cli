/**
 * Auth Status Command - 查看认证状态
 *
 * 与 optima-agent 兼容
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getTokenData, isTokenExpired } from '../../lib/token-store.js';

export const statusCommand = new Command('status')
  .description('查看认证状态')
  .option('--json', '以 JSON 格式输出')
  .action((options) => {
    const tokenData = getTokenData();

    if (!tokenData) {
      if (options.json) {
        console.log(JSON.stringify({ loggedIn: false }, null, 2));
      } else {
        console.log();
        console.log(chalk.yellow('⚠️  您还未登录'));
        console.log();
        console.log(chalk.gray('请运行以下命令登录: ') + chalk.cyan('google-ads auth login'));
        console.log();
      }
      return;
    }

    const expired = isTokenExpired(tokenData);
    const expiresAt = new Date(tokenData.expires_at);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            loggedIn: true,
            expired,
            env: tokenData.env,
            user: tokenData.user || null,
            expiresAt: expiresAt.toISOString(),
          },
          null,
          2
        )
      );
    } else {
      console.log();

      const table = new Table({
        head: [chalk.cyan('认证状态'), chalk.cyan('值')],
        colWidths: [15, 50],
      });

      table.push(
        ['状态', expired ? chalk.red('已过期') : chalk.green('✓ 已认证')],
        ['环境', tokenData.env],
      );

      if (tokenData.user?.email) {
        table.push(['账号', tokenData.user.email]);
      }

      if (tokenData.user?.name) {
        table.push(['用户名', tokenData.user.name]);
      }

      table.push(['过期时间', expiresAt.toLocaleString('zh-CN')]);

      console.log(table.toString());
      console.log();

      if (expired) {
        console.log(chalk.yellow('⚠️  Token 已过期'));
        console.log(chalk.gray('请重新登录: ') + chalk.cyan('google-ads auth login'));
        console.log();
      }
    }
  });
