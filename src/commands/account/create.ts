/**
 * Account Create Command - 为客户创建 Google Ads 账号
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';

export const createCommand = new Command('create')
  .description('为客户创建 Google Ads 账号（需要 MCC 管理账号）')
  .requiredOption('--merchant-id <id>', '客户的 Merchant ID')
  .requiredOption('--currency <code>', '货币代码（如 USD, CNY）')
  .requiredOption('--timezone <timezone>', '时区（如 Asia/Shanghai, America/New_York）')
  .requiredOption('--name <name>', '账号名称（客户名称）')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('为客户创建 Google Ads 账号...').start();

    try {
      console.log(chalk.yellow('\n⚠️  注意: 此功能需要在 google-ads-api SDK 中实现账号创建逻辑'));
      console.log(chalk.gray('当前版本暂不支持直接通过 CLI 创建客户账号\n'));

      spinner.info('功能开发中');

      // TODO: 实现账号创建逻辑
      // 参考 MCP 的 manage_account create 实现
      // 需要使用 CustomerService.MutateCustomer API

      console.log(chalk.cyan.bold('📋 手动创建步骤:\n'));

      console.log(chalk.white('1. 登录你的 MCC 管理账号'));
      console.log(chalk.gray('   访问: ') + chalk.cyan('https://ads.google.com'));

      console.log(chalk.white('\n2. 点击 "账号" → "子账号"'));

      console.log(chalk.white('\n3. 点击 "创建新账号"'));

      console.log(chalk.white('\n4. 填写客户信息:'));
      console.log(chalk.gray(`   - 账号名称: ${options.name}`));
      console.log(chalk.gray(`   - 货币: ${options.currency}`));
      console.log(chalk.gray(`   - 时区: ${options.timezone}`));

      console.log(chalk.white('\n5. 创建完成后，记录客户账号 ID'));

      console.log(chalk.white('\n6. 使用客户账号 ID 进行后续操作:'));
      console.log(chalk.cyan(`   google-ads account check -c <CUSTOMER_ID>`));
      console.log(chalk.cyan(`   google-ads campaign create -c <CUSTOMER_ID> -n "广告系列名称" -b 10\n`));

      console.log(chalk.yellow('💡 提示: API 账号创建功能正在开发中'));
      console.log(chalk.gray('   将在后续版本中支持直接通过 CLI 创建客户账号\n'));

      if (options.json) {
        const result = {
          success: false,
          message: '账号创建功能开发中，请使用 Google Ads UI 手动创建',
          merchant_id: options.merchantId,
          suggested_settings: {
            name: options.name,
            currency: options.currency,
            timezone: options.timezone,
          },
          next_steps: [
            '登录 MCC 管理账号',
            '手动创建子账号',
            '记录客户账号 ID',
            '使用 account check 验证',
          ],
        };
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      spinner.fail('操作失败');
      handleError(error);
    }
  });
