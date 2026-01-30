/**
 * Campaign Targeting Add Command - 添加广告系列定向条件
 */

import { Command } from 'commander';
import { getApiClient } from '../../../lib/api-client.js';
import { handleError } from '../../../utils/errors.js';
import { getCustomerId } from '../../../utils/customer-id.js';

export const addCommand = new Command('add')
  .description(
    `添加广告系列定向条件

注意事项:
  - 人口统计定向 (age_range, gender 等) 在广告系列级别只支持排除定向，需加 --negative
  - 如需正向定向并调整出价，请使用广告组级别定向 (ad-group targeting add)
  - CONNECTED_TV 设备类型不适用于搜索广告系列
  - 负定向不支持出价调整系数

示例:
  # 添加地理位置定向 (美国)
  google-ads campaign targeting add --campaign-id 123 --type location --geo-target 2840

  # 添加半径定向 (旧金山 25 英里)
  google-ads campaign targeting add --campaign-id 123 --type proximity --lat 37.77 --lng -122.41 --radius 25

  # 添加时间定向 (周一 9-17 点，出价 +20%)
  google-ads campaign targeting add --campaign-id 123 --type schedule --day MONDAY --start-hour 9 --end-hour 17 --bid-modifier 1.2

  # 排除未知年龄用户
  google-ads campaign targeting add --campaign-id 123 --type age_range --age-range AGE_RANGE_UNDETERMINED --negative`,
  )
  .requiredOption('--campaign-id <id>', '广告系列 ID')
  .requiredOption(
    '--type <type>',
    '定向类型: location, proximity, device, schedule, age_range, gender, income_range, parental_status, user_list',
  )
  // Location options
  .option('--geo-target <id>', '[location] 地理位置常量 ID (例如: 2840=美国, 2156=中国)')
  // Proximity options
  .option('--lat <number>', '[proximity] 纬度', parseFloat)
  .option('--lng <number>', '[proximity] 经度', parseFloat)
  .option('--radius <number>', '[proximity] 半径', parseFloat)
  .option('--radius-units <units>', '[proximity] 半径单位 (MILES, KILOMETERS)', 'MILES')
  // Device options
  .option(
    '--device <type>',
    '[device] 设备类型: MOBILE, DESKTOP, TABLET (CONNECTED_TV 仅限视频广告)',
  )
  // Schedule options
  .option(
    '--day <day>',
    '[schedule] 星期: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY',
  )
  .option('--start-hour <hour>', '[schedule] 开始小时 (0-24)', parseInt)
  .option('--start-minute <minute>', '[schedule] 开始分钟 (0, 15, 30, 45)', parseInt)
  .option('--end-hour <hour>', '[schedule] 结束小时 (0-24)', parseInt)
  .option('--end-minute <minute>', '[schedule] 结束分钟 (0, 15, 30, 45)', parseInt)
  // Age range options
  .option(
    '--age-range <range>',
    '[age_range] 年龄范围 (广告系列级别需配合 --negative 使用)',
  )
  // Gender options
  .option('--gender <gender>', '[gender] 性别: MALE, FEMALE, UNDETERMINED (广告系列级别需配合 --negative)')
  // Income range options
  .option(
    '--income-range <range>',
    '[income_range] 收入范围 (广告系列级别需配合 --negative)',
  )
  // Parental status options
  .option(
    '--parental-status <status>',
    '[parental_status] 育儿状态: PARENT, NOT_A_PARENT, UNDETERMINED',
  )
  // User list options
  .option('--user-list-id <id>', '[user_list] 用户列表/再营销列表 ID')
  // Common options
  .option('--negative', '排除定向（人口统计在广告系列级别必须使用此选项）')
  .option(
    '--bid-modifier <number>',
    '出价调整系数 (0-10, 1=不变, 0=-100%, 2=+100%)。仅适用于 device/schedule 等，负定向不支持',
    parseFloat,
  )
  .action(async (options) => {
    try {
      const customerId = getCustomerId();
      const client = getApiClient();

      // Build targeting object based on type
      const targeting: {
        type: string;
        geoTargetConstant?: string;
        latitude?: number;
        longitude?: number;
        radius?: number;
        radiusUnits?: string;
        device?: string;
        dayOfWeek?: string;
        startHour?: number;
        startMinute?: number;
        endHour?: number;
        endMinute?: number;
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
        case 'location':
          if (!options.geoTarget) {
            console.error('错误: --geo-target 参数是必需的');
            process.exit(1);
          }
          targeting.geoTargetConstant = options.geoTarget;
          break;

        case 'proximity':
          if (
            options.lat === undefined ||
            options.lng === undefined ||
            options.radius === undefined
          ) {
            console.error('错误: --lat, --lng, --radius 参数是必需的');
            process.exit(1);
          }
          targeting.latitude = options.lat;
          targeting.longitude = options.lng;
          targeting.radius = options.radius;
          targeting.radiusUnits = options.radiusUnits;
          break;

        case 'device':
          if (!options.device) {
            console.error('错误: --device 参数是必需的');
            process.exit(1);
          }
          targeting.device = options.device;
          break;

        case 'schedule':
          if (
            !options.day ||
            options.startHour === undefined ||
            options.endHour === undefined
          ) {
            console.error('错误: --day, --start-hour, --end-hour 参数是必需的');
            process.exit(1);
          }
          targeting.dayOfWeek = options.day;
          targeting.startHour = options.startHour;
          targeting.startMinute = options.startMinute || 0;
          targeting.endHour = options.endHour;
          targeting.endMinute = options.endMinute || 0;
          break;

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

      const result = await client.addCampaignTargeting(
        customerId,
        options.campaignId,
        targeting,
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      handleError(error);
    }
  });
