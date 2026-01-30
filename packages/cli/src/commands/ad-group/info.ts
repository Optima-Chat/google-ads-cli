/**
 * Ad Group Info Command - 查看广告组详情
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { warn } from '../../utils/logger.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const infoCommand = new Command('info')
  .description('查看广告组详情')
  .argument('<ad-group-id>', '广告组 ID')
  .option('--json', '以 JSON 格式输出')
  .action(async (adGroupId, options) => {
    try {
      const customerId = getCustomerId();
      const client = new GoogleAdsClient();

      const spinner = ora('正在获取广告组信息...').start();

      const result = await client.getAdGroup(customerId, adGroupId);

      spinner.stop();

      if (!result) {
        warn('未找到广告组');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const adGroup = result.ad_group;
        const campaign = result.campaign;
        const metrics = result.metrics;

        const statusMap: Record<number, string> = {
          2: 'ENABLED',
          3: 'PAUSED',
          4: 'REMOVED',
        };

        console.log(chalk.cyan.bold('\n广告组详情\n'));
        console.log(chalk.gray('ID:'), chalk.white(adGroup?.id));
        console.log(chalk.gray('名称:'), chalk.white(adGroup?.name));
        console.log(chalk.gray('状态:'), chalk.white(statusMap[adGroup?.status] || adGroup?.status));
        console.log(chalk.gray('广告系列:'), chalk.white(campaign?.name));
        console.log(chalk.gray('广告系列 ID:'), chalk.white(campaign?.id));

        if (adGroup?.cpc_bid_micros) {
          console.log(chalk.gray('CPC 出价:'), chalk.white(`$${(adGroup.cpc_bid_micros / 1000000).toFixed(2)}`));
        }

        console.log(chalk.cyan.bold('\n效果数据\n'));
        console.log(chalk.gray('展示量:'), chalk.white(metrics?.impressions || 0));
        console.log(chalk.gray('点击量:'), chalk.white(metrics?.clicks || 0));
        console.log(chalk.gray('费用:'), chalk.white(`$${((metrics?.cost_micros || 0) / 1000000).toFixed(2)}`));
        console.log(chalk.gray('转化:'), chalk.white(metrics?.conversions || 0));
        console.log();
      }
    } catch (error) {
      handleError(error);
    }
  });
