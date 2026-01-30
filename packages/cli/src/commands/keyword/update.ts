/**
 * Keyword Update Command - 更新关键词
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新关键词')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--criterion-id <id>', '关键词条件 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--bid <amount>', '每次点击出价（美元）')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    if (!options.status && !options.bid) {
      console.log(chalk.red('请至少指定一个要更新的字段: --status 或 --bid'));
      return;
    }

    const spinner = ora('更新关键词...').start();

    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const updateData: any = {};
      if (options.status) {
        updateData.status = options.status;
      }
      if (options.bid) {
        updateData.cpcBidMicros = Math.round(parseFloat(options.bid) * 1000000);
      }

      const result = await client.updateKeyword(customerId, options.adGroupId, options.criterionId, updateData);

      spinner.succeed('关键词已更新');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`\n✅ 关键词 ${options.criterionId} 已更新`));
        if (options.status) console.log(chalk.gray(`状态: ${options.status}`));
        if (options.bid) console.log(chalk.gray(`出价: $${options.bid}`));
      }
    } catch (error) {
      spinner.fail('更新失败');
      handleError(error);
    }
  });
