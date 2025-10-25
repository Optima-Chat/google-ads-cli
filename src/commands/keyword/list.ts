/**
 * Keyword List Command - 列出关键词
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
  .description('列出关键词')
  .option('--campaign-id <id>', '按广告系列过滤')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--limit <number>', '限制返回数量', '100')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = new GoogleAdsClient();

      const spinner = ora('正在获取关键词列表...').start();

      // 获取关键词列表
      const keywords = await client.listKeywords(customerId, options.campaignId, {
        status: options.status,
        limit: parseInt(options.limit),
      });

      spinner.stop();

      if (keywords.length === 0) {
        warn('未找到关键词');
        return;
      }

      // 输出结果
      if (options.json) {
        console.log(JSON.stringify(keywords, null, 2));
      } else {
        const table = new Table({
          head: [
            chalk.cyan('关键词'),
            chalk.cyan('匹配类型'),
            chalk.cyan('状态'),
            chalk.cyan('质量得分'),
            chalk.cyan('展示量'),
            chalk.cyan('点击量'),
            chalk.cyan('费用'),
            chalk.cyan('点击率'),
          ],
          colWidths: [25, 12, 10, 10, 12, 10, 12, 10],
        });

        keywords.forEach((keyword: any) => {
          const cost = keyword.metrics?.cost_micros
            ? (keyword.metrics.cost_micros / 1000000).toFixed(2)
            : '0.00';

          const ctr = keyword.metrics?.ctr
            ? (keyword.metrics.ctr * 100).toFixed(2) + '%'
            : '0.00%';

          table.push([
            keyword.ad_group_criterion?.keyword?.text || 'N/A',
            keyword.ad_group_criterion?.keyword?.match_type || 'N/A',
            keyword.ad_group_criterion?.status || 'N/A',
            keyword.ad_group_criterion?.quality_info?.quality_score || 'N/A',
            keyword.metrics?.impressions || 0,
            keyword.metrics?.clicks || 0,
            cost,
            ctr,
          ]);
        });

        console.log('\n' + table.toString() + '\n');
        console.log(chalk.gray(`共 ${keywords.length} 个关键词\n`));
      }
    } catch (error) {
      handleError(error);
    }
  });
