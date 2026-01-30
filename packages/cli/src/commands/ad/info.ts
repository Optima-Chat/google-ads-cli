/**
 * Ad Info Command - 查看广告详情
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const infoCommand = new Command('info')
  .description('查看广告详情')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .argument('<ad-id>', '广告 ID')
  .action(async (adId, options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.getAd(customerId, options.adGroupId, adId);

      if (!result) {
        console.log(JSON.stringify({ error: 'not_found', ad_id: adId }, null, 2));
        process.exit(1);
      }

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
