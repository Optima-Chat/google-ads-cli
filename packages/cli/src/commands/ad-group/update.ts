/**
 * Ad Group Update Command - 更新广告组
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新广告组')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--name <name>', '新名称')
  .option('--cpc-bid <amount>', 'CPC 出价（美元）')
  .action(async (options) => {
    try {
      if (!options.status && !options.name && !options.cpcBid) {
        console.log(JSON.stringify({
          error: 'missing_fields',
          message: '请至少指定一个要更新的字段: --status, --name, 或 --cpc-bid'
        }, null, 2));
        process.exit(1);
      }

      const customerId = getCustomerId();
      const client = getApiClient();

      const updateData: any = {};
      if (options.status) updateData.status = options.status;
      if (options.name) updateData.name = options.name;
      if (options.cpcBid) updateData.cpcBidMicros = Math.round(parseFloat(options.cpcBid) * 1000000);

      const result = await client.updateAdGroup(customerId, options.adGroupId, updateData);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
