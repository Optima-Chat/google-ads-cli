/**
 * Campaign Update Command - 更新广告系列
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新广告系列')
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--name <name>', '新名称')
  .option('--budget <amount>', '新每日预算（美元）')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    if (!options.status && !options.name && !options.budget) {
      console.log(chalk.red('请至少指定一个要更新的字段: --status, --name, 或 --budget'));
      return;
    }

    const spinner = ora('更新广告系列...').start();

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
      if (options.budget) {
        updateData.budgetAmountMicros = Math.round(parseFloat(options.budget) * 1000000);
      }

      const result = await client.updateCampaign(customerId, options.campaignId, updateData);

      spinner.succeed('广告系列已更新');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`\n✅ 广告系列 ${options.campaignId} 已更新`));
        if (options.status) console.log(chalk.gray(`状态: ${options.status}`));
        if (options.name) console.log(chalk.gray(`名称: ${options.name}`));
        if (options.budget) console.log(chalk.gray(`预算: $${options.budget}/天`));
      }
    } catch (error) {
      spinner.fail('更新失败');
      handleError(error);
    }
  });
