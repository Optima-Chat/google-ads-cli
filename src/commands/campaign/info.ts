/**
 * Campaign Info Command - 查看广告系列详情
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { error as logError } from '../../utils/logger.js';

export const infoCommand = new Command('info')
  .description('查看广告系列详情')
  .requiredOption('-c, --customer-id <id>', '客户账号 ID')
  .argument('<campaign-id>', '广告系列 ID')
  .option('--json', '以 JSON 格式输出')
  .action(async (campaignId: string, options) => {
    try {
      const client = new GoogleAdsClient();

      const spinner = ora('正在获取广告系列信息...').start();

      // 获取广告系列详情
      const campaign = await client.getCampaign(options.customerId, campaignId);
      spinner.stop();

      if (!campaign) {
        logError(`未找到广告系列: ${campaignId}`);
        process.exit(1);
      }

      // 输出结果
      if (options.json) {
        console.log(JSON.stringify(campaign, null, 2));
      } else {
        const table = new Table({
          head: [chalk.cyan('属性'), chalk.cyan('值')],
          colWidths: [25, 55],
        });

        const cost = campaign.metrics?.cost_micros
          ? (campaign.metrics.cost_micros / 1000000).toFixed(2)
          : '0.00';

        const avgCpc = campaign.metrics?.average_cpc
          ? (campaign.metrics.average_cpc / 1000000).toFixed(2)
          : '0.00';

        const avgCpm = campaign.metrics?.average_cpm
          ? (campaign.metrics.average_cpm / 1000000).toFixed(2)
          : '0.00';

        const ctr = campaign.metrics?.ctr
          ? (campaign.metrics.ctr * 100).toFixed(2) + '%'
          : '0.00%';

        table.push(
          ['广告系列 ID', campaign.campaign?.id || 'N/A'],
          ['名称', campaign.campaign?.name || '未命名'],
          ['状态', campaign.campaign?.status || 'N/A'],
          ['广告类型', campaign.campaign?.advertising_channel_type || 'N/A'],
          ['出价策略', campaign.campaign?.bidding_strategy_type || 'N/A'],
          ['开始日期', campaign.campaign?.start_date || '未设置'],
          ['结束日期', campaign.campaign?.end_date || '未设置'],
          ['---', '---'],
          ['展示量', campaign.metrics?.impressions || 0],
          ['点击量', campaign.metrics?.clicks || 0],
          ['费用', cost],
          ['转化次数', campaign.metrics?.conversions || 0],
          ['转化价值', campaign.metrics?.conversions_value || 0],
          ['平均每次点击费用', avgCpc],
          ['平均千次展示费用', avgCpm],
          ['点击率', ctr],
          ['优化得分', campaign.campaign?.optimization_score || 'N/A']
        );

        console.log('\n' + table.toString() + '\n');
      }
    } catch (error) {
      handleError(error);
    }
  });
