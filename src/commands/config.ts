/**
 * Config Command - 配置管理
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { loadConfig, saveConfig, updateConfig, configExists } from '../utils/config.js';
import { success, error as logError } from '../utils/logger.js';
import { handleError } from '../utils/errors.js';

// config show 子命令
const showCommand = new Command('show')
  .description('显示当前配置')
  .option('--json', '以 JSON 格式输出')
  .action((options) => {
    try {
      if (!configExists()) {
        logError('配置文件不存在，请先运行: google-ads init');
        process.exit(1);
      }

      const config = loadConfig();

      if (options.json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        const table = new Table({
          head: [chalk.cyan('配置项'), chalk.cyan('值')],
          colWidths: [30, 50],
        });

        table.push(
          ['Developer Token', maskToken(config.developerToken)],
          ['Client ID', config.clientId],
          ['Client Secret', maskToken(config.clientSecret)],
          ['Login Customer ID', config.loginCustomerId || chalk.gray('(未设置)')],
          ['Default Customer ID', config.defaultCustomerId || chalk.gray('(未设置)')],
          ['Output Format', config.outputFormat],
          ['Color Output', config.colorOutput ? chalk.green('是') : chalk.gray('否')]
        );

        console.log('\n' + table.toString() + '\n');
      }
    } catch (err) {
      handleError(err);
    }
  });

// config set 子命令
const setCommand = new Command('set')
  .description('设置配置项')
  .argument('<key>', '配置项名称')
  .argument('<value>', '配置项值')
  .action((key: string, value: string) => {
    try {
      if (!configExists()) {
        logError('配置文件不存在，请先运行: google-ads init');
        process.exit(1);
      }

      // 转换 key 格式（kebab-case -> camelCase）
      const configKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

      // 验证 key
      const validKeys = [
        'developerToken',
        'clientId',
        'clientSecret',
        'loginCustomerId',
        'defaultCustomerId',
        'outputFormat',
        'colorOutput',
      ];

      if (!validKeys.includes(configKey)) {
        logError(`无效的配置项: ${key}`);
        console.log('\n可用的配置项:');
        console.log(chalk.gray('  - developer-token'));
        console.log(chalk.gray('  - client-id'));
        console.log(chalk.gray('  - client-secret'));
        console.log(chalk.gray('  - login-customer-id'));
        console.log(chalk.gray('  - default-customer-id'));
        console.log(chalk.gray('  - output-format (table|json|csv)'));
        console.log(chalk.gray('  - color-output (true|false)'));
        process.exit(1);
      }

      // 转换值类型
      let parsedValue: any = value;
      if (configKey === 'colorOutput') {
        parsedValue = value === 'true';
      }

      // 更新配置
      updateConfig(configKey as any, parsedValue);
      success(`已设置 ${key} = ${value}`);
    } catch (err) {
      handleError(err);
    }
  });

// config reset 子命令
const resetCommand = new Command('reset')
  .description('重置配置（重新运行 init）')
  .action(() => {
    console.log(chalk.yellow('\n请运行以下命令重新初始化配置:\n'));
    console.log(chalk.cyan('  google-ads init --force\n'));
  });

// 主命令
export const configCommand = new Command('config')
  .description('管理配置')
  .addCommand(showCommand)
  .addCommand(setCommand)
  .addCommand(resetCommand);

/**
 * 遮盖敏感信息
 */
function maskToken(token: string): string {
  if (!token || token.length < 8) {
    return '***';
  }
  return token.substring(0, 4) + '***' + token.substring(token.length - 4);
}
