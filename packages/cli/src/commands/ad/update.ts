/**
 * Ad Update Command - 更新广告状态
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新广告状态')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--ad-id <id>', '广告 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .action(async (options) => {
    try {
      if (!options.status) {
        console.log(JSON.stringify({
          error: 'missing_status',
          message: '请指定要更新的状态: --status (ENABLED, PAUSED)'
        }, null, 2));
        process.exit(1);
      }

      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.updateAd(customerId, options.adGroupId, options.adId, {
        status: options.status,
      });

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
