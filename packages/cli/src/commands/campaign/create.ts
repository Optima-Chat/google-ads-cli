/**
 * Campaign Create Command - 创建广告系列
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const createCommand = new Command('create')
  .description('创建广告系列')
  .requiredOption('-n, --name <name>', '广告系列名称')
  .requiredOption('-b, --budget <amount>', '每日预算（美元）', parseFloat)
  .option('--status <status>', '状态 (ENABLED, PAUSED)', 'PAUSED')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('创建广告系列...').start();

    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      // 转换预算为 micros
      const budgetMicros = Math.round(options.budget * 1000000);

      const result = await client.createCampaign(customerId, {
        name: options.name,
        budgetAmountMicros: budgetMicros,
        status: options.status,
      });

      spinner.succeed('广告系列创建成功');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green('\n✅ 广告系列已创建'));
        console.log(chalk.gray('名称:'), chalk.white(options.name));
        console.log(chalk.gray('预算:'), chalk.white(`$${options.budget}/天`));
        console.log(chalk.gray('状态:'), chalk.white(options.status));

        // 提取创建的资源名称
        const res = result as any;
        if (res?.campaignId) {
          console.log(chalk.gray('Campaign ID:'), chalk.cyan(res.campaignId));
          console.log(chalk.gray('\n💡 下一步: 创建广告组'));
          console.log(chalk.cyan(`   google-ads ad-group create --campaign-id ${res.campaignId} -n "广告组名称"`));
        }
      }
    } catch (error: any) {
      spinner.fail('创建失败');
      console.error('详细错误:', error);
      handleError(error);
    }
  });
