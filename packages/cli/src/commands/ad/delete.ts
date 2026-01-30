/**
 * Ad Delete Command - 删除广告
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const deleteCommand = new Command('delete')
  .description('删除广告')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--ad-id <id>', '广告 ID')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.deleteAd(customerId, options.adGroupId, options.adId);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
