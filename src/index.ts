#!/usr/bin/env node

/**
 * Google Ads CLI - Main Entry Point
 * 用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// 默认动作（显示欢迎信息）
program.action(() => {
  console.log(chalk.cyan.bold(`\n✨ Google Ads CLI v${VERSION}\n`));
  console.log(chalk.white('用自然语言管理 Google Ads 广告投放 - 专为 Claude Code 设计\n'));
  console.log(chalk.green('🚀 快速开始:'));
  console.log(chalk.gray('   1. 初始化: ') + chalk.cyan('google-ads init'));
  console.log(chalk.gray('   2. 登录: ') + chalk.cyan('google-ads auth login'));
  console.log(chalk.gray('   3. 查看账号: ') + chalk.cyan('google-ads account list'));
  console.log(chalk.gray('   4. 查看所有命令: ') + chalk.cyan('google-ads --help') + chalk.gray('\n'));
  console.log(chalk.white('🔗 了解更多:'));
  console.log(chalk.gray('   GitHub: https://github.com/Optima-Chat/google-ads-cli'));
  console.log(chalk.gray('   文档: https://github.com/Optima-Chat/google-ads-cli/tree/main/docs\n'));
});

// 解析命令行参数
program.parse();
