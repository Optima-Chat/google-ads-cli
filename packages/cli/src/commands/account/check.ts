/**
 * Account Check Command - 检查账号配置状态
 */

import { Command } from 'commander';
import { getApiClient } from '../../lib/api-client.js';
import { handleError } from '../../utils/errors.js';
import { getCustomerId } from '../../utils/customer-id.js';

export const checkCommand = new Command('check')
  .description('检查账号配置状态（账单、权限等）')
  .action(async () => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      // Check account via backend API
      const accountCheck = await client.checkAccount(customerId);

      const checkResult = accountCheck as any;

      const result = {
        customer_id: checkResult.customerId || customerId,
        connected: checkResult.connected || false,
        info: checkResult.info ? {
          name: checkResult.info.descriptive_name || null,
          currency: checkResult.info.currency_code || null,
          timezone: checkResult.info.time_zone || null,
        } : null,
      };

      console.log(JSON.stringify(result, null, 2));

    } catch (error) {
      handleError(error);
    }
  });
