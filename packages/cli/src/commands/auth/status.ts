/**
 * Auth Status Command - 查看认证状态
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { loadToken, hasToken, isTokenExpired } from '../../lib/token-store.js';
import { warn } from '../../utils/logger.js';

export const statusCommand = new Command('status')
  .description('查看认证状态')
  .option('--json', '以 JSON 格式输出')
  .action((options) => {
    if (!hasToken()) {
      warn('您还未登录');
      console.log();
      console.log(chalk.gray('请运行以下命令登录: ') + chalk.cyan('google-ads auth login'));
      return;
    }

    const token = loadToken();
    if (!token) {
      warn('无法加载 token 文件');
      return;
    }

    const expired = isTokenExpired(token);
    const expiresAt = new Date(token.expires_at);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            authenticated: true,
            expired,
            expires_at: expiresAt.toISOString(),
            scope: token.scope,
          },
          null,
          2
        )
      );
    } else {
      const table = new Table({
        head: [chalk.cyan('认证状态'), chalk.cyan('值')],
        colWidths: [20, 60],
      });

      table.push(
        ['状态', expired ? chalk.red('已过期（将自动刷新）') : chalk.green('✓ 已认证')],
        ['过期时间', expiresAt.toLocaleString('zh-CN')],
        ['权限范围', token.scope]
      );

      console.log('\n' + table.toString() + '\n');

      if (expired) {
        console.log(
          chalk.yellow('⚠️  Token 已过期，但会在下次使用时自动刷新')
        );
        console.log(
          chalk.gray(
            '   如果自动刷新失败，请重新登录: ') + chalk.cyan('google-ads auth login\n'
          )
        );
      }
    }
  });
