/**
 * Campaign Targeting List Command - 列出广告系列定向条件
 */

import { Command } from 'commander';
import { getApiClient } from '../../../lib/api-client.js';
import { handleError } from '../../../utils/errors.js';
import { getCustomerId } from '../../../utils/customer-id.js';

export const listCommand = new Command('list')
  .description(
    `列出广告系列定向条件

返回字段说明:
  - criterion_id: 定向条件 ID (用于删除)
  - type: 定向类型 (6=device, 7=location, 9=schedule, 10=age_range, 11=gender, 17=proximity)
  - negative: true 表示排除定向
  - bid_modifier: 出价调整系数

示例:
  google-ads campaign targeting list --campaign-id 23510365167`,
  )
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const targeting = await client.listCampaignTargeting(
        customerId,
        options.campaignId,
      );

      console.log(JSON.stringify(targeting, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
