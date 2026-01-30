/**
 * Ad Group Targeting Remove Command - 删除广告组定向条件
 */

import { Command } from 'commander';
import { getApiClient } from '../../../lib/api-client.js';
import { handleError } from '../../../utils/errors.js';
import { getCustomerId } from '../../../utils/customer-id.js';

export const removeCommand = new Command('remove')
  .description(
    `删除广告组定向条件

示例:
  # 先列出定向条件获取 criterion_id
  google-ads ad-group targeting list --ad-group-id 193381206718

  # 删除指定的定向条件
  google-ads ad-group targeting remove --ad-group-id 193381206718 --criterion-id 10`,
  )
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--criterion-id <id>', '定向条件 ID (从 list 命令获取)')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.removeAdGroupTargeting(
        customerId,
        options.adGroupId,
        options.criterionId,
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
