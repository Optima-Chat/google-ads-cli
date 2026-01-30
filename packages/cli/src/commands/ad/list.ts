/**
 * Ad List Command - 列出广告
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const listCommand = new Command('list')
  .description('列出广告')
  .option('--campaign-id <id>', '按广告系列过滤')
  .option('--ad-group-id <id>', '按广告组过滤')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--limit <number>', '限制返回数量', '100')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const ads = await client.listAds(customerId, {
        campaignId: options.campaignId,
        adGroupId: options.adGroupId,
        status: options.status,
        limit: parseInt(options.limit),
      });

      console.log(JSON.stringify(ads, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
