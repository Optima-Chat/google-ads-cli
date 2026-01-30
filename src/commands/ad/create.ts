/**
 * Ad Create Command - 创建广告
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const createCommand = new Command('create')
  .description('创建响应式搜索广告 (RSA)')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--headlines <headlines>', '标题（逗号分隔，至少3个，最多15个）')
  .requiredOption('--descriptions <descriptions>', '描述（逗号分隔，至少2个，最多4个）')
  .requiredOption('--final-url <url>', '最终到达网址')
  .option('--path1 <path>', '显示路径1')
  .option('--path2 <path>', '显示路径2')
  .option('--status <status>', '状态 (ENABLED, PAUSED)', 'PAUSED')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('创建广告...').start();

    try {
      const customerId = getCustomerId();
      const client = new GoogleAdsClient();

      // 解析标题和描述
      const headlines = options.headlines.split(',').map((h: string) => h.trim());
      const descriptions = options.descriptions.split(',').map((d: string) => d.trim());

      // 验证数量
      if (headlines.length < 3) {
        throw new Error('至少需要 3 个标题');
      }
      if (headlines.length > 15) {
        throw new Error('最多 15 个标题');
      }
      if (descriptions.length < 2) {
        throw new Error('至少需要 2 个描述');
      }
      if (descriptions.length > 4) {
        throw new Error('最多 4 个描述');
      }

      // 验证长度
      for (const headline of headlines) {
        if (headline.length > 30) {
          throw new Error(`标题 "${headline}" 超过 30 字符限制`);
        }
      }
      for (const desc of descriptions) {
        if (desc.length > 90) {
          throw new Error(`描述 "${desc}" 超过 90 字符限制`);
        }
      }

      const result = await client.createAd(customerId, {
        adGroupId: options.adGroupId,
        headlines,
        descriptions,
        finalUrl: options.finalUrl,
        path1: options.path1,
        path2: options.path2,
        status: options.status,
      });

      spinner.succeed('广告创建成功');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green('\n✅ 响应式搜索广告已创建'));
        console.log(chalk.gray(`标题数量: ${headlines.length}`));
        console.log(chalk.gray(`描述数量: ${descriptions.length}`));
        console.log(chalk.gray(`最终网址: ${options.finalUrl}\n`));
      }
    } catch (error) {
      spinner.fail('创建广告失败');
      handleError(error);
    }
  });
