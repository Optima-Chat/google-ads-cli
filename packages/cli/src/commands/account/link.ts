/**
 * Account Link Command - 关联已有的 Google Ads 账号
 */

import { Command } from 'commander';
import Conf from 'conf';
import { handleError } from '../../utils/errors.js';

const config = new Conf({ projectName: 'google-ads-cli' });

export const linkCommand = new Command('link')
  .description('关联已有的 Google Ads 账号（保存 Customer ID 到本地配置）')
  .requiredOption('--customer-id <id>', 'Customer ID（10位数字，如 1234567890 或 123-456-7890）')
  .option('--name <name>', '账号名称（可选）')
  .option('--force', '强制覆盖已有配置')
  .action(async (options) => {
    try {
      // 检查是否已经配置过账号
      const existingCustomerId = config.get('customerId') as string | undefined;
      if (existingCustomerId && !options.force) {
        console.log(JSON.stringify({
          success: false,
          error: 'already_linked',
          message: '已存在账号配置',
          existing_customer_id: existingCustomerId,
          hint: '使用 --force 覆盖，或运行 google-ads config reset'
        }, null, 2));
        process.exit(1);
      }

      // 验证 Customer ID 格式
      const cleanId = options.customerId.replace(/-/g, '');
      if (!/^\d{10}$/.test(cleanId)) {
        console.log(JSON.stringify({
          success: false,
          error: 'invalid_customer_id',
          message: '无效的 Customer ID 格式',
          provided: options.customerId,
          hint: '请提供 10 位数字（如 1234567890 或 123-456-7890）'
        }, null, 2));
        process.exit(1);
      }

      // 保存到 config
      config.set('customerId', cleanId);
      if (options.name) {
        config.set('accountName', options.name);
      }
      config.set('linkedAt', new Date().toISOString());

      const formattedCustomerId = cleanId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

      console.log(JSON.stringify({
        success: true,
        customer_id: formattedCustomerId,
        account_name: options.name || null,
        next_step: '运行 google-ads account check 验证连接'
      }, null, 2));

    } catch (error) {
      handleError(error);
    }
  });
