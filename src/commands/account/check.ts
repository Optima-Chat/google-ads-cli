/**
 * Account Check Command - 检查账号配置状态
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';

export const checkCommand = new Command('check')
  .description('检查账号配置状态（账单、权限等）')
  .requiredOption('-c, --customer-id <id>', '客户账号 ID')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('检查账号状态...').start();

    try {
      const client = new GoogleAdsClient();

      // Get basic customer info
      const customerInfo = await client.getCustomerInfo(options.customerId);

      if (!customerInfo) {
        spinner.fail('账号不存在');
        console.log(chalk.red(`\n✗ 无法找到账号 ${options.customerId}`));
        return;
      }

      // Check billing setup status
      const billingQuery = `
        SELECT
          billing_setup.id,
          billing_setup.status,
          billing_setup.payments_account
        FROM billing_setup
        WHERE billing_setup.status IN ('APPROVED', 'PENDING')
        ORDER BY billing_setup.id DESC
        LIMIT 1
      `;

      let billingStatus = 'UNKNOWN';
      let billingAccountId = null;
      let canCreateCampaigns = false;

      try {
        const billingResults = await client.query(options.customerId, billingQuery);
        if (billingResults.length > 0) {
          const billing = billingResults[0].billing_setup;
          billingStatus = billing.status || 'UNKNOWN';
          billingAccountId = billing.payments_account || null;
          canCreateCampaigns = billingStatus === 'APPROVED';
        } else {
          billingStatus = 'NOT_CONFIGURED';
        }
      } catch (error: any) {
        // Billing query might fail if no permissions
        billingStatus = 'UNKNOWN';
      }

      // Check if customer can manage ads (has sufficient permissions)
      const hasManagePermission = customerInfo.manager !== undefined;

      spinner.succeed('账号状态检查完成');

      if (options.json) {
        const result = {
          customer_id: options.customerId,
          customer_info: {
            name: customerInfo.descriptive_name,
            currency: customerInfo.currency_code,
            timezone: customerInfo.time_zone,
            is_manager: customerInfo.manager || false,
            is_test_account: customerInfo.test_account || false,
            auto_tagging: customerInfo.auto_tagging_enabled,
          },
          billing: {
            status: billingStatus,
            account_id: billingAccountId,
            configured: billingStatus !== 'NOT_CONFIGURED' && billingStatus !== 'UNKNOWN',
          },
          permissions: {
            can_create_campaigns: canCreateCampaigns,
            has_manage_permission: hasManagePermission,
          },
          ready: canCreateCampaigns && hasManagePermission,
        };

        console.log(JSON.stringify(result, null, 2));
      } else {
        // Display in table format
        console.log(chalk.cyan.bold('\n📊 账号状态\n'));

        const table = new Table({
          chars: {
            top: '─',
            'top-mid': '┬',
            'top-left': '┌',
            'top-right': '┐',
            bottom: '─',
            'bottom-mid': '┴',
            'bottom-left': '└',
            'bottom-right': '┘',
            left: '│',
            'left-mid': '├',
            mid: '─',
            'mid-mid': '┼',
            right: '│',
            'right-mid': '┤',
            middle: '│',
          },
        });

        // Customer info
        table.push(
          [chalk.gray('账号 ID'), chalk.white(options.customerId)],
          [chalk.gray('账号名称'), chalk.white(customerInfo.descriptive_name || '未命名')],
          [chalk.gray('货币'), chalk.white(customerInfo.currency_code)],
          [chalk.gray('时区'), chalk.white(customerInfo.time_zone)],
          [chalk.gray('管理账号'), customerInfo.manager ? chalk.yellow('是') : chalk.white('否')],
          [chalk.gray('测试账号'), customerInfo.test_account ? chalk.yellow('是') : chalk.white('否')]
        );

        console.log(table.toString());

        // Billing status
        console.log(chalk.cyan.bold('\n💳 账单状态\n'));

        const billingTable = new Table({
          chars: {
            top: '─',
            'top-mid': '┬',
            'top-left': '┌',
            'top-right': '┐',
            bottom: '─',
            'bottom-mid': '┴',
            'bottom-left': '└',
            'bottom-right': '┘',
            left: '│',
            'left-mid': '├',
            mid: '─',
            'mid-mid': '┼',
            right: '│',
            'right-mid': '┤',
            middle: '│',
          },
        });

        let statusColor = chalk.white;
        let statusText = billingStatus;

        if (billingStatus === 'APPROVED') {
          statusColor = chalk.green;
          statusText = '✅ 已配置';
        } else if (billingStatus === 'PENDING') {
          statusColor = chalk.yellow;
          statusText = '⏳ 等待审批';
        } else if (billingStatus === 'NOT_CONFIGURED') {
          statusColor = chalk.red;
          statusText = '❌ 未配置';
        } else {
          statusColor = chalk.gray;
          statusText = '❓ 未知';
        }

        billingTable.push(
          [chalk.gray('账单状态'), statusColor(statusText)],
          [
            chalk.gray('可创建广告系列'),
            canCreateCampaigns ? chalk.green('✅ 是') : chalk.red('❌ 否'),
          ]
        );

        if (billingAccountId) {
          billingTable.push([chalk.gray('付款账号'), chalk.white(billingAccountId)]);
        }

        console.log(billingTable.toString());

        // Recommendations
        console.log(chalk.cyan.bold('\n💡 建议\n'));

        if (!canCreateCampaigns) {
          console.log(chalk.yellow('⚠️  账单未配置，无法创建广告系列'));
          console.log(chalk.gray('\n请按以下步骤配置账单：'));
          console.log(chalk.white('1. 访问 Google Ads 账单中心:'));
          console.log(chalk.cyan('   https://ads.google.com/aw/billing'));
          console.log(chalk.white('2. 添加付款方式（信用卡或银行账户）'));
          console.log(chalk.white('3. 完成账单设置'));
          console.log(chalk.gray('\n或查看完整设置指南:'));
          console.log(chalk.cyan('   google-ads setup --step 6\n'));
        } else {
          console.log(chalk.green('✅ 账号配置完成，可以开始创建广告系列！\n'));
          console.log(chalk.gray('快速开始:'));
          console.log(chalk.cyan(`   google-ads campaign create -c ${options.customerId} -n "我的广告系列" -b 10\n`));
        }
      }
    } catch (error) {
      spinner.fail('检查失败');
      handleError(error);
    }
  });
