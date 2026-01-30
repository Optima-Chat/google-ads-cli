/**
 * Ad Group Create Command - 创建广告组
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const createCommand = new Command('create')
  .description('创建广告组')
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .requiredOption('-n, --name <name>', '广告组名称')
  .option('--cpc-bid <amount>', 'CPC 出价（美元）', parseFloat, 1.0)
  .option('--status <status>', '状态 (ENABLED, PAUSED)', 'ENABLED')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const cpcBidMicros = Math.round(options.cpcBid * 1000000);

      const result = await client.createAdGroup(customerId, {
        name: options.name,
        campaignId: options.campaignId,
        cpcBidMicros: cpcBidMicros,
        status: options.status,
      });

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
