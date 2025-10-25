/**
 * Account Create Command - 客户账号注册
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import inquirer from 'inquirer';
import { handleError } from '../../utils/errors.js';

const config = new Conf({ projectName: 'google-ads-cli' });

export const createCommand = new Command('create')
  .description('创建您的 Google Ads 账号（首次使用）')
  .requiredOption('--email <email>', '您的 Google 账号邮箱（用于接收邀请）')
  .requiredOption('--name <name>', '账号名称（您的公司或品牌名称）')
  .option('--currency <code>', '货币代码（如 USD, CNY）', 'USD')
  .option('--timezone <timezone>', '时区（如 Asia/Shanghai, America/New_York）', 'America/New_York')
  .option('--json', '以 JSON 格式输出')
  .action(async (options) => {
    const spinner = ora('准备创建您的 Google Ads 账号...').start();

    try {
      // 检查是否已经创建过账号
      const existingCustomerId = config.get('customerId') as string | undefined;
      if (existingCustomerId) {
        spinner.warn('您已经创建过账号');
        console.log(chalk.yellow('\n⚠️  检测到已存在的账号配置'));
        console.log(chalk.gray(`Customer ID: ${existingCustomerId}\n`));
        console.log(chalk.white('如果需要重新创建，请先运行:'));
        console.log(chalk.cyan('  google-ads config reset\n'));
        return;
      }

      // 检查 MCC 凭据
      const managerAccountId = process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID;
      if (!managerAccountId) {
        throw new Error(
          '缺少 GOOGLE_ADS_MANAGER_ACCOUNT_ID 环境变量\n' +
            '请在 .env 文件中配置 Agency 的 MCC 管理账号 ID'
        );
      }

      spinner.info('账号创建功能开发中');

      // TODO: 实现账号创建 API 调用
      // 需要调用 google-ads-api 的 CustomerService.createCustomerClient
      // 然后调用 CustomerUserAccessInvitationService 发送邀请

      console.log(chalk.yellow('\n⚠️  注意: 账号创建 API 功能正在开发中\n'));

      console.log(chalk.cyan.bold('📋 手动创建步骤:\n'));

      console.log(chalk.white('步骤 1: 访问 MCC 管理控制台'));
      console.log(chalk.gray('   URL: ') + chalk.cyan('https://ads.google.com'));
      console.log(chalk.gray('   使用 MCC 账号登录\n'));

      console.log(chalk.white('步骤 2: 创建子账号'));
      console.log(chalk.gray('   • 点击 "账号" → "子账号"'));
      console.log(chalk.gray('   • 点击 "+" 创建新账号'));
      console.log(chalk.gray(`   • 账号名称: ${chalk.white(options.name)}`));
      console.log(chalk.gray(`   • 货币: ${chalk.white(options.currency)}`));
      console.log(chalk.gray(`   • 时区: ${chalk.white(options.timezone)}\n`));

      console.log(chalk.white('步骤 3: 发送访问邀请'));
      console.log(chalk.gray('   • 在新创建的账号页面，点击 "访问权限"'));
      console.log(chalk.gray('   • 点击 "+" 添加用户'));
      console.log(chalk.gray(`   • 输入邮箱: ${chalk.cyan(options.email)}`));
      console.log(chalk.gray('   • 选择 "管理员" 权限（可设置账单）\n'));

      console.log(chalk.white('步骤 4: 记录 Customer ID 并保存到配置'));
      console.log(chalk.gray('   创建完成后，请输入新账号的 Customer ID\n'));

      // 提示用户输入 Customer ID
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'customerId',
          message: '请输入新创建的 Customer ID（格式：123-456-7890 或 1234567890）:',
          validate: (input: string) => {
            // 移除连字符
            const clean = input.replace(/-/g, '');
            // 验证是否为 10 位数字
            if (!/^\d{10}$/.test(clean)) {
              return '请输入有效的 Customer ID（10 位数字）';
            }
            return true;
          },
        },
      ]);

      const customerId = answers.customerId.replace(/-/g, '');

      // 保存到 config
      config.set('customerId', customerId);
      config.set('accountName', options.name);
      config.set('currency', options.currency);
      config.set('timezone', options.timezone);
      config.set('email', options.email);
      config.set('createdAt', new Date().toISOString());

      console.log(chalk.green('\n✅ 配置已保存！\n'));

      const formattedCustomerId = customerId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

      if (options.json) {
        const result = {
          success: true,
          customer_id: formattedCustomerId,
          account_name: options.name,
          currency: options.currency,
          timezone: options.timezone,
          email: options.email,
          next_steps: [
            '检查邮箱中的 Google Ads 邀请邮件',
            '点击邮件中的链接接受邀请',
            '登录 Google Ads 设置账单',
            '运行 google-ads account check 验证配置',
          ],
        };
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.cyan.bold('📧 下一步操作:\n'));

        console.log(chalk.white('1. 检查您的邮箱 ') + chalk.cyan(options.email));
        console.log(chalk.gray('   查找来自 Google Ads 的邀请邮件（可能在垃圾邮件中）\n'));

        console.log(chalk.white('2. 点击邮件中的 "接受邀请" 链接\n'));

        console.log(chalk.white('3. 使用您的 Google 账号登录并接受邀请\n'));

        console.log(chalk.white('4. 设置账单信息:'));
        console.log(chalk.gray('   访问: ') + chalk.cyan('https://ads.google.com/aw/billing'));
        console.log(chalk.gray('   添加付款方式（信用卡或银行账户）\n'));

        console.log(chalk.white('5. 验证账号配置:'));
        console.log(chalk.cyan('   google-ads account check\n'));

        console.log(
          chalk.gray(
            `💡 提示: Customer ID (${formattedCustomerId}) 已保存，后续命令无需指定账号\n`
          )
        );
      }
    } catch (error) {
      spinner.fail('操作失败');
      handleError(error);
    }
  });
