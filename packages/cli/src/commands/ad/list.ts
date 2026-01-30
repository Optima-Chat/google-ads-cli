/**
 * Ad List Command - 列出广告
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
  .description('列出广告')
  .option('--campaign-id <id>', '按广告系列过滤')
  .option('--ad-group-id <id>', '按广告组过滤')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--limit <number>', '限制返回数量', '100')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const spinner = ora('正在获取广告列表...').start();

      const ads = await client.listAds(customerId, {
        campaignId: options.campaignId,
        adGroupId: options.adGroupId,
        status: options.status,
        limit: parseInt(options.limit),
      });

      spinner.stop();

      if (ads.length === 0) {
        warn('未找到广告');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(ads, null, 2));
      } else {
        const table = new Table({
          head: [
            chalk.cyan('广告 ID'),
            chalk.cyan('类型'),
            chalk.cyan('广告组'),
            chalk.cyan('状态'),
            chalk.cyan('标题预览'),
            chalk.cyan('展示量'),
            chalk.cyan('点击量'),
          ],
          colWidths: [15, 12, 18, 10, 25, 12, 10],
        });

        ads.forEach((item: any) => {
          const adGroupAd = item.ad_group_ad;
          const ad = adGroupAd?.ad;
          const adGroup = item.ad_group;
          const metrics = item.metrics;

          // 获取广告标题预览
          let titlePreview = 'N/A';
          if (ad?.responsive_search_ad?.headlines?.length > 0) {
            titlePreview = ad.responsive_search_ad.headlines[0].text || 'N/A';
          } else if (ad?.expanded_text_ad?.headline_part1) {
            titlePreview = ad.expanded_text_ad.headline_part1;
          }

          const statusMap: Record<number, string> = {
            2: 'ENABLED',
            3: 'PAUSED',
            4: 'REMOVED',
          };

          const typeMap: Record<number, string> = {
            3: 'TEXT',
            4: 'IMAGE',
            5: 'CALL',
            6: 'RESP_DISPLAY',
            15: 'RESP_SEARCH',
          };

          table.push([
            ad?.id || 'N/A',
            typeMap[ad?.type] || ad?.type || 'N/A',
            (adGroup?.name || 'N/A').substring(0, 16),
            statusMap[adGroupAd?.status] || adGroupAd?.status || 'N/A',
            titlePreview.substring(0, 23),
            metrics?.impressions || 0,
            metrics?.clicks || 0,
          ]);
        });

        console.log('\n' + table.toString() + '\n');
        console.log(chalk.gray(`共 ${ads.length} 个广告\n`));
      }
    } catch (error) {
      handleError(error);
    }
  });
