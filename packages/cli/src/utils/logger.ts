/**
 * 日志工具
 */

import chalk from 'chalk';

export function log(message: string): void {
  console.log(message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function debug(message: string): void {
  if (process.env.DEBUG === 'true') {
    console.log(chalk.gray('[DEBUG]'), message);
  }
}
