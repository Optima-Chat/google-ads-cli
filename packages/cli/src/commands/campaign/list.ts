/**
 * Campaign List Command - 列出广告系列
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const listCommand = new Command('list')
  .description('列出广告系列')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--limit <number>', '限制返回数量', '50')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const campaigns = await client.listCampaigns(customerId, {
        status: options.status,
        limit: parseInt(options.limit),
      });

      console.log(JSON.stringify(campaigns, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
