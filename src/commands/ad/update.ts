/**
 * Ad Update Command - 更新广告
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新广告状态')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--ad-id <id>', '广告 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    if (!options.status) {
      console.log(chalk.red('请指定要更新的状态: --status (ENABLED, PAUSED)'));
      return;
    }

    const spinner = ora('更新广告...').start();

    try {
      const customerId = getCustomerId();
      const client = new GoogleAdsClient();

      const result = await client.updateAd(customerId, options.adGroupId, options.adId, {
        status: options.status,
      });

      spinner.succeed('广告已更新');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`\n✅ 广告 ${options.adId} 已更新`));
        console.log(chalk.gray(`状态: ${options.status}`));
      }
    } catch (error) {
      spinner.fail('更新失败');
      handleError(error);
    }
  });
