/**
 * Keyword Delete Command - 删除关键词
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const deleteCommand = new Command('delete')
  .description('删除关键词')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('--criterion-id <id>', '关键词 Criterion ID')
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      const result = await client.deleteKeyword(
        customerId,
        options.adGroupId,
        options.criterionId
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
