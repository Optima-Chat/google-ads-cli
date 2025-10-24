/**
 * Account Info Command - 查看客户账号详情
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { error as logError } from '../../utils/logger.js';

export const infoCommand = new Command('info')
  .description('查看客户账号详情')
  .argument('<customer-id>', '客户账号 ID')
  .option('--json', '以 JSON 格式输出')
  .action(async (customerId: string, options) => {
    try {
      const client = new GoogleAdsClient();

      const spinner = ora('正在获取账号信息...').start();

      // 获取账号信息
      const info = await client.getCustomerInfo(customerId);
      spinner.stop();

      if (!info) {
        logError(`未找到客户账号: ${customerId}`);
        process.exit(1);
      }

      // 输出结果
      if (options.json) {
        console.log(JSON.stringify(info, null, 2));
      } else {
        const table = new Table({
          head: [chalk.cyan('属性'), chalk.cyan('值')],
          colWidths: [25, 55],
        });

        table.push(
          ['账号 ID', info.id || 'N/A'],
          ['名称', info.descriptive_name || '未命名'],
          ['货币代码', info.currency_code || 'N/A'],
          ['时区', info.time_zone || 'N/A'],
          ['管理账号', info.manager ? '是' : '否'],
          ['测试账号', info.test_account ? '是' : '否'],
          ['自动标记', info.auto_tagging_enabled ? '已启用' : '未启用'],
          ['跟踪模板', info.tracking_url_template || '未设置']
        );

        console.log('\n' + table.toString() + '\n');
      }
    } catch (error) {
      handleError(error);
    }
  });
