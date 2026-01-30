/**
 * Query Command - 执行 GAQL 查询
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync } from 'fs';
import { getApiClient } from '../lib/api-client.js';
import { handleError } from '../utils/errors.js';
import { warn } from '../utils/logger.js';
import { getCustomerId } from '../utils/customer-id.js';

export const queryCommand = new Command('query')
  .description('执行 GAQL 查询')
  .option('-c, --customer-id <id>', '客户账号 ID（可选，默认从配置读取）')
  .option('-q, --query <query>', 'GAQL 查询语句')
  .option('-f, --file <file>', '从文件读取 GAQL 查询')
  .option('--json', '以 JSON 格式输出（默认）')
  .option('--pretty', '美化 JSON 输出')
  .action(async (options) => {
    try {
      // 获取查询语句
      let query: string;

      if (options.query) {
        query = options.query;
      } else if (options.file) {
        query = readFileSync(options.file, 'utf-8');
      } else {
        warn('请提供查询语句（使用 -q 或 -f 参数）');
        console.log();
        console.log(chalk.gray('示例:'));
        console.log(chalk.cyan('  google-ads query -c 1234567890 -q "SELECT campaign.id, campaign.name FROM campaign"'));
        console.log(chalk.cyan('  google-ads query -c 1234567890 -f query.gaql'));
        process.exit(1);
      }

      // 清理查询语句
      query = query.trim();

      if (!query) {
        warn('查询语句不能为空');
        process.exit(1);
      }

      const client = getApiClient();
      const customerId = options.customerId || getCustomerId();

      const spinner = ora('正在执行查询...').start();

      // 执行查询
      const results = await client.query(customerId, query);
      spinner.stop();

      // 输出结果
      if (results.length === 0) {
        warn('查询未返回任何结果');
        return;
      }

      // 总是输出 JSON 格式（LLM 友好）
      if (options.pretty) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(JSON.stringify(results));
      }

      // 显示统计信息（仅当 pretty 模式时）
      if (options.pretty) {
        console.log();
        console.log(chalk.gray(`共返回 ${results.length} 条记录`));
      }
    } catch (error) {
      handleError(error);
    }
  });
