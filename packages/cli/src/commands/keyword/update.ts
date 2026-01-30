/**
 * Keyword Update Command - 更新关键词
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const updateCommand = new Command('update')
  .description('更新关键词')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--criterion-id <id>', '关键词条件 ID')
  .option('--status <status>', '状态 (ENABLED, PAUSED)')
  .option('--bid <amount>', '每次点击出价（美元）')
  .action(async (options) => {
    try {
      if (!options.status && !options.bid) {
        console.log(JSON.stringify({
          error: 'missing_fields',
          message: '请至少指定一个要更新的字段: --status 或 --bid'
        }, null, 2));
        process.exit(1);
      }

      const customerId = getCustomerId();
      const client = getApiClient();

      const updateData: any = {};
      if (options.status) updateData.status = options.status;
      if (options.bid) updateData.cpcBidMicros = Math.round(parseFloat(options.bid) * 1000000);

      const result = await client.updateKeyword(customerId, options.adGroupId, options.criterionId, updateData);

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
