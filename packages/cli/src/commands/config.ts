/**
 * Config Command - 配置管理
 */

import { Command } from 'commander';
import Conf from 'conf';

const config = new Conf({ projectName: 'google-ads-cli' });

export const configCommand = new Command('config')
  .description('管理 CLI 配置');

// config show - 显示当前配置
configCommand
  .command('show')
  .description('显示当前配置')
  .action(() => {
    const customerId = config.get('customerId') as string | undefined;
    const accountName = config.get('accountName') as string | undefined;
    const currency = config.get('currency') as string | undefined;
    const timezone = config.get('timezone') as string | undefined;
    const email = config.get('email') as string | undefined;
    const createdAt = config.get('createdAt') as string | undefined;
    const linkedAt = config.get('linkedAt') as string | undefined;

    const result = {
      customer_id: customerId || null,
      account_name: accountName || null,
      currency: currency || null,
      timezone: timezone || null,
      email: email || null,
      created_at: createdAt || null,
      linked_at: linkedAt || null,
      config_path: config.path,
    };

    console.log(JSON.stringify(result, null, 2));
  });

// config reset - 重置配置
configCommand
  .command('reset')
  .description('重置配置（删除所有已保存的配置）')
  .action(() => {
    config.clear();
    console.log(JSON.stringify({ success: true, message: '配置已重置' }, null, 2));
  });

// config path - 显示配置文件路径
configCommand
  .command('path')
  .description('显示配置文件路径')
  .action(() => {
    console.log(JSON.stringify({ path: config.path }, null, 2));
  });
