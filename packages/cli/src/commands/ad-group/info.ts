/**
 * Ad Group Info Command - 查看广告组详情
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const infoCommand = new Command('info')
  .description('查看广告组详情')
  .argument('<ad-group-id>', '广告组 ID')
  .action(async (adGroupId) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.getAdGroup(customerId, adGroupId);

      if (!result) {
        console.log(JSON.stringify({ error: 'not_found', ad_group_id: adGroupId }, null, 2));
        process.exit(1);
      }

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
