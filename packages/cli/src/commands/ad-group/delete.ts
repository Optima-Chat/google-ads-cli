/**
 * Ad Group Delete Command - 删除广告组
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const deleteCommand = new Command('delete')
  .description('删除广告组')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.deleteAdGroup(customerId, options.adGroupId);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
