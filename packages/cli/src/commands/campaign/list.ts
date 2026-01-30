/**
 * Campaign List Command - 列出广告系列
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { warn } from '../../utils/logger.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const listCommand = new Command('list')
  .description('列出广告系列')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--limit <number>', '限制返回数量', '50')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const spinner = ora('正在获取广告系列列表...').start();

      // 获取广告系列列表
      const campaigns = await client.listCampaigns(customerId, {
        status: options.status,
        limit: parseInt(options.limit),
      });

      spinner.stop();

      if (campaigns.length === 0) {
        warn('未找到广告系列');
        return;
      }

      // 输出结果
      if (options.json) {
        console.log(JSON.stringify(campaigns, null, 2));
      } else {
        const table = new Table({
          head: [
            chalk.cyan('ID'),
            chalk.cyan('名称'),
            chalk.cyan('状态'),
            chalk.cyan('类型'),
            chalk.cyan('展示量'),
            chalk.cyan('点击量'),
            chalk.cyan('费用'),
          ],
          colWidths: [12, 25, 10, 15, 12, 10, 15],
        });

        campaigns.forEach((campaign: any) => {
          const cost = campaign.metrics?.cost_micros
            ? (campaign.metrics.cost_micros / 1000000).toFixed(2)
            : '0.00';

          table.push([
            campaign.campaign?.id || 'N/A',
            campaign.campaign?.name || '未命名',
            campaign.campaign?.status || 'N/A',
            campaign.campaign?.advertising_channel_type || 'N/A',
            campaign.metrics?.impressions || 0,
            campaign.metrics?.clicks || 0,
            cost,
          ]);
        });

        console.log('\n' + table.toString() + '\n');
        console.log(chalk.gray(`共 ${campaigns.length} 个广告系列\n`));
      }
    } catch (error) {
      handleError(error);
    }
  });
