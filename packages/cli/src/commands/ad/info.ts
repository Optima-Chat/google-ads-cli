/**
 * Ad Info Command - 查看广告详情
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { warn } from '../../utils/logger.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const infoCommand = new Command('info')
  .description('查看广告详情')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .argument('<ad-id>', '广告 ID')
  .option('--json', '以 JSON 格式输出')
  .action(async (adId, options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const spinner = ora('正在获取广告信息...').start();

      const result = await client.getAd(customerId, options.adGroupId, adId) as any;

      spinner.stop();

      if (!result) {
        warn('未找到广告');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const adGroupAd = result.ad_group_ad;
        const ad = adGroupAd?.ad;
        const adGroup = result.ad_group;
        const campaign = result.campaign;
        const metrics = result.metrics;

        const statusMap: Record<number, string> = {
          2: 'ENABLED',
          3: 'PAUSED',
          4: 'REMOVED',
        };

        const typeMap: Record<number, string> = {
          3: 'TEXT_AD',
          4: 'IMAGE_AD',
          5: 'CALL_AD',
          6: 'RESPONSIVE_DISPLAY_AD',
          15: 'RESPONSIVE_SEARCH_AD',
        };

        console.log(chalk.cyan.bold('\n广告详情\n'));
        console.log(chalk.gray('广告 ID:'), chalk.white(ad?.id));
        console.log(chalk.gray('类型:'), chalk.white(typeMap[ad?.type] || ad?.type));
        console.log(chalk.gray('状态:'), chalk.white(statusMap[adGroupAd?.status] || adGroupAd?.status));
        console.log(chalk.gray('广告组:'), chalk.white(adGroup?.name));
        console.log(chalk.gray('广告系列:'), chalk.white(campaign?.name));

        // 响应式搜索广告内容
        if (ad?.responsive_search_ad) {
          const rsa = ad.responsive_search_ad;
          console.log(chalk.cyan.bold('\n广告内容 (响应式搜索广告)\n'));

          if (rsa.headlines?.length > 0) {
            console.log(chalk.gray('标题:'));
            rsa.headlines.forEach((h: any, i: number) => {
              console.log(chalk.white(`  ${i + 1}. ${h.text}`));
            });
          }

          if (rsa.descriptions?.length > 0) {
            console.log(chalk.gray('描述:'));
            rsa.descriptions.forEach((d: any, i: number) => {
              console.log(chalk.white(`  ${i + 1}. ${d.text}`));
            });
          }

          if (rsa.path1) console.log(chalk.gray('路径 1:'), chalk.white(rsa.path1));
          if (rsa.path2) console.log(chalk.gray('路径 2:'), chalk.white(rsa.path2));
        }

        if (ad?.final_urls?.length > 0) {
          console.log(chalk.gray('落地页:'), chalk.white(ad.final_urls[0]));
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
