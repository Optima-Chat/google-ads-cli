/**
 * Ad Group List Command - 列出广告组
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { warn } from '../../utils/logger.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const listCommand = new Command('list')
  .description('列出广告组')
  .option('--campaign-id <id>', '按广告系列过滤')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--limit <number>', '限制返回数量', '100')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = new GoogleAdsClient();

      const spinner = ora('正在获取广告组列表...').start();

      const adGroups = await client.listAdGroups(customerId, options.campaignId, {
        status: options.status,
        limit: parseInt(options.limit),
      });

      spinner.stop();

      if (adGroups.length === 0) {
        warn('未找到广告组');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(adGroups, null, 2));
      } else {
        const table = new Table({
          head: [
            chalk.cyan('ID'),
            chalk.cyan('名称'),
            chalk.cyan('广告系列'),
            chalk.cyan('状态'),
            chalk.cyan('CPC 出价'),
            chalk.cyan('展示量'),
            chalk.cyan('点击量'),
            chalk.cyan('费用'),
          ],
          colWidths: [15, 20, 20, 10, 12, 12, 10, 12],
        });

        adGroups.forEach((item: any) => {
          const adGroup = item.ad_group;
          const campaign = item.campaign;
          const metrics = item.metrics;

          const cpcBid = adGroup?.cpc_bid_micros
            ? (adGroup.cpc_bid_micros / 1000000).toFixed(2)
            : 'N/A';

          const cost = metrics?.cost_micros
            ? (metrics.cost_micros / 1000000).toFixed(2)
            : '0.00';

          const statusMap: Record<number, string> = {
            2: 'ENABLED',
            3: 'PAUSED',
            4: 'REMOVED',
          };

          table.push([
            adGroup?.id || 'N/A',
            (adGroup?.name || 'N/A').substring(0, 18),
            (campaign?.name || 'N/A').substring(0, 18),
            statusMap[adGroup?.status] || adGroup?.status || 'N/A',
            cpcBid,
            metrics?.impressions || 0,
            metrics?.clicks || 0,
            cost,
          ]);
        });

        console.log('\n' + table.toString() + '\n');
        console.log(chalk.gray(`共 ${adGroups.length} 个广告组\n`));
      }
    } catch (error) {
      handleError(error);
    }
  });
