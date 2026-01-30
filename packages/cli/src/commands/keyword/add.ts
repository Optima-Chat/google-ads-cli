/**
 * Keyword Add Command - 添加关键词
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { handleError } from '../../utils/errors.js';

export const addCommand = new Command('add')
  .description('添加关键词')
  .requiredOption('-c, --customer-id <id>', '客户账号 ID')
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption('-k, --keywords <keywords>', '关键词（逗号分隔）')
  .option('--match-type <type>', '匹配类型 (BROAD, PHRASE, EXACT)', 'BROAD')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('添加关键词...').start();

    try {
      const client = new GoogleAdsClient();

      // 解析关键词
      const keywordTexts = options.keywords.split(',').map((k: string) => k.trim());
      const keywords = keywordTexts.map((text: string) => ({
        text,
        match_type: options.matchType,
      }));

      const result = await client.addKeywords(
        options.customerId,
        options.adGroupId,
        keywords
      );

      spinner.succeed(`成功添加 ${keywordTexts.length} 个关键词`);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`\n✅ 已添加 ${keywordTexts.length} 个关键词`));
        console.log(chalk.gray('匹配类型:'), chalk.white(options.matchType));
        console.log(chalk.gray('\n关键词列表:'));
        keywordTexts.forEach((text: string, index: number) => {
          console.log(chalk.white(`  ${index + 1}. ${text}`));
        });

        console.log(chalk.gray('\n💡 查看关键词:'));
        console.log(chalk.cyan(`   google-ads keyword list -c ${options.customerId} --ad-group-id ${options.adGroupId}`));
      }
    } catch (error) {
      spinner.fail('添加失败');
      handleError(error);
    }
  });
