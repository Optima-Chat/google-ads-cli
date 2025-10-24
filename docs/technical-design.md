# Google Ads CLI - 最终技术方案 v2.0

> 直接调用 Google Ads API 的命令行工具，专为 LLM（Claude Code）调用设计

**版本**: v2.0 (直接 API 调用架构)
**日期**: 2025-10-24
**状态**: Ready for Implementation

## 架构决策

### 选择方案 B：直接调用 Google Ads API ✅

**核心理念**: 架构简洁优美，为长远计

**决策理由**:
1. 🎯 **架构简洁** - 2 层架构 vs 3 层，减少复杂度
2. ⚡ **性能更好** - 减少一次网络跳转（~500ms vs ~700ms）
3. 📦 **部署简单** - 一个 npm 包搞定，无需额外服务
4. 🔧 **维护简单** - 单一代码库，单一技术栈（TypeScript）
5. 🌐 **离线可用** - 不依赖外部服务
6. 🚀 **长期价值** - 架构清晰，易于理解和扩展

**权衡认知**:
- ⏰ 开发时间增加（+21 天）
- 🔐 需要实现 OAuth2 认证
- 🔁 无法复用 google-ads-mcp 的代码

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                         用户交互层                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Claude Code (LLM)              开发者 (Human)               │
│  ↓ ShellTool                    ↓ Terminal                   │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 命令调用（独立进程）
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    google-ads-cli (本项目)                    │
│                    TypeScript + Node.js                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🎯 双模式设计                                                │
│  ├─ 结构化命令模式 (80%)                                      │
│  │   • google-ads campaign list                             │
│  │   • google-ads keyword add <id> --keywords "..."         │
│  │                                                            │
│  └─ GAQL 查询模式 (20%)                                       │
│      • google-ads query "SELECT ... FROM ... WHERE ..."      │
│                                                               │
│  📦 命令模块                                                  │
│  ├── auth (认证管理)          ← 新增                         │
│  ├── account (账号管理)                                       │
│  ├── campaign (广告系列)                                      │
│  ├── ad-group (广告组)                                        │
│  ├── keyword (关键词)                                         │
│  ├── ad-copy (广告文案)                                       │
│  ├── performance (效果分析)                                   │
│  └── query (GAQL 查询)                                        │
│                                                               │
│  🔧 核心服务                                                  │
│  ├── Google Ads Client (官方 SDK)    ← 新增                 │
│  ├── OAuth2 Manager (认证管理)       ← 新增                 │
│  ├── Token Refresher (自动刷新)      ← 新增                 │
│  ├── Config Manager (配置管理)                               │
│  ├── Output Formatter (格式化)                               │
│  └── Error Handler (错误处理)                                │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Google Ads API (gRPC/REST)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                      Google Ads API                          │
│                      (v21 - 最新版本)                        │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

### 核心依赖

| 组件 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **语言** | TypeScript | 5.0+ | 类型安全 |
| **运行时** | Node.js | 18+ | 最新 LTS |
| **Google Ads SDK** | google-ads-api | 最新 | 官方 Node.js SDK |
| **CLI 框架** | commander | 12.0+ | 命令解析 |
| **HTTP 客户端** | axios | 1.6+ | OAuth2 请求 |
| **输出格式化** | chalk + cli-table3 | 最新 | 终端美化 |
| **交互提示** | inquirer | 9.0+ | 交互式输入 |
| **配置存储** | conf | 12.0+ | 配置持久化 |
| **加载动画** | ora | 8.0+ | 命令执行提示 |
| **OAuth2 服务器** | express | 4.x | 本地回调服务器 |
| **浏览器打开** | open | 10.0+ | OAuth 授权 |

### Google Ads API SDK

```typescript
// 使用官方 Node.js SDK
import { GoogleAdsApi } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET',
  developer_token: 'YOUR_DEVELOPER_TOKEN',
});

const customer = client.Customer({
  customer_id: '1234567890',
  refresh_token: 'YOUR_REFRESH_TOKEN',
});

// 查询
const campaigns = await customer.query(`
  SELECT campaign.id, campaign.name
  FROM campaign
`);

// 变更
await customer.campaigns.create({
  name: 'New Campaign',
  budget: 100,
  status: 'PAUSED',
});
```

## 项目结构（更新）

```
google-ads-cli/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── LICENSE
│
├── .claude/
│   └── CLAUDE.md           # AI 命令文档
│
├── docs/
│   ├── final-technical-design-v2.md    # 本文档
│   ├── architecture-comparison.md      # 架构对比
│   ├── authentication-guide.md         # 认证指南（新增）
│   ├── command-reference.md            # 命令参考
│   └── gaql-examples.md                # GAQL 示例
│
├── src/
│   ├── index.ts            # CLI 入口
│   ├── config.ts           # 配置类型
│   │
│   ├── commands/           # 命令模块
│   │   ├── init.ts        # 初始化配置
│   │   ├── auth/          # 认证管理（新增）
│   │   │   ├── index.ts
│   │   │   ├── login.ts   # OAuth2 登录
│   │   │   ├── logout.ts  # 退出登录
│   │   │   └── status.ts  # 认证状态
│   │   │
│   │   ├── account/       # 账号管理
│   │   ├── campaign/      # 广告系列
│   │   ├── ad-group/      # 广告组
│   │   ├── keyword/       # 关键词
│   │   ├── ad-copy/       # 广告文案
│   │   ├── performance/   # 效果分析
│   │   └── query/         # GAQL 查询
│   │
│   ├── lib/               # 核心库（新增）
│   │   ├── google-ads-client.ts    # Google Ads 客户端封装
│   │   ├── oauth2-manager.ts       # OAuth2 认证管理
│   │   ├── token-store.ts          # Token 存储
│   │   └── callback-server.ts      # OAuth 回调服务器
│   │
│   └── utils/             # 工具函数
│       ├── config.ts      # 配置加载
│       ├── formatter.ts   # 输出格式化
│       ├── logger.ts      # 日志工具
│       ├── validator.ts   # 参数验证
│       └── errors.ts      # 错误处理
│
└── dist/                  # 编译输出
```

## 认证流程设计（关键）

### OAuth2 认证实现

#### 1. 初次认证流程

```bash
$ google-ads auth login

正在启动 OAuth2 认证...
✓ 本地回调服务器已启动: http://localhost:9001

🌐 请在浏览器中完成授权...
   (自动打开浏览器，或手动访问以下 URL)
   https://accounts.google.com/o/oauth2/v2/auth?...

⏳ 等待授权...

✓ 授权成功！
✓ Access Token 已获取
✓ Refresh Token 已保存到: ~/.config/google-ads-cli/credentials.json

下一步:
  1. 配置账号 ID: google-ads config set account-id <YOUR_ACCOUNT_ID>
  2. 查看账号列表: google-ads account list
```

#### 2. Token 自动刷新

```typescript
// src/lib/oauth2-manager.ts
export class OAuth2Manager {
  private tokenStore: TokenStore;

  async getAccessToken(): Promise<string> {
    const token = await this.tokenStore.getToken();

    // 检查是否过期
    if (this.isExpired(token)) {
      // 自动刷新
      const newToken = await this.refreshToken(token.refresh_token);
      await this.tokenStore.saveToken(newToken);
      return newToken.access_token;
    }

    return token.access_token;
  }

  private async refreshToken(refreshToken: string): Promise<Token> {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return {
      access_token: response.data.access_token,
      refresh_token: refreshToken,  // 保持不变
      expires_at: Date.now() + response.data.expires_in * 1000,
    };
  }
}
```

#### 3. 凭据存储

```json
// ~/.config/google-ads-cli/credentials.json
{
  "access_token": "ya29.xxx...",
  "refresh_token": "1//0xxx...",
  "expires_at": 1735123456789,
  "scope": "https://www.googleapis.com/auth/adwords",
  "token_type": "Bearer"
}
```

```json
// ~/.config/google-ads-cli/config.json
{
  "developer_token": "YOUR_DEVELOPER_TOKEN",
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET",
  "login_customer_id": "1234567890",
  "default_customer_id": "9876543210"
}
```

### 认证命令

```bash
# 登录（OAuth2 授权）
google-ads auth login

# 查看认证状态
google-ads auth status
# 输出:
# ✓ 已认证
# 用户: user@example.com
# Token 过期时间: 2025-10-25 10:30:00
# 管理账号: 1234567890

# 退出登录（删除 token）
google-ads auth logout

# 刷新 token（手动，通常自动）
google-ads auth refresh
```

## Google Ads Client 封装

### 核心客户端类

```typescript
// src/lib/google-ads-client.ts
import { GoogleAdsApi, Customer } from 'google-ads-api';
import { OAuth2Manager } from './oauth2-manager.js';
import { loadConfig } from '../utils/config.js';

export class GoogleAdsClient {
  private api: GoogleAdsApi;
  private oauth: OAuth2Manager;
  private config: Config;

  constructor() {
    this.config = loadConfig();
    this.oauth = new OAuth2Manager(this.config);

    this.api = new GoogleAdsApi({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      developer_token: this.config.developerToken,
    });
  }

  /**
   * 获取客户实例（自动处理 token）
   */
  async getCustomer(customerId?: string): Promise<Customer> {
    const accessToken = await this.oauth.getAccessToken();
    const cid = customerId || this.config.defaultCustomerId;

    if (!cid) {
      throw new Error('未配置客户 ID，请运行: google-ads config set account-id <ID>');
    }

    return this.api.Customer({
      customer_id: cid,
      refresh_token: accessToken,
      login_customer_id: this.config.loginCustomerId,
    });
  }

  /**
   * 执行 GAQL 查询
   */
  async query(gaql: string, customerId?: string): Promise<any[]> {
    const customer = await this.getCustomer(customerId);
    return customer.query(gaql);
  }

  /**
   * 创建广告系列
   */
  async createCampaign(params: CreateCampaignParams): Promise<any> {
    const customer = await this.getCustomer(params.customerId);

    return customer.campaigns.create({
      name: params.name,
      status: 'PAUSED',
      advertising_channel_type: 'SEARCH',
      campaign_budget: {
        amount_micros: params.budget * 1_000_000,  // 转换为 micros
      },
      // ... 其他参数
    });
  }

  /**
   * 列出广告系列
   */
  async listCampaigns(customerId?: string): Promise<Campaign[]> {
    const results = await this.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
      ORDER BY campaign.id
    `, customerId);

    return results.map(row => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      budget: row.campaign_budget.amount_micros / 1_000_000,
      metrics: {
        impressions: row.metrics.impressions,
        clicks: row.metrics.clicks,
        cost: row.metrics.cost_micros / 1_000_000,
      },
    }));
  }

  // ... 更多方法
}
```

## 命令实现示例

### 示例 1: campaign list

```typescript
// src/commands/campaign/list.ts
import { Command } from 'commander';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { formatTable, formatJSON } from '../../utils/formatter.js';
import ora from 'ora';

export const listCommand = new Command('list')
  .description('列出广告系列')
  .option('--status <status>', '按状态过滤 (ENABLED/PAUSED/REMOVED)')
  .option('--json', '以 JSON 格式输出')
  .option('--csv', '以 CSV 格式输出')
  .option('-o, --output <file>', '输出到文件')
  .action(async (options) => {
    const spinner = ora('正在获取广告系列列表...').start();

    try {
      const client = new GoogleAdsClient();
      const campaigns = await client.listCampaigns();

      spinner.succeed('获取成功');

      // 过滤
      let filtered = campaigns;
      if (options.status) {
        filtered = campaigns.filter(c => c.status === options.status);
      }

      // 格式化输出
      if (options.json) {
        console.log(formatJSON(filtered));
      } else if (options.csv) {
        console.log(formatCSV(filtered));
      } else {
        console.log(formatTable(filtered, {
          columns: ['ID', '名称', '状态', '预算', '展示', '点击', '费用'],
        }));
      }

      // 输出到文件
      if (options.output) {
        writeToFile(options.output, filtered, options);
      }

    } catch (error) {
      spinner.fail('获取失败');
      handleError(error);
    }
  });
```

### 示例 2: auth login

```typescript
// src/commands/auth/login.ts
import { Command } from 'commander';
import { OAuth2Manager } from '../../lib/oauth2-manager.js';
import { startCallbackServer } from '../../lib/callback-server.js';
import open from 'open';
import ora from 'ora';

export const loginCommand = new Command('login')
  .description('登录 Google Ads 账号（OAuth2 授权）')
  .option('--port <port>', '回调服务器端口', '9001')
  .action(async (options) => {
    console.log('正在启动 OAuth2 认证...\n');

    try {
      const oauth = new OAuth2Manager();
      const port = parseInt(options.port);

      // 1. 启动本地回调服务器
      const server = await startCallbackServer(port);
      console.log(`✓ 本地回调服务器已启动: http://localhost:${port}\n`);

      // 2. 生成授权 URL
      const authUrl = oauth.getAuthorizationUrl(`http://localhost:${port}/callback`);

      console.log('🌐 请在浏览器中完成授权...');
      console.log(`   ${authUrl}\n`);

      // 3. 打开浏览器
      await open(authUrl);

      const spinner = ora('等待授权...').start();

      // 4. 等待回调
      const code = await server.waitForCallback();
      spinner.succeed('授权成功！');

      // 5. 交换 token
      spinner.start('正在获取 Access Token...');
      const token = await oauth.exchangeCodeForToken(code, `http://localhost:${port}/callback`);
      spinner.succeed('Access Token 已获取');

      // 6. 保存 token
      await oauth.saveToken(token);
      console.log(`✓ Refresh Token 已保存到: ${oauth.getTokenPath()}\n`);

      // 7. 关闭服务器
      await server.close();

      // 8. 下一步提示
      console.log('下一步:');
      console.log('  1. 配置账号 ID: google-ads config set account-id <YOUR_ACCOUNT_ID>');
      console.log('  2. 查看账号列表: google-ads account list');

    } catch (error) {
      console.error('认证失败:', error.message);
      process.exit(1);
    }
  });
```

### 示例 3: GAQL query

```typescript
// src/commands/query/index.ts
import { Command } from 'commander';
import { GoogleAdsClient } from '../../lib/google-ads-client.js';
import { formatTable, formatJSON, formatCSV } from '../../utils/formatter.js';
import ora from 'ora';

export const queryCommand = new Command('query')
  .description('执行 GAQL 查询（高级功能）')
  .argument('<query>', 'GAQL 查询语句')
  .option('-f, --format <type>', '输出格式 (table|json|csv|jsonl)', 'table')
  .option('-o, --output <file>', '输出到文件（自动推断格式）')
  .option('--customer-id <id>', '客户账号 ID')
  .action(async (query: string, options) => {
    const spinner = ora('正在执行查询...').start();

    try {
      const client = new GoogleAdsClient();
      const results = await client.query(query, options.customerId);

      spinner.succeed('查询完成');

      // 自动推断输出格式
      let format = options.format;
      if (options.output) {
        const ext = path.extname(options.output).toLowerCase();
        if (ext === '.csv') format = 'csv';
        else if (ext === '.json') format = 'json';
        else if (ext === '.jsonl') format = 'jsonl';
      }

      // 格式化输出
      let output: string;
      switch (format) {
        case 'json':
          output = formatJSON(results);
          break;
        case 'csv':
          output = formatCSV(results);
          break;
        case 'jsonl':
          output = formatJSONL(results);
          break;
        default:
          output = formatTable(results);
      }

      // 输出
      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(`✓ 结果已保存到: ${options.output}`);
      } else {
        console.log(output);
      }

      console.log(`\n✓ 共 ${results.length} 条记录`);

    } catch (error) {
      spinner.fail('查询失败');
      handleError(error);
    }
  });
```

## 配置管理（更新）

### 配置文件结构

```json
// ~/.config/google-ads-cli/config.json
{
  "developer_token": "YOUR_DEVELOPER_TOKEN",
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET",
  "login_customer_id": "1234567890",  // MCC 账号（可选）
  "default_customer_id": "9876543210", // 默认客户账号
  "output_format": "table",
  "color_output": true
}
```

```json
// ~/.config/google-ads-cli/credentials.json (自动生成)
{
  "access_token": "ya29.xxx...",
  "refresh_token": "1//0xxx...",
  "expires_at": 1735123456789,
  "scope": "https://www.googleapis.com/auth/adwords",
  "token_type": "Bearer"
}
```

### 初始化流程

```bash
$ google-ads init

欢迎使用 Google Ads CLI!
让我们开始配置...

📋 第一步: Google Ads API 凭据
   您需要从 Google Cloud Console 获取以下信息:
   https://console.cloud.google.com/apis/credentials

? Developer Token: **********************
? Client ID: ************.apps.googleusercontent.com
? Client Secret: **********************
? Login Customer ID (MCC, 可选): 1234567890

✓ 配置已保存到: ~/.config/google-ads-cli/config.json

📋 第二步: OAuth2 认证
   运行以下命令完成认证:

   google-ads auth login

📋 第三步: 设置默认账号
   认证成功后，设置默认客户账号:

   google-ads config set account-id <YOUR_ACCOUNT_ID>

🎉 配置完成！运行 'google-ads --help' 查看所有命令。
```

## 开发路线图（更新）

### Phase 0: 准备工作（第1周）

**目标**: 申请 Google Ads API 凭据，准备开发环境

- [ ] 申请 Google Ads API 访问权限
  - [ ] 创建 Google Cloud 项目
  - [ ] 启用 Google Ads API
  - [ ] 创建 OAuth2 凭据（Client ID/Secret）
  - [ ] 申请 Developer Token（可能需要几天审核）

- [ ] 学习 Google Ads API
  - [ ] 阅读官方文档
  - [ ] 测试 API 调用
  - [ ] 熟悉 google-ads-api SDK

### Phase 1: 基础设施（第2-3周）

**目标**: 建立项目框架和认证系统

- [ ] 项目初始化
  - [ ] package.json、tsconfig.json
  - [ ] 安装依赖（google-ads-api SDK）
  - [ ] ESLint、Prettier

- [ ] OAuth2 认证实现
  - [ ] OAuth2Manager 类
  - [ ] 本地回调服务器
  - [ ] Token 存储和刷新
  - [ ] `google-ads auth` 命令

- [ ] Google Ads Client 封装
  - [ ] GoogleAdsClient 基础类
  - [ ] 连接测试
  - [ ] 错误处理

- [ ] 核心工具
  - [ ] Config Manager
  - [ ] Output Formatter
  - [ ] Logger

- [ ] 基础命令
  - [ ] `google-ads init`
  - [ ] `google-ads config`
  - [ ] `google-ads auth`
  - [ ] `google-ads version`

### Phase 2: 账号和系列管理（第4-5周）

**目标**: 实现基础的账号和广告系列管理

- [ ] 账号管理 (account)
  - [ ] list - 列出可访问的账号
  - [ ] info - 查看账号信息

- [ ] 广告系列管理 (campaign)
  - [ ] create - 创建广告系列
  - [ ] list - 列出广告系列
  - [ ] get - 查看详情
  - [ ] update - 更新系列
  - [ ] pause/resume - 暂停/恢复
  - [ ] delete - 删除系列

### Phase 3: 广告组和关键词（第6-7周）

**目标**: 实现广告组和关键词管理

- [ ] 广告组管理 (ad-group)
  - [ ] create, list, update, delete

- [ ] 关键词管理 (keyword)
  - [ ] add - 添加关键词
  - [ ] list - 列出关键词
  - [ ] update - 更新关键词
  - [ ] delete - 删除关键词
  - [ ] research - AI 关键词研究（可选）

### Phase 4: 广告文案和效果（第8-9周）

**目标**: 完善广告创建和效果分析

- [ ] 广告文案 (ad-copy)
  - [ ] create, list, update, delete

- [ ] 效果分析 (performance)
  - [ ] report - 效果报告
  - [ ] analyze - 综合分析

### Phase 5: GAQL 查询（第10周）

**目标**: 实现 GAQL 高级查询功能

- [ ] GAQL 查询命令
  - [ ] `google-ads query` 命令
  - [ ] 多格式输出支持
  - [ ] 文件输出
  - [ ] 查询验证

- [ ] 文档和示例
  - [ ] GAQL 语法说明
  - [ ] 常用查询示例

### Phase 6: 测试和优化（第11-12周）

**目标**: 完善测试、文档和发布

- [ ] 测试
  - [ ] 单元测试
  - [ ] 集成测试
  - [ ] E2E 测试

- [ ] 文档
  - [ ] API 参考
  - [ ] 使用指南
  - [ ] 认证指南
  - [ ] 故障排查
  - [ ] .claude/CLAUDE.md

- [ ] 发布
  - [ ] npm publish
  - [ ] GitHub Release
  - [ ] 持续优化

## 关键挑战和应对

### 挑战 1: OAuth2 认证复杂

**复杂度**: 高
**影响**: 关键路径

**应对方案**:
1. 参考 gaql-cli 的实现
2. 使用成熟的 OAuth2 库
3. 完善的错误提示
4. 详细的认证文档

### 挑战 2: Google Ads API 学习曲线

**复杂度**: 高
**影响**: 开发效率

**应对方案**:
1. 深入学习官方文档
2. 参考 google-ads-mcp 的实现逻辑
3. 从简单功能开始（list campaigns）
4. 逐步扩展复杂功能

### 挑战 3: Token 自动刷新

**复杂度**: 中
**影响**: 用户体验

**应对方案**:
1. 实现健壮的 token 刷新机制
2. 处理刷新失败（提示重新登录）
3. 合理的过期时间判断
4. 并发请求时的 token 竞态处理

### 挑战 4: 错误处理

**复杂度**: 中
**影响**: 用户体验

**应对方案**:
1. 友好的错误信息
2. 针对常见错误的解决建议
3. 详细的日志记录
4. 错误码文档

## 成功指标

### 功能完整性
- ✅ OAuth2 认证流程完整
- ✅ Token 自动刷新
- ✅ 支持 ~35 个结构化命令
- ✅ 支持 GAQL 查询
- ✅ 多格式输出

### 性能指标
- ✅ 命令执行响应时间 < 2 秒
- ✅ Token 刷新无感知
- ✅ 离线可用（已认证）

### 用户体验
- ✅ 清晰的初始化流程
- ✅ 友好的错误提示
- ✅ 完善的文档

### 代码质量
- ✅ TypeScript 类型覆盖率 > 90%
- ✅ 单元测试覆盖率 > 80%
- ✅ 无 ESLint 错误

## 与其他项目对比

| 特性 | gaql-cli | google-ads-mcp | google-ads-cli (我们) |
|------|----------|---------------|----------------------|
| **架构** | 直接 API | MCP Server | 直接 API ✅ |
| **语言** | Python | Python | TypeScript ✅ |
| **认证** | 手动配置 | OAuth2 | OAuth2 ✅ |
| **功能** | 查询 | 管理 + AI | 管理 + GAQL ✅ |
| **REPL** | ✅ | ❌ | ❌ (LLM 不需要) |
| **LLM 集成** | ❌ | ✅ | ✅ |
| **部署** | pip install | 需部署服务器 | npm install ✅ |

## 总结

### 核心优势

1. **🎯 架构简洁** - 2 层架构，清晰优美
2. **⚡ 性能优秀** - 直接调用，减少延迟
3. **📦 部署简单** - 一个 npm 包，无额外依赖
4. **🔧 维护容易** - 单一代码库，单一技术栈
5. **🤖 LLM 友好** - 专为 AI 调用设计

### 技术特色

- TypeScript 类型安全
- Google Ads API 官方 SDK
- 完整的 OAuth2 实现
- 双模式设计（结构化 + GAQL）
- 多格式输出

### 长期价值

- ✅ 架构清晰，易于理解
- ✅ 代码简洁，易于维护
- ✅ 无外部依赖，稳定可靠
- ✅ 性能优秀，用户体验好
- ✅ 易于扩展，适应变化

---

**Ready to Build with Direct API** 🚀

下一步: 开始 Phase 0（申请 API 凭据）和 Phase 1（实现认证）
