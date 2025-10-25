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
  .description('初始化 Google Ads CLI 配置（服务提供商一次性设置）')
  .option('--force', '强制重新初始化（覆盖现有配置）')
  .addHelpText('after', `

服务提供商设置指南:

  本工具专为服务提供商设计，使用您的凭据为多个客户管理 Google Ads 广告。

  步骤 1: 创建 MCC 管理账号（如果还没有）
    访问: https://ads.google.com
    创建 MCC (My Client Center) 管理账号，用于管理多个客户的广告账号

  步骤 2: 获取 Developer Token
    访问: https://ads.google.com/aw/apicenter
    申请 API 访问权限并获取 Developer Token
    注意: 测试环境立即生效，生产环境需要审批（可能需要数天）

  步骤 3: 配置 OAuth2 凭据
    访问: https://console.cloud.google.com
    1. 创建或选择 Google Cloud 项目
    2. 启用 Google Ads API
    3. 创建 OAuth 2.0 客户端 ID（应用类型: 桌面应用）
    4. 下载客户端密钥（Client ID 和 Client Secret）

  步骤 4: 运行初始化
    google-ads init
    按提示输入 Developer Token、Client ID、Client Secret

  步骤 5: OAuth2 登录
    google-ads auth login
    会自动打开浏览器完成授权

  完成后即可为客户创建和管理广告账号！

  更多信息: https://github.com/Optima-Chat/google-ads-cli#readme
`)
  .action(async (options) => {
    console.log(chalk.cyan.bold('\n✨ 欢迎使用 Google Ads CLI!\n'));
    console.log(chalk.white('服务提供商一次性配置 - 完成后可为多个客户管理广告\n'));
    console.log(chalk.gray('💡 提示: 运行 ') + chalk.cyan('google-ads init --help') + chalk.gray(' 查看详细设置指南\n'));

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
