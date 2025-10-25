/**
 * Ad Group Create Command - 创建广告组
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { toMicros } from 'google-ads-api';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const createCommand = new Command('create')
  .description('创建广告组')
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .requiredOption('-n, --name <name>', '广告组名称')
  .option('--cpc-bid <amount>', 'CPC 出价（美元）', parseFloat, 1.0)
  .option('--status <status>', '状态 (ENABLED, PAUSED)', 'ENABLED')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('创建广告组...').start();

    try {
      const customerId = getCustomerId();
      const client = new GoogleAdsClient();

      // 转换 CPC 出价为 micros
      const cpcBidMicros = toMicros(options.cpcBid);

      const result = await client.createAdGroup(customerId, {
        name: options.name,
        campaign_id: options.campaignId,
        cpc_bid_micros: cpcBidMicros,
        status: options.status,
      });

      spinner.succeed('广告组创建成功');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green('\n✅ 广告组已创建'));
        console.log(chalk.gray('名称:'), chalk.white(options.name));
        console.log(chalk.gray('CPC 出价:'), chalk.white(`$${options.cpcBid}`));
        console.log(chalk.gray('状态:'), chalk.white(options.status));

        // 提取创建的资源名称
        if (result && result.length > 0) {
          const adGroupResult = result.find((r: any) => r.ad_group);
          if (adGroupResult && adGroupResult.ad_group) {
            const match = adGroupResult.ad_group.match(/adGroups\/(\d+)/);
            if (match) {
              console.log(chalk.gray('Ad Group ID:'), chalk.cyan(match[1]));
              console.log(chalk.gray('\n💡 下一步: 添加关键词'));
              console.log(chalk.cyan(`   google-ads keyword add --ad-group-id ${match[1]} --keywords "关键词1,关键词2"`));
            }
          }
        }
      }
    } catch (error) {
      spinner.fail('创建失败');
      handleError(error);
    }
  });
