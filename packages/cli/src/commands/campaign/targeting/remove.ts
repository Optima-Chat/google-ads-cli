/**
 * Campaign Targeting Remove Command - 删除广告系列定向条件
 */

import { Command } from 'commander';
import { getApiClient } from '../../../lib/api-client.js';
import { handleError } from '../../../utils/errors.js';
import { getCustomerId } from '../../../utils/customer-id.js';

export const removeCommand = new Command('remove')
  .description(
    `删除广告系列定向条件

示例:
  # 先列出定向条件获取 criterion_id
  google-ads campaign targeting list --campaign-id 23510365167

  # 删除指定的定向条件
  google-ads campaign targeting remove --campaign-id 23510365167 --criterion-id 343280`,
  )
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .requiredOption('--criterion-id <id>', '定向条件 ID (从 list 命令获取)')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.removeCampaignTargeting(
        customerId,
        options.campaignId,
        options.criterionId,
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
