/**
 * Account Check Command - 检查账号配置状态
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const checkCommand = new Command('check')
  .description('检查账号配置状态（账单、权限等）')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('检查账号状态...').start();

    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      // Check account via backend API
      const accountCheck = await client.checkAccount(customerId);

      spinner.succeed('账号状态检查完成');

      if (options.json) {
        console.log(JSON.stringify(accountCheck, null, 2));
      } else {
        // Display in table format
        console.log(chalk.cyan.bold('\n📊 账号状态\n'));

        const table = new Table({
          chars: {
            top: '─',
            'top-mid': '┬',
            'top-left': '┌',
            'top-right': '┐',
            bottom: '─',
            'bottom-mid': '┴',
            'bottom-left': '└',
            'bottom-right': '┘',
            left: '│',
            'left-mid': '├',
            mid: '─',
            'mid-mid': '┼',
            right: '│',
            'right-mid': '┤',
            middle: '│',
          },
        });

        const checkResult = accountCheck as any;

        // Customer info
        table.push(
          [chalk.gray('账号 ID'), chalk.white(checkResult.customerId || customerId)],
          [chalk.gray('连接状态'), checkResult.connected ? chalk.green('✅ 已连接') : chalk.red('❌ 未连接')],
        );

        if (checkResult.info) {
          const info = checkResult.info;
          if (info.descriptive_name) {
            table.push([chalk.gray('账号名称'), chalk.white(info.descriptive_name)]);
          }
          if (info.currency_code) {
            table.push([chalk.gray('货币'), chalk.white(info.currency_code)]);
          }
          if (info.time_zone) {
            table.push([chalk.gray('时区'), chalk.white(info.time_zone)]);
          }
        }

        console.log(table.toString());

        // Recommendations
        console.log(chalk.cyan.bold('\n💡 建议\n'));

        if (checkResult.connected) {
          console.log(chalk.green('✅ 账号已连接，可以开始使用 Google Ads API！\n'));
          console.log(chalk.gray('快速开始:'));
          console.log(chalk.cyan(`   google-ads campaign list\n`));
        } else {
          console.log(chalk.yellow('⚠️  账号未连接\n'));
          console.log(chalk.gray('请确保已登录并完成 Google Ads 连接：'));
          console.log(chalk.cyan('   google-ads auth login\n'));
        }
      }
    } catch (error) {
      spinner.fail('检查失败');
      handleError(error);
    }
  });
