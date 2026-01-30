#!/usr/bin/env node

/**
 * Google Ads CLI - Main Entry Point
 * 用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计
 */

// 加载 .env 文件中的环境变量（静默模式）
import 'dotenv/config';

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authCommand } from './commands/auth/index.js';
import { accountCommand } from './commands/account/index.js';
import { campaignCommand } from './commands/campaign/index.js';
import { adGroupCommand } from './commands/ad-group/index.js';
import { adCommand } from './commands/ad/index.js';
import { keywordCommand } from './commands/keyword/index.js';
import { queryCommand } from './commands/query.js';
import { configCommand } from './commands/config.js';
import { fetchOptimaConfig } from './utils/optima-config.js';

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
program.addCommand(adCommand);
program.addCommand(keywordCommand);
program.addCommand(queryCommand);
program.addCommand(configCommand);

// 默认动作（显示欢迎信息）
program.action(() => {
  console.log(chalk.cyan.bold(`\n✨ Google Ads CLI v${VERSION}\n`));
  console.log(chalk.white('管理您的 Google Ads 广告投放'));
  console.log(chalk.gray('专为 Claude Code 设计的 CLI 工具\n'));

  console.log(chalk.green('🚀 首次使用:'));
  console.log(chalk.white('   步骤 1: 配置 Agency 凭据'));
  console.log(chalk.gray('      • 复制 .env.example 为 .env'));
  console.log(chalk.gray('      • 填入 Agency 提供的凭据（Developer Token, OAuth2, MCC ID）'));
  console.log(chalk.gray('      • 运行: ') + chalk.cyan('google-ads auth login\n'));

  console.log(chalk.white('   步骤 2: 创建您的账号'));
  console.log(chalk.gray('      • 运行: ') + chalk.cyan('google-ads account create --email <your-email> --name <your-name>'));
  console.log(chalk.gray('      • 检查邮箱接受邀请'));
  console.log(chalk.gray('      • 设置账单信息\n'));

  console.log(chalk.green('📋 日常使用:'));
  console.log(chalk.gray('   • 检查账号状态: ') + chalk.cyan('google-ads account check'));
  console.log(chalk.gray('   • 查看广告系列: ') + chalk.cyan('google-ads campaign list'));
  console.log(chalk.gray('   • 创建广告系列: ') + chalk.cyan('google-ads campaign create -n "广告系列名称" -b 10'));
  console.log(chalk.gray('   • 查看所有命令: ') + chalk.cyan('google-ads --help') + chalk.gray('\n'));

  console.log(chalk.white('⚙️  配置管理:'));
  console.log(chalk.gray('   • 查看当前配置: ') + chalk.cyan('google-ads config show'));
  console.log(chalk.gray('   • 重置配置: ') + chalk.cyan('google-ads config reset\n'));

  console.log(chalk.white('📖 文档:'));
  console.log(chalk.gray('   README: https://github.com/Optima-Chat/google-ads-cli#readme\n'));
});

// 启动 CLI
async function main() {
  // 从 commerce-backend 获取配置（如果有 OPTIMA_TOKEN）
  await fetchOptimaConfig();

  // 解析命令行参数
  program.parse();
}

main();
