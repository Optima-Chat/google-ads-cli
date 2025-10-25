#!/usr/bin/env node

/**
 * Google Ads CLI - Main Entry Point
 * 用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计
 */

// 加载 .env 文件中的环境变量
import dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authCommand } from './commands/auth/index.js';
import { accountCommand } from './commands/account/index.js';
import { campaignCommand } from './commands/campaign/index.js';
import { adGroupCommand } from './commands/ad-group/index.js';
import { keywordCommand } from './commands/keyword/index.js';
import { queryCommand } from './commands/query.js';

// 获取版本号
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const VERSION = packageJson.version;

// 创建主程序
const program = new Command();

program
  .name('google-ads')
  .description('用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计')
  .version(VERSION);

// 注册命令
program.addCommand(authCommand);
program.addCommand(accountCommand);
program.addCommand(campaignCommand);
program.addCommand(adGroupCommand);
program.addCommand(keywordCommand);
program.addCommand(queryCommand);

// 默认动作（显示欢迎信息）
program.action(() => {
  console.log(chalk.cyan.bold(`\n✨ Google Ads CLI v${VERSION}\n`));
  console.log(chalk.white('为客户创建和管理 Google Ads 广告的专业工具'));
  console.log(chalk.gray('服务提供商使用本工具为客户管理广告系列、关键词和广告内容\n'));

  console.log(chalk.green('🚀 配置（服务提供商一次性设置）:'));
  console.log(chalk.gray('   1. 复制 .env.example 为 .env'));
  console.log(chalk.gray('   2. 填入 Developer Token、Client ID、Client Secret'));
  console.log(chalk.gray('   3. 运行: ') + chalk.cyan('google-ads auth login') + chalk.gray(' (OAuth2 授权)'));
  console.log(chalk.gray('   4. 授权成功后，refresh token 会自动保存到 .env\n'));

  console.log(chalk.green('📋 为客户管理广告:'));
  console.log(chalk.gray('   • 创建客户账号: ') + chalk.cyan('google-ads account create --help'));
  console.log(chalk.gray('   • 检查账号状态: ') + chalk.cyan('google-ads account check -c <CUSTOMER_ID>'));
  console.log(chalk.gray('   • 创建广告系列: ') + chalk.cyan('google-ads campaign create -c <CUSTOMER_ID> ...'));
  console.log(chalk.gray('   • 查看所有命令: ') + chalk.cyan('google-ads --help') + chalk.gray('\n'));

  console.log(chalk.white('📖 文档和获取凭据:'));
  console.log(chalk.gray('   README: https://github.com/Optima-Chat/google-ads-cli#readme\n'));
});

// 解析命令行参数
program.parse();
