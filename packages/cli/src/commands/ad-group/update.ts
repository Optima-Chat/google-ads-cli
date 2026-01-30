/**
 * Ad Group Update Command - 更新广告组
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新广告组')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--name <name>', '新名称')
  .option('--cpc-bid <amount>', 'CPC 出价（美元）')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    if (!options.status && !options.name && !options.cpcBid) {
      console.log(chalk.red('请至少指定一个要更新的字段: --status, --name, 或 --cpc-bid'));
      return;
    }

    const spinner = ora('更新广告组...').start();

    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const updateData: any = {};
      if (options.status) {
        updateData.status = options.status;
      }
      if (options.name) {
        updateData.name = options.name;
      }
      if (options.cpcBid) {
        updateData.cpcBidMicros = Math.round(parseFloat(options.cpcBid) * 1000000);
      }

      const result = await client.updateAdGroup(customerId, options.adGroupId, updateData);

      spinner.succeed('广告组已更新');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`\n✅ 广告组 ${options.adGroupId} 已更新`));
        if (options.status) console.log(chalk.gray(`状态: ${options.status}`));
        if (options.name) console.log(chalk.gray(`名称: ${options.name}`));
        if (options.cpcBid) console.log(chalk.gray(`CPC 出价: $${options.cpcBid}`));
      }
    } catch (error) {
      spinner.fail('更新失败');
      handleError(error);
    }
  });
