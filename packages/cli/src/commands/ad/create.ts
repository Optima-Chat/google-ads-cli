/**
 * Ad Create Command - 创建广告
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
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
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const headlines = options.headlines.split(',').map((h: string) => h.trim());
      const descriptions = options.descriptions.split(',').map((d: string) => d.trim());

      // 验证数量
      if (headlines.length < 3 || headlines.length > 15) {
        console.log(JSON.stringify({
          error: 'invalid_headlines',
          message: '标题数量必须在 3-15 个之间',
          provided: headlines.length
        }, null, 2));
        process.exit(1);
      }
      if (descriptions.length < 2 || descriptions.length > 4) {
        console.log(JSON.stringify({
          error: 'invalid_descriptions',
          message: '描述数量必须在 2-4 个之间',
          provided: descriptions.length
        }, null, 2));
        process.exit(1);
      }

      // 验证长度
      for (const headline of headlines) {
        if (headline.length > 30) {
          console.log(JSON.stringify({
            error: 'headline_too_long',
            message: `标题超过 30 字符限制`,
            headline,
            length: headline.length
          }, null, 2));
          process.exit(1);
        }
      }
      for (const desc of descriptions) {
        if (desc.length > 90) {
          console.log(JSON.stringify({
            error: 'description_too_long',
            message: `描述超过 90 字符限制`,
            description: desc,
            length: desc.length
          }, null, 2));
          process.exit(1);
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

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
