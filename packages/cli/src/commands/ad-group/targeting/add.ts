/**
 * Ad Group Targeting Add Command - 添加广告组定向条件
 */

import { Command } from 'commander';
import { getApiClient } from '../../../lib/api-client.js';
import { handleError } from '../../../utils/errors.js';
import { getCustomerId } from '../../../utils/customer-id.js';

export const addCommand = new Command('add')
  .description(
    `添加广告组定向条件（人口统计学定向）

说明:
  - 广告组级别支持正向定向和出价调整
  - 使用 --bid-modifier 调整特定人群的出价
  - parental_status 可能在某些广告系列类型下不可用

示例:
  # 针对 25-34 岁用户，出价 +30%
  google-ads ad-group targeting add --ad-group-id 123 --type age_range --age-range AGE_RANGE_25_34 --bid-modifier 1.3

  # 针对男性用户，出价 +10%
  google-ads ad-group targeting add --ad-group-id 123 --type gender --gender MALE --bid-modifier 1.1

  # 针对高收入用户 (前 10%)，出价 +50%
  google-ads ad-group targeting add --ad-group-id 123 --type income_range --income-range INCOME_RANGE_90_UP --bid-modifier 1.5

  # 排除未知性别用户
  google-ads ad-group targeting add --ad-group-id 123 --type gender --gender UNDETERMINED --negative`,
  )
  .requiredOption('--ad-group-id <id>', '广告组 ID')
  .requiredOption(
    '--type <type>',
    '定向类型: age_range, gender, income_range, parental_status, user_list',
  )
  // Age range options
  .option(
    '--age-range <range>',
    '[age_range] 年龄: AGE_RANGE_18_24, AGE_RANGE_25_34, AGE_RANGE_35_44, AGE_RANGE_45_54, AGE_RANGE_55_64, AGE_RANGE_65_UP, AGE_RANGE_UNDETERMINED',
  )
  // Gender options
  .option('--gender <gender>', '[gender] 性别: MALE, FEMALE, UNDETERMINED')
  // Income range options
  .option(
    '--income-range <range>',
    '[income_range] 收入 (前 X%): INCOME_RANGE_0_50, INCOME_RANGE_50_60, INCOME_RANGE_60_70, INCOME_RANGE_70_80, INCOME_RANGE_80_90, INCOME_RANGE_90_UP',
  )
  // Parental status options
  .option(
    '--parental-status <status>',
    '[parental_status] 育儿状态: PARENT, NOT_A_PARENT, UNDETERMINED (部分广告类型不支持)',
  )
  // User list options
  .option('--user-list-id <id>', '[user_list] 用户列表/再营销列表 ID')
  // Common options
  .option('--negative', '排除定向（不向此人群展示广告）')
  .option(
    '--bid-modifier <number>',
    '出价调整系数 (0=不展示, 0.5=-50%, 1=不变, 1.5=+50%, 2=+100%)',
    parseFloat,
  )
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      // Build targeting object based on type
      const targeting: {
        type: string;
        ageRange?: string;
        gender?: string;
        incomeRange?: string;
        parentalStatus?: string;
        userListId?: string;
        negative?: boolean;
        bidModifier?: number;
      } = {
        type: options.type,
        negative: options.negative || false,
      };

      if (options.bidModifier !== undefined) {
        targeting.bidModifier = options.bidModifier;
      }

      switch (options.type) {
        case 'age_range':
          if (!options.ageRange) {
            console.error('错误: --age-range 参数是必需的');
            process.exit(1);
          }
          targeting.ageRange = options.ageRange;
          break;

        case 'gender':
          if (!options.gender) {
            console.error('错误: --gender 参数是必需的');
            process.exit(1);
          }
          targeting.gender = options.gender;
          break;

        case 'income_range':
          if (!options.incomeRange) {
            console.error('错误: --income-range 参数是必需的');
            process.exit(1);
          }
          targeting.incomeRange = options.incomeRange;
          break;

        case 'parental_status':
          if (!options.parentalStatus) {
            console.error('错误: --parental-status 参数是必需的');
            process.exit(1);
          }
          targeting.parentalStatus = options.parentalStatus;
          break;

        case 'user_list':
          if (!options.userListId) {
            console.error('错误: --user-list-id 参数是必需的');
            process.exit(1);
          }
          targeting.userListId = options.userListId;
          break;

        default:
          console.error(`错误: 不支持的定向类型 "${options.type}"`);
          process.exit(1);
      }

      const result = await client.addAdGroupTargeting(
        customerId,
        options.adGroupId,
        targeting,
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
