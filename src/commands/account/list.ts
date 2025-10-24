/**
 * Account List Command - 列出可访问的客户账号
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';
import { warn } from '../../utils/logger.js';

export const listCommand = new Command('list')
  .description('列出所有可访问的客户账号')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      const client = new GoogleAdsClient();

      const spinner = ora('正在获取客户账号列表...').start();

      // 获取账号列表
      const customerIds = await client.listAccessibleCustomers();
      spinner.stop();

      if (customerIds.length === 0) {
        warn('未找到可访问的客户账号');
        return;
      }

      // 获取每个账号的详细信息
      const spinner2 = ora('正在获取账号详情...').start();
      const customers = [];

      for (const customerId of customerIds) {
        try {
          const info = await client.getCustomerInfo(customerId);
          if (info) {
            customers.push({
              id: info.id,
              name: info.descriptive_name || '未命名',
              currency: info.currency_code || 'N/A',
              timezone: info.time_zone || 'N/A',
              manager: info.manager ? '是' : '否',
              test: info.test_account ? '是' : '否',
            });
          }
        } catch (error) {
          // 忽略单个账号的错误，继续处理其他账号
          customers.push({
            id: customerId,
            name: '无法获取',
            currency: 'N/A',
            timezone: 'N/A',
            manager: 'N/A',
            test: 'N/A',
          });
        }
      }

      spinner2.stop();

      // 输出结果
      if (options.json) {
        console.log(JSON.stringify(customers, null, 2));
      } else {
        const table = new Table({
          head: [
            chalk.cyan('账号 ID'),
            chalk.cyan('名称'),
            chalk.cyan('货币'),
            chalk.cyan('时区'),
            chalk.cyan('管理账号'),
            chalk.cyan('测试账号'),
          ],
          colWidths: [15, 30, 10, 20, 10, 10],
        });

        customers.forEach((customer) => {
          table.push([
            customer.id,
            customer.name,
            customer.currency,
            customer.timezone,
            customer.manager,
            customer.test,
          ]);
        });

        console.log('\n' + table.toString() + '\n');
        console.log(chalk.gray(`共找到 ${customers.length} 个客户账号\n`));
      }
    } catch (error) {
      handleError(error);
    }
  });
