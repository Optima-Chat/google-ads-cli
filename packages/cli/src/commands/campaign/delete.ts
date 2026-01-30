/**
 * Campaign Delete Command - 删除广告系列
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const deleteCommand = new Command('delete')
  .description('删除广告系列')
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.deleteCampaign(customerId, options.campaignId);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
