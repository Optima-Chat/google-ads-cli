/**
 * Ad Delete Command - 删除广告
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const deleteCommand = new Command('delete')
  .description('删除广告')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--ad-id <id>', '广告 ID')
  .option('-y, --yes', '跳过确认')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();

      // 确认删除
      if (!options.yes) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `确定要删除广告 ${options.adId} 吗？`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('已取消'));
          return;
        }
      }

      const spinner = ora('删除广告...').start();

      const client = new GoogleAdsClient();
      const result = await client.deleteAd(customerId, options.adGroupId, options.adId);

      spinner.succeed('广告已删除');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`\n✅ 广告 ${options.adId} 已删除`));
      }
    } catch (error) {
      handleError(error);
    }
  });
