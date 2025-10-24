/**
 * Init Command - 初始化配置
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { saveConfig, configExists, getConfigPath } from '../utils/config.js';
import { success, warn, info } from '../utils/logger.js';
import { GoogleAdsConfig } from '../config.js';

export const initCommand = new Command('init')
  .description('初始化 Google Ads CLI 配置')
  .option('--force', '强制重新初始化（覆盖现有配置）')
  .action(async (options) => {
    console.log(chalk.cyan.bold('\n✨ 欢迎使用 Google Ads CLI!\n'));
    console.log(chalk.white('让我们开始配置...\n'));

    // 检查是否已有配置
    if (configExists() && !options.force) {
      warn('配置文件已存在');
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: '是否覆盖现有配置？',
          default: false,
        },
      ]);

      if (!overwrite) {
        info('已取消初始化');
        return;
      }
    }

    // 交互式配置
    console.log(chalk.yellow('📋 第一步: Google Ads API 凭据\n'));
    console.log(chalk.gray('   您需要从 Google Cloud Console 获取以下信息:'));
    console.log(chalk.gray('   https://console.cloud.google.com/apis/credentials\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'developerToken',
        message: 'Developer Token:',
        validate: (input) => (input ? true : 'Developer Token 不能为空'),
      },
      {
        type: 'input',
        name: 'clientId',
        message: 'Client ID:',
        validate: (input) => (input ? true : 'Client ID 不能为空'),
      },
      {
        type: 'password',
        name: 'clientSecret',
        message: 'Client Secret:',
        validate: (input) => (input ? true : 'Client Secret 不能为空'),
      },
      {
        type: 'input',
        name: 'loginCustomerId',
        message: 'Login Customer ID (MCC 账号，可选):',
      },
      {
        type: 'input',
        name: 'defaultCustomerId',
        message: 'Default Customer ID (默认客户账号，可选):',
      },
      {
        type: 'list',
        name: 'outputFormat',
        message: '默认输出格式:',
        choices: ['table', 'json', 'csv'],
        default: 'table',
      },
      {
        type: 'confirm',
        name: 'colorOutput',
        message: '启用彩色输出?',
        default: true,
      },
    ]);

    // 构建配置对象
    const config: GoogleAdsConfig = {
      developerToken: answers.developerToken,
      clientId: answers.clientId,
      clientSecret: answers.clientSecret,
      loginCustomerId: answers.loginCustomerId || undefined,
      defaultCustomerId: answers.defaultCustomerId || undefined,
      outputFormat: answers.outputFormat,
      colorOutput: answers.colorOutput,
    };

    // 保存配置
    try {
      saveConfig(config);
      success(`配置已保存到: ${getConfigPath()}\n`);

      console.log(chalk.yellow('📋 第二步: OAuth2 认证\n'));
      console.log(chalk.white('   运行以下命令完成认证:\n'));
      console.log(chalk.cyan('   google-ads auth login\n'));

      if (config.defaultCustomerId) {
        console.log(chalk.yellow('📋 第三步: 开始使用\n'));
        console.log(chalk.white('   认证成功后，尝试以下命令:\n'));
        console.log(chalk.cyan('   google-ads account list'));
        console.log(chalk.cyan('   google-ads campaign list\n'));
      } else {
        console.log(chalk.yellow('📋 第三步: 设置默认账号\n'));
        console.log(chalk.white('   认证成功后，设置默认客户账号:\n'));
        console.log(chalk.cyan('   google-ads config set default-customer-id <YOUR_ACCOUNT_ID>\n'));
      }

      console.log(chalk.green('🎉 配置完成！\n'));
      console.log(chalk.gray("运行 'google-ads --help' 查看所有命令"));
    } catch (error: any) {
      console.error(chalk.red('✗ 保存配置失败:'), error.message);
      process.exit(1);
    }
  });
