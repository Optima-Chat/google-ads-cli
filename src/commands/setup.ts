/**
 * Setup Command - 显示 Google Ads CLI 完整设置指南
 */

import { Command } from 'commander';
import chalk from 'chalk';

export const setupCommand = new Command('setup')
  .description('显示 Google Ads CLI 完整设置指南')
  .option('--step <number>', '显示特定步骤的详细信息 (1-5)')
  .action((options) => {
    if (options.step) {
      showDetailedStep(parseInt(options.step));
    } else {
      showFullGuide();
    }
  });

function showFullGuide() {
  console.log(chalk.cyan.bold('\n📋 Google Ads CLI 设置指南\n'));

  // Step 1: Google Ads Account
  console.log(chalk.green.bold('步骤 1: 创建 Google Ads 账号'));
  console.log(chalk.gray('   如果还没有 Google Ads 账号：'));
  console.log(chalk.white('   1. 访问: ') + chalk.cyan('https://ads.google.com'));
  console.log(chalk.white('   2. 使用 Google 账号登录'));
  console.log(chalk.white('   3. 按照向导完成账号创建'));
  console.log(chalk.yellow('   💡 提示: 创建账号时需要提供企业信息和支付方式\n'));

  // Step 2: Developer Token
  console.log(chalk.green.bold('步骤 2: 获取 Developer Token'));
  console.log(chalk.white('   1. 访问: ') + chalk.cyan('https://ads.google.com/aw/apicenter'));
  console.log(chalk.white('   2. 申请 API 访问权限'));
  console.log(chalk.white('   3. 获取 Developer Token'));
  console.log(chalk.yellow('   💡 提示: Developer Token 审批可能需要数天时间\n'));

  // Step 3: OAuth2 Credentials
  console.log(chalk.green.bold('步骤 3: 配置 OAuth2 凭据'));
  console.log(chalk.white('   1. 访问: ') + chalk.cyan('https://console.cloud.google.com'));
  console.log(chalk.white('   2. 创建或选择项目'));
  console.log(chalk.white('   3. 启用 Google Ads API'));
  console.log(chalk.white('   4. 创建 OAuth 2.0 客户端 ID (桌面应用)'));
  console.log(chalk.white('   5. 下载客户端密钥（Client ID 和 Client Secret）\n'));

  // Step 4: Initialize CLI
  console.log(chalk.green.bold('步骤 4: 初始化 CLI'));
  console.log(chalk.cyan('   google-ads init'));
  console.log(chalk.gray('   按提示输入 Developer Token、Client ID 和 Client Secret\n'));

  // Step 5: OAuth2 Login
  console.log(chalk.green.bold('步骤 5: OAuth2 登录'));
  console.log(chalk.cyan('   google-ads auth login'));
  console.log(chalk.gray('   会自动打开浏览器完成授权\n'));

  // Step 6: Billing Setup
  console.log(chalk.green.bold('步骤 6: 配置账单信息'));
  console.log(chalk.white('   1. 访问: ') + chalk.cyan('https://ads.google.com/aw/billing'));
  console.log(chalk.white('   2. 添加付款方式（信用卡/银行账户）'));
  console.log(chalk.white('   3. 设置每日预算限额'));
  console.log(chalk.yellow('   ⚠️  重要: 必须配置账单才能创建和运行广告系列\n'));

  // Verification
  console.log(chalk.green.bold('✅ 验证配置'));
  console.log(chalk.cyan('   google-ads account list'));
  console.log(chalk.gray('   查看可访问的账号列表\n'));

  console.log(chalk.cyan('   google-ads account check -c <CUSTOMER_ID>'));
  console.log(chalk.gray('   检查账号配置状态和账单状态\n'));

  // Quick Links
  console.log(chalk.white.bold('🔗 快速链接'));
  console.log(chalk.gray('   Google Ads: ') + chalk.cyan('https://ads.google.com'));
  console.log(chalk.gray('   API Center: ') + chalk.cyan('https://ads.google.com/aw/apicenter'));
  console.log(chalk.gray('   Cloud Console: ') + chalk.cyan('https://console.cloud.google.com'));
  console.log(chalk.gray('   账单中心: ') + chalk.cyan('https://ads.google.com/aw/billing'));
  console.log(chalk.gray('   API 文档: ') + chalk.cyan('https://developers.google.com/google-ads/api'));

  // Tips
  console.log(chalk.white.bold('\n💡 提示'));
  console.log(chalk.gray('   - 使用 ') + chalk.cyan('google-ads setup --step 1') + chalk.gray(' 查看某个步骤的详细说明'));
  console.log(chalk.gray('   - 使用 ') + chalk.cyan('google-ads --help') + chalk.gray(' 查看所有可用命令'));
  console.log(chalk.gray('   - 查看文档: ') + chalk.cyan('https://github.com/Optima-Chat/google-ads-cli\n'));
}

function showDetailedStep(step: number) {
  console.log(chalk.cyan.bold(`\n📋 步骤 ${step} 详细说明\n`));

  switch (step) {
    case 1:
      showStep1();
      break;
    case 2:
      showStep2();
      break;
    case 3:
      showStep3();
      break;
    case 4:
      showStep4();
      break;
    case 5:
      showStep5();
      break;
    case 6:
      showStep6();
      break;
    default:
      console.log(chalk.red(`步骤 ${step} 不存在。请使用 1-6 之间的数字。\n`));
      return;
  }

  console.log(chalk.gray('\n使用 ') + chalk.cyan('google-ads setup') + chalk.gray(' 查看完整指南\n'));
}

function showStep1() {
  console.log(chalk.green.bold('创建 Google Ads 账号\n'));

  console.log(chalk.white('1. 访问 Google Ads 官网'));
  console.log(chalk.cyan('   https://ads.google.com\n'));

  console.log(chalk.white('2. 点击 "立即开始"'));
  console.log(chalk.gray('   使用你的 Google 账号登录（建议使用企业邮箱）\n'));

  console.log(chalk.white('3. 填写企业信息'));
  console.log(chalk.gray('   - 企业名称'));
  console.log(chalk.gray('   - 国家/地区'));
  console.log(chalk.gray('   - 时区'));
  console.log(chalk.gray('   - 货币（创建后不可更改）\n'));

  console.log(chalk.white('4. 设置第一个广告系列（可跳过）'));
  console.log(chalk.gray('   建议先跳过，通过 CLI 创建广告系列\n'));

  console.log(chalk.yellow('💡 提示:'));
  console.log(chalk.gray('   - 货币和时区一旦设置不可更改'));
  console.log(chalk.gray('   - 建议使用企业邮箱注册'));
  console.log(chalk.gray('   - 一个 Google 账号可以管理多个 Ads 账号'));
}

function showStep2() {
  console.log(chalk.green.bold('获取 Developer Token\n'));

  console.log(chalk.white('1. 登录 Google Ads'));
  console.log(chalk.cyan('   https://ads.google.com\n'));

  console.log(chalk.white('2. 访问 API Center'));
  console.log(chalk.cyan('   https://ads.google.com/aw/apicenter'));
  console.log(chalk.gray('   或在 Google Ads 中点击 工具和设置 → API Center\n'));

  console.log(chalk.white('3. 申请 API 访问'));
  console.log(chalk.gray('   - 填写应用名称'));
  console.log(chalk.gray('   - 选择访问级别（测试账号可选 "测试"）'));
  console.log(chalk.gray('   - 提交申请\n'));

  console.log(chalk.white('4. 获取 Developer Token'));
  console.log(chalk.gray('   审批通过后会显示在 API Center 页面\n'));

  console.log(chalk.yellow('⚠️  重要:'));
  console.log(chalk.gray('   - 测试账号: 立即生效，但有功能限制'));
  console.log(chalk.gray('   - 生产账号: 需要审批，可能需要数天时间'));
  console.log(chalk.gray('   - 测试期间可以使用测试 token，正式上线前申请生产 token'));
}

function showStep3() {
  console.log(chalk.green.bold('配置 OAuth2 凭据\n'));

  console.log(chalk.white('1. 访问 Google Cloud Console'));
  console.log(chalk.cyan('   https://console.cloud.google.com\n'));

  console.log(chalk.white('2. 创建或选择项目'));
  console.log(chalk.gray('   点击顶部的项目选择器 → 新建项目\n'));

  console.log(chalk.white('3. 启用 Google Ads API'));
  console.log(chalk.gray('   API 和服务 → 库 → 搜索 "Google Ads API" → 启用\n'));

  console.log(chalk.white('4. 创建 OAuth 2.0 凭据'));
  console.log(chalk.gray('   API 和服务 → 凭据 → 创建凭据 → OAuth 客户端 ID\n'));

  console.log(chalk.white('5. 配置 OAuth 同意屏幕（首次需要）'));
  console.log(chalk.gray('   - 用户类型: 外部'));
  console.log(chalk.gray('   - 应用名称: 填写你的应用名称'));
  console.log(chalk.gray('   - 作用域: 添加 Google Ads API\n'));

  console.log(chalk.white('6. 创建桌面应用凭据'));
  console.log(chalk.gray('   - 应用类型: 桌面应用'));
  console.log(chalk.gray('   - 名称: Google Ads CLI'));
  console.log(chalk.gray('   - 下载 JSON（包含 Client ID 和 Client Secret）\n'));

  console.log(chalk.yellow('💡 提示:'));
  console.log(chalk.gray('   - 保存好 Client ID 和 Client Secret'));
  console.log(chalk.gray('   - 不要将凭据提交到代码库'));
  console.log(chalk.gray('   - 可以随时重新生成'));
}

function showStep4() {
  console.log(chalk.green.bold('初始化 CLI\n'));

  console.log(chalk.white('运行初始化命令:'));
  console.log(chalk.cyan('   google-ads init\n'));

  console.log(chalk.white('按提示输入以下信息:'));
  console.log(chalk.gray('   1. Developer Token (来自步骤 2)'));
  console.log(chalk.gray('   2. Client ID (来自步骤 3)'));
  console.log(chalk.gray('   3. Client Secret (来自步骤 3)'));
  console.log(chalk.gray('   4. Login Customer ID (可选，MCC 账号 ID)\n'));

  console.log(chalk.white('配置文件位置:'));
  console.log(chalk.gray('   ~/.config/google-ads-cli/config.json\n'));

  console.log(chalk.white('环境变量方式（可选）:'));
  console.log(chalk.gray('   export GOOGLE_ADS_DEVELOPER_TOKEN=xxx'));
  console.log(chalk.gray('   export GOOGLE_ADS_CLIENT_ID=xxx'));
  console.log(chalk.gray('   export GOOGLE_ADS_CLIENT_SECRET=xxx\n'));

  console.log(chalk.yellow('💡 提示:'));
  console.log(chalk.gray('   - 环境变量优先级高于配置文件'));
  console.log(chalk.gray('   - 使用 --force 可以重新初始化'));
}

function showStep5() {
  console.log(chalk.green.bold('OAuth2 登录\n'));

  console.log(chalk.white('运行登录命令:'));
  console.log(chalk.cyan('   google-ads auth login\n'));

  console.log(chalk.white('登录流程:'));
  console.log(chalk.gray('   1. CLI 启动本地服务器（默认端口 9001）'));
  console.log(chalk.gray('   2. 自动打开浏览器进入 Google 授权页面'));
  console.log(chalk.gray('   3. 选择要授权的 Google 账号'));
  console.log(chalk.gray('   4. 允许访问 Google Ads 数据'));
  console.log(chalk.gray('   5. 浏览器自动跳转回 CLI，完成授权\n'));

  console.log(chalk.white('Token 存储位置:'));
  console.log(chalk.gray('   ~/.config/google-ads-cli/credentials.json\n'));

  console.log(chalk.white('验证登录状态:'));
  console.log(chalk.cyan('   google-ads auth status\n'));

  console.log(chalk.yellow('💡 提示:'));
  console.log(chalk.gray('   - Token 会自动刷新，无需手动续期'));
  console.log(chalk.gray('   - 使用不同端口: --port 8080'));
  console.log(chalk.gray('   - 退出登录: google-ads auth logout'));
}

function showStep6() {
  console.log(chalk.green.bold('配置账单信息\n'));

  console.log(chalk.white('1. 访问 Google Ads 账单中心'));
  console.log(chalk.cyan('   https://ads.google.com/aw/billing\n'));

  console.log(chalk.white('2. 添加付款方式'));
  console.log(chalk.gray('   支持的付款方式:'));
  console.log(chalk.gray('   - 信用卡/借记卡'));
  console.log(chalk.gray('   - 银行账户'));
  console.log(chalk.gray('   - PayPal（部分地区）\n'));

  console.log(chalk.white('3. 选择付款设置'));
  console.log(chalk.gray('   - 自动付款（推荐）: 达到阈值自动扣款'));
  console.log(chalk.gray('   - 手动付款: 需要手动充值\n'));

  console.log(chalk.white('4. 设置预算提醒'));
  console.log(chalk.gray('   可以设置每日或每月预算上限\n'));

  console.log(chalk.white('验证账单状态:'));
  console.log(chalk.cyan('   google-ads account check -c <CUSTOMER_ID>\n'));

  console.log(chalk.yellow('⚠️  重要:'));
  console.log(chalk.gray('   - 必须配置账单才能创建广告系列'));
  console.log(chalk.gray('   - 账单信息可以随时修改'));
  console.log(chalk.gray('   - 设置预算上限避免意外超支'));
  console.log(chalk.gray('   - 注意汇率变化（如使用外币付款）'));
}
