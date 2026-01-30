/**
 * Ad Group Targeting List Command - 列出广告组定向条件
 */

import { Command } from 'commander';
import { getApiClient } from '../../../lib/api-client.js';
import { handleError } from '../../../utils/errors.js';
import { getCustomerId } from '../../../utils/customer-id.js';

export const listCommand = new Command('list')
  .description(
    `列出广告组定向条件（人口统计学定向）

返回字段说明:
  - criterion_id: 定向条件 ID (用于删除)
  - type: 定向类型 (10=age_range, 11=gender, 12=income_range, 13=parental_status)
  - negative: true 表示排除定向
  - bid_modifier: 出价调整系数

示例:
  google-ads ad-group targeting list --ad-group-id 193381206718`,
  )
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const targeting = await client.listAdGroupTargeting(
        customerId,
        options.adGroupId,
      );

      console.log(JSON.stringify(targeting, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
