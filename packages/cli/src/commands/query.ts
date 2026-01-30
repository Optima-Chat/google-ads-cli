/**
 * Query Command - 执行 GAQL 查询
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { getApiClient } from '../lib/api-client.js';
import { handleError } from '../utils/errors.js';
import { getCustomerId } from '../utils/customer-id.js';

export const queryCommand = new Command('query')
  .description('执行 GAQL 查询')
  .option('-c, --customer-id <id>', '客户账号 ID（可选，默认从配置读取）')
  .option('-q, --query <query>', 'GAQL 查询语句')
  .option('-f, --file <file>', '从文件读取 GAQL 查询')
  .action(async (options) => {
    try {
      let query: string;

      if (options.query) {
        query = options.query;
      } else if (options.file) {
        query = readFileSync(options.file, 'utf-8');
      } else {
        console.log(JSON.stringify({
          error: 'missing_query',
          message: '请提供查询语句（使用 -q 或 -f 参数）'
        }, null, 2));
        process.exit(1);
      }

      query = query.trim();

      if (!query) {
        console.log(JSON.stringify({
          error: 'empty_query',
          message: '查询语句不能为空'
        }, null, 2));
        process.exit(1);
      }

      const client = getApiClient();
      const customerId = options.customerId || getCustomerId();

      const results = await client.query(customerId, query);

      console.log(JSON.stringify(results, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
