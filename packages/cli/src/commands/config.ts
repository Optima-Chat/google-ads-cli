/**
 * Config Command - 配置管理
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Conf from 'conf';
import Table from 'cli-table3';
import inquirer from 'inquirer';

const config = new Conf({ projectName: 'google-ads-cli' });

export const configCommand = new Command('config')
  .description('管理 CLI 配置');

// config show - 显示当前配置
configCommand
  .command('show')
  .description('显示当前配置')
  .option('--json', '以 JSON 格式输出')
  .action((options) => {
    const customerId = config.get('customerId') as string | undefined;
    const accountName = config.get('accountName') as string | undefined;
    const currency = config.get('currency') as string | undefined;
    const timezone = config.get('timezone') as string | undefined;
    const email = config.get('email') as string | undefined;
    const createdAt = config.get('createdAt') as string | undefined;

    if (!customerId) {
      console.log(chalk.yellow('\n⚠️  未找到账号配置\n'));
      console.log(chalk.gray('请先运行: ') + chalk.cyan('google-ads account create\n'));
      return;
    }

    if (options.json) {
      const result = {
        customer_id: customerId,
        account_name: accountName,
        currency,
        timezone,
        email,
        created_at: createdAt,
        config_path: config.path,
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.cyan.bold('\n📋 当前配置\n'));

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

      const formattedCustomerId = customerId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

      table.push(
        [chalk.gray('Customer ID'), chalk.white(formattedCustomerId)],
        [chalk.gray('账号名称'), chalk.white(accountName || 'N/A')],
        [chalk.gray('货币'), chalk.white(currency || 'N/A')],
        [chalk.gray('时区'), chalk.white(timezone || 'N/A')],
        [chalk.gray('邮箱'), chalk.white(email || 'N/A')],
        [chalk.gray('创建时间'), chalk.white(createdAt ? new Date(createdAt).toLocaleString() : 'N/A')]
      );

      console.log(table.toString());
      console.log(chalk.gray(`\n配置文件路径: ${config.path}\n`));
    }
  });

// config reset - 重置配置
configCommand
  .command('reset')
  .description('重置配置（删除所有已保存的配置）')
  .option('--force', '跳过确认直接重置')
  .action(async (options) => {
    const customerId = config.get('customerId') as string | undefined;

    if (!customerId) {
      console.log(chalk.yellow('\n⚠️  当前没有配置需要重置\n'));
      return;
    }

    if (!options.force) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确定要重置配置吗？这将删除所有已保存的账号信息。',
          default: false,
        },
      ]);

      if (!answers.confirm) {
        console.log(chalk.gray('\n已取消\n'));
        return;
      }
    }

    config.clear();
    console.log(chalk.green('\n✅ 配置已重置\n'));
    console.log(chalk.gray('您可以重新运行: ') + chalk.cyan('google-ads account create\n'));
  });

// config path - 显示配置文件路径
configCommand
  .command('path')
  .description('显示配置文件路径')
  .action(() => {
    console.log(config.path);
  });
