/**
 * Keyword Add Command - 添加关键词
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const addCommand = new Command('add')
  .description('添加关键词')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('-k, --keywords <keywords>', '关键词（逗号分隔）')
  .option('--match-type <type>', '匹配类型 (BROAD, PHRASE, EXACT)', 'BROAD')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const keywordTexts = options.keywords.split(',').map((k: string) => k.trim());
      const keywords = keywordTexts.map((text: string) => ({
        text,
        matchType: options.matchType,
      }));

      const result = await client.addKeywords(
        customerId,
        options.adGroupId,
        keywords
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
